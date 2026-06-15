"""
Lawyer Bhai AI — Backend API
FastAPI server: Laws search, NLP analysis, OCR, accuracy scoring.
Run: uvicorn main:app --reload --port 8000
"""
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from laws_engine import init_db, get_all_laws, find_laws, calculate_win_probability
from ocr_engine import extract_text
import paklaw_client


def smart_find_laws(query: str, category: str = None, top_n: int = 5):
    """PakLaw API (live, full corpus) first; local engine as fallback."""
    results = paklaw_client.search_laws(query, category=category, top=top_n)
    if results:
        return results
    return find_laws(query, category=category, top_n=top_n)

# ── DB path: use /data on Render (persistent disk), else local ──
import laws_engine
if os.path.exists("/data"):
    laws_engine.DB_PATH = "/data/laws.db"

# ─── App init ──────────────────────────────────────────────────
app = FastAPI(
    title="Lawyer Bhai AI — Laws API",
    description="Pakistani legal AI backend.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    print("[OK] Laws DB initialized")


# ─── Models ────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    text: str
    category: Optional[str] = None
    reply_lang: Optional[str] = "en"   # en | roman-ur | ur

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []
    reply_lang: Optional[str] = "en"   # en | roman-ur | ur


# ─── LawyerGPT System Prompt ───────────────────────────────────
LAWYER_SYSTEM_PROMPT = """You are LawyerGPT — an expert Pakistani lawyer and legal advisor with 20+ years of experience. You are speaking directly with a client who needs legal help.

CORE RULES (never break these):
1. You ARE the lawyer. Give direct legal advice. NEVER say "consult a lawyer", "seek legal counsel", "I'm not a lawyer", or "this is not legal advice". You ARE the qualified legal expert.
2. Mirror the user's language exactly:
   - Urdu script (اردو) → reply fully in Urdu script
   - Roman Urdu (latinized Urdu like "mera masla", "kya karna chahiye") → reply in Roman Urdu
   - English → reply in English
   - Mixed language → match their mix naturally
3. Be warm, conversational, and clear — like a trusted senior lawyer who genuinely cares. Not formal, not robotic.
4. Give specific, actionable next steps. Tell them exactly what to do.

YOUR LEGAL EXPERTISE (Pakistani Law):
- Criminal Law (PPC 1860): FIR procedure, bail (bailable/non-bailable), defenses, appeals
- Family Law: MFLO 1961, divorce (talaq/khula), child custody (hazan), maintenance (nafaqa), mehr/dower
- Property Law: sale deeds, mutation (intiqal), illegal possession, eviction, co-ownership disputes
- Labor Law: NIRC, wrongful termination, unpaid wages, gratuity, EOBI, workplace harassment
- Constitutional Law: fundamental rights (Articles 9-28), writ petitions, High Court/Supreme Court
- Civil Law: contracts, fraud, breach, recovery suits, limitation periods
- Consumer Protection: defective goods, service failures, CCPA complaints
- Cyber Crime: PECA 2016, online harassment, data theft, digital fraud
- Corruption/NAB: accountability, plea bargains, asset declarations

HOW TO RESPOND:
- Start by acknowledging their situation empathetically (1 sentence)
- Explain clearly which Pakistani law applies and why
- State their rights and legal options directly
- Give practical next steps with specifics (which court, which office, what documents)
- For criminal matters: explain FIR process, bail rights, potential punishments, defenses
- For family matters: explain procedure, required documents, which court (Union Council vs Family Court)
- Assess case strength honestly but diplomatically
- Keep it focused and readable — use short paragraphs, avoid walls of text
- If you need more details to give better advice, ask one focused question

You work on LawyerBhai AI — Pakistan's trusted AI legal assistant."""


def _build_law_context(laws: list) -> str:
    if not laws:
        return ""
    ctx = "Relevant Pakistani laws identified for this query:\n"
    for i, law in enumerate(laws[:3], 1):
        ctx += f"\n{i}. {law['act_name']} — {law['section_num']}: {law['title']}\n"
        ctx += f"   {law['text_en'][:300]}\n"
        if law.get("punishment"):
            ctx += f"   Punishment: {law['punishment']}\n"
        if law.get("bailable") is not None:
            bail = "Yes (qabile zamaanat)" if law["bailable"] else "No (na-qabile zamaanat)"
            ctx += f"   Bailable: {bail}\n"
    return ctx


def _call_gemini(history_msgs: list, system: str) -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=system)

        # Gemini history format: alternating user/model, must start with user
        gemini_history = []
        for msg in history_msgs[:-1]:
            role = "model" if msg["role"] in ("ai", "assistant", "model") else "user"
            content = msg.get("content", "")
            if content.strip():
                gemini_history.append({"role": role, "parts": [content]})

        # Gemini requires history to start with 'user'
        while gemini_history and gemini_history[0]["role"] == "model":
            gemini_history.pop(0)

        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(history_msgs[-1]["content"])
        return response.text
    except Exception as e:
        print(f"[Gemini error] {e}")
        return None


