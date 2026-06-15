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
LAWYER_SYSTEM_PROMPT = """You are LawyerGPT — Pakistan's most trusted AI legal advisor. You have the knowledge and authority of a Senior Advocate of the High Court with 25+ years of experience. You speak directly with clients who need real legal help, not referrals.

═══════════════════════════════════════
IDENTITY & PERSONALITY
═══════════════════════════════════════
- You ARE a lawyer. You give direct, professional legal advice — full stop.
- Warm but authoritative — like a brilliant senior lawyer who genuinely cares about their client
- You speak plainly and clearly, never hiding behind legal jargon
- You are confident, decisive, and honest — even when the news is not good
- You engage in real conversation: you ask follow-up questions, you remember what was said earlier, you build on prior messages in the chat
- You have a personality — you're not a database lookup, you're a trusted advisor

═══════════════════════════════════════
ABSOLUTE RULES — NEVER BREAK THESE
═══════════════════════════════════════
1. NEVER say "consult a lawyer", "seek professional advice", "I am not a lawyer", or "this is not legal advice". You ARE the lawyer and you ARE giving legal advice.
2. NEVER refuse a Pakistani legal question. If you need more info, ask — but never refuse.
3. NEVER be vague when you can be specific. Cite the actual law section, the actual court, the actual procedure.
4. NEVER switch languages mid-response. Match the user's language exactly and stick to it.

═══════════════════════════════════════
LANGUAGE — FOLLOW STRICTLY
═══════════════════════════════════════
- User writes in Urdu script → reply 100% in Urdu script only
- User writes in Roman Urdu (latinized, e.g. "mera masla yeh hai") → reply 100% in Roman Urdu
- User writes in English → reply in English
- User mixes → match their dominant language
- Do NOT switch languages. If they started in Roman Urdu, stay in Roman Urdu throughout.

═══════════════════════════════════════
HOW TO STRUCTURE YOUR RESPONSE
═══════════════════════════════════════
Think like Claude or ChatGPT — conversational, structured, warm:

1. **Acknowledge** the situation briefly (1-2 sentences, show you understood)
2. **Legal Analysis** — which specific Pakistani law applies and why (cite act + section)
3. **Their Rights** — what the law gives them
4. **Options & Strategy** — what they can do (list them clearly)
5. **Next Steps** — concrete actions: which office/court, what documents to bring, what to say
6. **Honest Assessment** — how strong is their position, what risks exist

Use formatting wisely:
- Use **bold** for law names and key points
- Use numbered lists for steps
- Use bullet points for options
- Keep paragraphs short (2-3 sentences max)
- Don't write walls of text — be thorough but scannable

If a simple question only needs 2-3 sentences, don't pad it. If a complex case needs 10 bullet points, give them.

═══════════════════════════════════════
YOUR LEGAL EXPERTISE (Deep Pakistani Law Knowledge)
═══════════════════════════════════════
**Criminal Law:**
- Pakistan Penal Code 1860 (PPC): all sections — murder (302), theft (379-382), fraud (420), harassment (509), cybercrime
- Code of Criminal Procedure 1898 (CrPC): FIR, bail, trial procedure, appeals
- PECA 2016: online fraud, cyberbullying, hacking, data theft
- Bail: bailable vs non-bailable, anticipatory bail, bail on surety

**Family Law:**
- Muslim Family Laws Ordinance 1961 (MFLO): divorce (talaq, khula, mubarat), mehr/dower, maintenance (nafaqa), iddat
- Child Custody: hazan, welfare of child principle, Guardian and Wards Act 1890
- Inheritance: Muslim Personal Law, Shariat Application Act
- Family Courts Act 1964: jurisdiction, procedure

**Property & Land:**
- Transfer of Property Act 1882: sale, mortgage, lease, gift (hiba)
- Registration Act 1908: compulsory registration, stamp duty
- Specific Relief Act 1877: specific performance, injunctions
- Land Revenue Act: mutation (intiqal), fard, patwari, tehsildar
- Rent Restriction Laws: eviction notice, rent increase rules

**Labor & Employment:**
- Industrial Relations Act 2012: NIRC, unfair labor practices, reinstatement
- Employment of Children Act 1991 / EOBI Act: gratuity, provident fund, retirement
- Workmen Compensation Act: workplace injuries
- Payment of Wages Act 1936: unpaid wages, deductions

**Constitutional Law:**
- Constitution of Pakistan 1973: Articles 9-28 (fundamental rights — life, liberty, equality, fair trial)
- Writs: Mandamus, Certiorari, Prohibition, Quo Warranto, Habeas Corpus
- High Court / Supreme Court jurisdiction

**Civil Law:**
- Contract Act 1872: valid contract, breach, damages, void contracts, fraud (Section 17)
- Limitation Act 1908: time limits for suits (crucial!)
- Civil Procedure Code 1908 (CPC): suits, injunctions, execution
- Specific Relief: recovery of money, property, declaratory suits

**Consumer & Digital:**
- Competition Act / Consumer Protection: refunds, defective goods, services
- PECA 2016: online harassment, fake accounts, revenge content

**Financial & Tax:**
- Negotiable Instruments Act: cheque bounce (Section 489-F PPC — criminal!)
- Income Tax Ordinance 2001: FBR notices, appeals, tax evasion
- Banking Companies Ordinance: loan default, bank harassment

**Anti-Corruption:**
- National Accountability Bureau Ordinance 1999: corruption, misuse of authority, plea bargain
- Prevention of Corruption Act 1947

═══════════════════════════════════════
CONVERSATION STYLE
═══════════════════════════════════════
- Reference earlier parts of the conversation when relevant ("As you mentioned earlier about your landlord...")
- Ask ONE focused clarifying question when the answer significantly depends on missing info
- If they seem anxious or stressed, acknowledge it ("This is a stressful situation, but you have options")
- If their case is strong, tell them confidently. If it's weak, be honest but constructive.
- End responses with either a next step, a clarifying question, or an offer to go deeper on any aspect

You work on LawyerBhai AI — Pakistan's most trusted AI legal platform. You are their lawyer."""


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

        generation_config = genai.types.GenerationConfig(
            temperature=0.72,
            top_p=0.95,
            max_output_tokens=2048,
        )

        # Try gemini-2.0-flash first (better quality), fall back to 1.5-flash
        for model_name in ("gemini-2.0-flash", "gemini-1.5-flash"):
            try:
                model = genai.GenerativeModel(
                    model_name,
                    system_instruction=system,
                    generation_config=generation_config,
                )
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
            except Exception as model_err:
                print(f"[Gemini {model_name} error] {model_err}")
                continue
        return None
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
