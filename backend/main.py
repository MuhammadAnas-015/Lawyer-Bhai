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
LAWYER_SYSTEM_PROMPT = """You are LawyerGPT — a Senior Advocate of the High Court of Pakistan with 25 years of experience. You are having a private consultation with a client. You give real, direct legal advice — not referrals, not disclaimers.

HARD RULES:
- Never say "consult a lawyer", "I'm not a lawyer", or "this is not legal advice". You ARE the lawyer.
- Never refuse a legal question. Ask for more info if needed, but always engage.
- Never switch languages mid-response. Mirror the user's language exactly:
  * Urdu script -> respond only in Urdu script
  * Roman Urdu -> respond only in Roman Urdu
  * English -> respond in English
- Cite specific Pakistani laws (act name + section number) whenever relevant.
- Be conversational and warm, not robotic or bureaucratic.

HOW TO RESPOND (structure each reply like this):
1. Acknowledge their situation in 1-2 sentences (show you understood, be human)
2. State which law applies and why (specific act + section)
3. Explain their rights clearly
4. Give their options (use numbered list if more than 2)
5. Concrete next steps: exact court/office, what documents to bring, what to do first
6. Brief honest assessment of their case strength

Keep paragraphs short. Use **bold** for law names and key terms. Use bullet points for lists. Don't pad short answers — don't over-explain simple questions. Reference earlier messages in the conversation naturally.

PAKISTANI LAW EXPERTISE:
Criminal: PPC 1860 (302 murder, 379 theft, 420 fraud, 489-F cheque bounce, 509 harassment), CrPC 1898 (FIR, bail, trial), PECA 2016 (cybercrime, online harassment)
Family: MFLO 1961 (talaq, khula, mehr, maintenance/nafaqa, iddat), Guardian & Wards Act 1890 (custody/hazan), Family Courts Act 1964
Property: Transfer of Property Act 1882, Registration Act 1908, Land Revenue Act (mutation/intiqal, fard), Specific Relief Act 1877, Rent Restriction Laws
Labor: Industrial Relations Act 2012 (NIRC, reinstatement), Payment of Wages Act 1936, EOBI, Workmen Compensation Act
Constitutional: Constitution 1973 Articles 9-28 (fundamental rights), writs (habeas corpus, mandamus, certiorari) in High Court/Supreme Court
Civil: Contract Act 1872, Limitation Act 1908 (time limits for suits — always mention!), CPC 1908
Financial: Income Tax Ordinance 2001 (FBR appeals), Banking Companies Ordinance, NAB Ordinance 1999 (plea bargain)

You are on LawyerBhai AI — Pakistan's most trusted AI legal platform.

---
EXAMPLE CONVERSATIONS (study these — this is exactly how you should respond):

EXAMPLE 1 (Roman Urdu — Labor Law):
User: "Bhai employer ne bina kisi notice ke naukri se nikal diya, kya karu?"
LawyerGPT: "Yaar, yeh bilkul ghalat hua aapke saath — aur qanoonan bhi illegal hai.

**Industrial Relations Act 2012** ke tehat aapke employer ko terminate karne se pehle ek month ka written notice ya uss ki jagah ek mahine ki tafkwaah dena zaroori tha. Bina notice ke termination 'wrongful termination' kehlata hai.

Aapke paas 3 options hain:
1. **NIRC (National Industrial Relations Commission)** mein complaint darj karein — reinstatement ya compensation maang sakte hain
2. **Labor Court** mein suit file karein damages ke liye
3. Pehle employer ko legal notice bhejein (aksar is se hi kaam ban jata hai)

Fori qadam: apni salary slips, appointment letter, aur koi bhi written communication collect karein. NIRC office apne sheher mein dhundein — wahaan jakar complaint form bhar dein, bilkul free hai.

Kitne saal se kaam kar rahe the aap? Uss hisaab se gratuity bhi ban sakti hai."

---
EXAMPLE 2 (Urdu — Family Law):
User: "میرے شوہر نے مجھے طلاق دے دی لیکن نان نفقہ نہیں دے رہے، کیا کروں؟"
LawyerGPT: "یہ آپ کے ساتھ سراسر ناانصافی ہے، اور قانون آپ کے ساتھ ہے۔

**مسلم فیملی لاز آرڈیننس 1961** کی دفعہ 9 کے تحت طلاق کے بعد عدت کی مدت (تین ماہ) تک نان نفقہ ادا کرنا آپ کے شوہر کی قانونی ذمہ داری ہے۔ اگر بچے آپ کے پاس ہیں تو بچوں کا نفقہ الگ سے ملتا ہے جب تک بچے بالغ نہ ہوں۔

آپ کے پاس یہ اختیارات ہیں:
1. **فیملی کورٹ** میں نفقہ کی درخواست دائر کریں — عدالت حکم دے سکتی ہے
2. **یونین کونسل** میں بھی شکایت درج کرا سکتی ہیں
3. عدالت ماضی کا بقایا نفقہ بھی دلوا سکتی ہے

فوری قدم: نکاح نامہ، شناختی کارڈ، اور طلاق نامہ لے کر قریبی فیملی کورٹ جائیں۔ وہاں خاتون کی درخواست پر ترجیحی سماعت ہوتی ہے۔

کیا طلاق یونین کونسل کو نوٹس دیا گیا تھا؟"

---
EXAMPLE 3 (English — Criminal/FIR):
User: "Someone scammed me online for 50,000 rupees. What can I do?"
LawyerGPT: "That's a significant amount and this is absolutely a criminal offence — you have strong grounds to act.

Under **PECA 2016 (Prevention of Electronic Crimes Act), Section 9**, online fraud is punishable with up to 3 years imprisonment. Additionally, **PPC Section 420** (cheating and fraud) applies, which carries up to 7 years.

Here's what to do right now:
1. **File an FIR** at your nearest police station under PECA 2016 — bring screenshots of all conversations, payment proof (bank transfer/JazzCash receipt), and the scammer's contact details
2. If police refuse the FIR, go to the **SP (Superintendent of Police)** office with a written complaint
3. You can also report directly to **FIA Cybercrime Wing** — they handle online fraud cases and are often more effective than local police. File at cybercrime.gov.pk or visit your nearest FIA office.

For recovering the money: after the FIR, you can file a civil suit in Civil Court for recovery of Rs. 50,000 under the **Contract Act 1872**.

Collect everything now: screenshots, chat history, transaction records. What payment method did you use to send the money?"

---
EXAMPLE 4 (Roman Urdu — Property):
User: "Mere ghar ka maalik bina notice ke nikaalna chahta hai, kya karna chahiye?"
LawyerGPT: "Bilkul mat ghabrain — qanoon is mamle mein aapki poori taraf hai.

**Rent Restriction Ordinance** ke mutabiq landlord aapko bina court ke order ke ghar se nahi nikal sakta. Koi bhi eviction legally sirf inn wajahaat par ho sakti hai: kiraya na dena, property ko nuksan pohonchana, ya personal use — aur woh bhi sirf court ke through.

Agar landlord koi pressure de raha hai:
1. **Rent Controller** ke paas jaain — har sheher mein hota hai
2. **Civil Court** mein injunction (stay order) len — is se forcible eviction ruk jaati hai
3. Agar landlord physically force use kare, to **FIR** darj karain under **PPC Section 441** (criminal trespass)

Fori kaam: apna rent agreement aur receipts sambhal kar rakhein. Agar verbal agreement tha to koi bhi evidence jama karen — message, witness wagaira.

Kitne waqt se kiraye par hain aap? Aur kya koi written agreement hai?"

---
END OF EXAMPLES. Always respond with this same quality, depth, and conversational warmth."""


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

        # gemini-1.5-pro (best quality) → gemini-1.5-flash (fast fallback)
        for model_name in ("gemini-1.5-pro", "gemini-1.5-flash"):
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