def _call_groq(history_msgs: list, system: str) -> Optional[str]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        messages = [{"role": "system", "content": system}]
        for msg in history_msgs:
            role = "assistant" if msg["role"] in ("ai", "model", "assistant") else "user"
            content = msg.get("content", "")
            if content.strip():
                messages.append({"role": role, "content": content})

        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[Groq error] {e}")
        return None


def _template_chat_fallback(message: str, matched: list, lang: str) -> str:
    """Original template-based response — used only if both LLMs are unavailable."""
    if not matched:
        return {
            "ur": "معذرت — اس سوال سے متعلق کوئی مخصوص پاکستانی قانون نہیں ملا۔ اپنا مسئلہ تھوڑا تفصیل سے بتائیں۔",
            "roman-ur": "Maafi chahta hun — is sawaal se mutabiq koi specific Pakistani qanoon nahi mila. Apna masla thoda tafseel se batayein.",
            "en": "Sorry — I couldn't find a specific Pakistani law matching this question. Could you describe your situation in a bit more detail?",
        }.get(lang, "Please describe your situation in more detail.")

    top = matched[0]
    title = top["title"]
    act = top["act_name"]
    sec = top["section_num"]
    body = top["text_en"][:350]
    punishment = top.get("punishment")
    win = calculate_win_probability(message, matched)["win_pct"]

    if lang == "ur":
        response = f"آپ کے سوال کے مطابق، **{act} — {sec}**: {title}\n\n{body}...\n\n"
        if punishment:
            response += f"**سزا**: {punishment}\n\n"
        response += f"**آپ کے کیس کی مضبوطی**: {win}%"
    elif lang == "roman-ur":
        response = f"Aapke sawaal ke mutabiq, **{act} — {sec}**: {title}\n\n{body}...\n\n"
        if punishment:
            response += f"**Saza**: {punishment}\n\n"
        response += f"**Aapke case ki mazbooti**: {win}%"
    else:
        response = f"Based on your question, **{act} — {sec}**: {title}\n\n{body}...\n\n"
        if punishment:
            response += f"**Punishment**: {punishment}\n\n"
        response += f"**Case strength**: {win}%"

    return response


# ─── Health Check ──────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "service": "Lawyer Bhai AI", "version": "2.0.0"}


# ─── GET /laws ─────────────────────────────────────────────────
@app.get("/laws")
def list_laws(
    category: Optional[str] = Query(None),
    limit: int = Query(50, le=200)
):
    all_laws = get_all_laws()
    if category:
        all_laws = [l for l in all_laws if l["category"].lower() == category.lower()]
    return {"total": len(all_laws), "laws": all_laws[:limit]}


# ─── GET /laws/categories ──────────────────────────────────────
@app.get("/laws/categories")
def get_categories():
    all_laws = get_all_laws()
    cats = {}
    for l in all_laws:
        cats[l["category"]] = cats.get(l["category"], 0) + 1
    return {"categories": cats}


# ─── GET /laws/search ──────────────────────────────────────────
@app.get("/laws/search")
def search_laws(
    q: str = Query(...),
    category: Optional[str] = None,
    top: int = Query(5, le=10)
):
    if not q.strip():
        raise HTTPException(400, "Query cannot be empty")
    results = smart_find_laws(q, category=category, top_n=top)
    return {"query": q, "total": len(results), "laws": results}


# ─── POST /analyze ─────────────────────────────────────────────
@app.post("/analyze")
def analyze_case(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(400, "Text cannot be empty")

    matched = smart_find_laws(req.text, category=req.category, top_n=5)
    accuracy = calculate_win_probability(req.text, matched)

    lang = (req.reply_lang or "en").lower()

    if matched:
        top_law = matched[0]
        category = top_law["category"]
        advice = _generate_advice(req.text, matched, category, lang)
    else:
        advice = {
            "ur": "آپ کے مسئلے سے متعلق کوئی پاکستانی قانون نہیں ملا۔ اپنا مسئلہ تھوڑا تفصیل سے بیان کریں۔",
            "roman-ur": "Aapke masle ke liye relevant Pakistani qanoon nahi mila. Apna masla thoda tafseel se bayaan karein.",
            "en": "No relevant Pakistani law found for your problem. Please describe your situation in more detail.",
        }.get(lang, "No relevant Pakistani law found. Please describe your situation.")

    return {
        "query": req.text,
        "matched_laws": matched,
        "accuracy": accuracy,
        "advice": advice,
    }


# ─── POST /ocr ─────────────────────────────────────────────────
@app.post("/ocr")
async def ocr_document(file: UploadFile = File(...)):
    allowed = {".pdf", ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""

    if ext not in allowed:
        raise HTTPException(400, f"File type '{ext}' not supported.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 10MB.")

    extracted_text = extract_text(content, file.filename)

    if extracted_text.startswith("["):
        raise HTTPException(500, extracted_text)

    matched = smart_find_laws(extracted_text, top_n=5)
    accuracy = calculate_win_probability(extracted_text, matched)

    return {
        "filename": file.filename,
        "extracted_text": extracted_text[:3000],
        "char_count": len(extracted_text),
        "matched_laws": matched,
        "accuracy": accuracy,
        "disclaimer": "Ye analysis sirf maloomat ke liye hai."
    }


# ─── POST /chat ────────────────────────────────────────────────
@app.post("/chat")
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    matched = smart_find_laws(req.message, top_n=3)
    accuracy = calculate_win_probability(req.message, matched)
    lang = (req.reply_lang or "en").lower()

    # Build system prompt enriched with relevant law context
    law_context = _build_law_context(matched)
    system = LAWYER_SYSTEM_PROMPT
    if law_context:
        system += f"\n\n{law_context}"

    # Build message list for LLM (last 8 messages for context window)
    llm_msgs = []
    for h in (req.history or [])[-8:]:
        role = h.get("role", "user")
        content = h.get("content", "")
        if content.strip():
            llm_msgs.append({"role": role, "content": content})
    llm_msgs.append({"role": "user", "content": req.message})

    # Gemini (primary) → Groq (fallback) → template (last resort)
    ai_provider = "rule-based"
    response = _call_gemini(llm_msgs, system)
    if response:
        ai_provider = "gemini"
    else:
        response = _call_groq(llm_msgs, system)
        if response:
            ai_provider = "groq"

    if not response:
        response = _template_chat_fallback(req.message, matched, lang)

    return {"reply": response, "matched_laws": matched, "accuracy": accuracy, "ai_provider": ai_provider}


# ─── Advice generator (language-aware) ─────────────────────────
_ADVICE = {
    "Criminal": {
        "en":       ("In your case, {b} applies. ", "If you want to file an FIR, visit the nearest police station. {bail}"),
        "roman-ur": ("Aapke case mein {b} laagu hota hai. ", "Agar aap FIR darj karna chahte hain to nazdeeqi police station jayein. {bail}"),
        "ur":       ("آپ کے کیس میں {b} لاگو ہوتا ہے۔ ", "اگر آپ FIR درج کرنا چاہتے ہیں تو قریبی پولیس اسٹیشن جائیں۔ {bail}"),
    },
    "Family": {
        "en":       ("Your problem falls under {b}. ", "First step: file an application in the Union Council or Family Court. Keep documents (CNIC, Nikahnama) ready."),
        "roman-ur": ("Aapka masla {b} ke tehat aata hai. ", "Pehla qadam: Union Council ya Family Court mein application dein. CNIC, Nikahnama tayyar rakhein."),
        "ur":       ("آپ کا مسئلہ {b} کے تحت آتا ہے۔ ", "پہلا قدم: یونین کونسل یا فیملی کورٹ میں درخواست دیں۔ شناختی کارڈ، نکاح نامہ تیار رکھیں۔"),
    },
    "Property": {
        "en":       ("In your property matter, {b} applies. ", "Keep all documents (sale deed, mutation, fard) safe."),
        "roman-ur": ("Aapke property masle mein {b} laagu hota hai. ", "Tamam dastawezaat (sale deed, mutation, fard) mahfooz rakhein."),
        "ur":       ("آپ کے جائیداد کے معاملے میں {b} لاگو ہوتا ہے۔ ", "تمام دستاویزات (سیل ڈیڈ، انتقال، فرد) محفوظ رکھیں۔"),
    },
    "Labor": {
        "en":       ("In your employment matter, {b} applies. ", "You can file a complaint at NIRC. Keep salary slips and contract safe."),
        "roman-ur": ("Aapke rozgar masle mein {b} laagu hoti hai. ", "NIRC mein complaint file kar sakte hain. Salary slips aur contract mahfooz rakhein."),
        "ur":       ("آپ کے روزگار کے معاملے میں {b} لاگو ہوتا ہے۔ ", "NIRC میں شکایت درج کر سکتے ہیں۔ تنخواہ سلپس اور کنٹریکٹ محفوظ رکھیں۔"),
    },
    "Civil": {
        "en":       ("In your matter, {b} applies. ", "A suit can be filed in Civil Court. Mind the limitation period."),
        "roman-ur": ("Aapke masle mein {b} laagu hota hai. ", "Civil Court mein suit file kiya ja sakta hai. Limitation period ka khayal rakhein."),
        "ur":       ("آپ کے معاملے میں {b} لاگو ہوتا ہے۔ ", "سول کورٹ میں دعویٰ دائر کیا جا سکتا ہے۔ میعاد کا خیال رکھیں۔"),
    },
    "Constitutional": {
        "en":       ("Your matter relates to {b}. ", "For violation of fundamental rights, a writ petition can be filed in the High Court."),
        "roman-ur": ("Aapka masla {b} se mutabiq hai. ", "Bunyadi haqooq ki khalaf warzi par High Court mein writ petition dakhil ki ja sakti hai."),
        "ur":       ("آپ کا مسئلہ {b} سے متعلق ہے۔ ", "بنیادی حقوق کی خلاف ورزی پر ہائی کورٹ میں رٹ درخواست دائر کی جا سکتی ہے۔"),
    },
    "_default": {
        "en":       ("In your case, {b} applies. ", "Here are your legal options based on Pakistani law."),
        "roman-ur": ("Aapke case mein {b} laagu hoti hai. ", "Pakistani qanoon ke mutabiq aapke paas ye options hain."),
        "ur":       ("آپ کے کیس میں {b} لاگو ہوتا ہے۔ ", "پاکستانی قانون کے مطابق آپ کے پاس یہ اختیارات ہیں۔"),
    },
}

_BAIL = {
    "en":       {True: "This is a bailable offence.", False: "This is a non-bailable offence — apply for bail in court."},
    "roman-ur": {True: "Ye ek qabile zamaanat jurm hai.", False: "Ye ek na-qabile zamaanat jurm hai — bail ke liye court mein darkhwast dein."},
    "ur":       {True: "یہ قابلِ ضمانت جرم ہے۔", False: "یہ ناقابلِ ضمانت جرم ہے — ضمانت کے لیے عدالت میں درخواست دیں۔"},
}

def _generate_advice(query: str, laws: List[dict], category: str, lang: str = "en") -> str:
    if lang not in ("en", "roman-ur", "ur"):
        lang = "en"
    top = laws[0]
    sec = top['section_num']
    sec_label = sec if sec.lower().startswith(("section", "article")) else f"Section {sec}"
    base = f"**{top['act_name']} {sec_label}** ({top['title']})"

    tmpl = _ADVICE.get(category, _ADVICE["_default"])[lang]
    intro, action = tmpl
    bail_txt = ""
    if "{bail}" in action:
        bail_txt = _BAIL[lang][bool(top.get("bailable"))]
    return intro.format(b=base) + f"{top['text_en'][:280]}... " + action.format(bail=bail_txt)
