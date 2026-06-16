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
- Cite specific Pakistani laws (act name + section number) whenever relevant.
- Be conversational and warm, not robotic or bureaucratic.
- HONEST ASSESSMENT: Give the legally accurate position even if it goes against what the user hopes to hear. Not every landlord is wrong. Not every employee can win. If the user is in the wrong, say so clearly — then advise on their best realistic options.
- RENT INCREASES: Under Punjab Rented Premises Act 2009, a landlord CAN legally propose rent increases after lease expiry with proper notice. Annual increases with written consent are permitted. Monthly increases during an active lease are NOT permitted. Always clarify this distinction instead of automatically siding with the tenant.

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
EXAMPLE 5 (English — HONEST ASSESSMENT, user's position is weak):
User: "My landlord wants to increase my rent every year. Can he do this?"
LawyerGPT: "I want to give you the honest legal picture here, even if it's not what you hoped to hear.

Under the **Punjab Rented Premises Act 2009**, there are two separate situations:

**During your active lease term:** The landlord CANNOT increase rent unilaterally — you are fully protected for the duration of the lease. If they try, refuse in writing.

**At lease renewal (after expiry):** This is where it gets more nuanced. The landlord CAN propose a new (higher) rent when the lease is up for renewal. You cannot simply refuse all increases forever. If you disagree on the amount, either party can approach the **Rent Controller** court, which will determine a "fair rent" — courts typically allow 10–15% annual increases as reasonable.

**Bottom line — honest assessment:** If your lease has expired or is expiring, the landlord has a legitimate right to propose a rent increase. A yearly increase at renewal is legal. You can negotiate the percentage, or challenge an excessive increase at the Rent Controller — but you cannot block all increases indefinitely.

What I'd recommend:
1. Check your lease expiry date — this determines everything
2. If within the lease term: put your refusal in writing today
3. If at renewal: negotiate, and if they're asking for more than 15%, challenge it at the Rent Controller

How long has your current lease been running and when does it expire?"

---
EXAMPLE 6 (Roman Urdu — HONEST ASSESSMENT, user violated contract):
User: "Maine bina notice ke makan khali kar diya, ab landlord meri security deposit nahi de raha, kya karu?"
LawyerGPT: "Yaar, seedhi baat karun to is case mein aap ki position thodi kamzor hai — aur is liye:

**Transfer of Property Act 1882** aur aapke rent agreement ke mutabiq, tenant ko makan khali karne se pehle WRITTEN NOTICE dena hota hai — aksar ek ya do mahine pehle. Agar aap bina notice ke chale gaye, landlord ko actual nuqsaan hua (khali period, naya tenant dhundna, etc.).

Security deposit ke baare mein: **Punjab Rented Premises Act 2009** ke under, landlord deposit refund kar sakta hai notice period ki penalty minus kar ke. Matlab deposit full wapas nahi milegi — landlord ki 'bina notice' wali deduction valid ho sakti hai court mein bhi.

Aapke paas yeh options hain:
1. Pehle seedha landlord se baat karein — kitni deduction kar raha hai exactly?
2. Agar deduction rent agreement se zyada hai (matlab sirf ek mahine ka nahi, do teen mahine ka kaat raha hai) to **Rent Controller** mein case file karein
3. Receipt/bank transfer ke through koi proof hai ke deposit diya tha? Woh zaroor sambhal lein.

Honest assessment: Agar sirf ek mahine ki penalty kat rahi hai aur baaki wapas aa rahi hai, yeh qanooni hai. Agar poori deposit rok li hai to Rent Controller se insaaf milega.

Kitni deposit thi aur kitni wapas maang rahe hain?"

---
END OF EXAMPLES.

CRITICAL REMINDER: Study Example 5 and 6 carefully. You MUST give honest, balanced assessments like these — not always siding with whoever is asking. The user's position is not always legally strong. Say so when it is not."""

# Language directives — injected per request so the LLM knows which language to use
LANG_DIRECTIVES = {
    "en":       "LANGUAGE DIRECTIVE: The user wrote in ENGLISH. Respond in ENGLISH ONLY. Do not use Roman Urdu or Urdu script.",
    "roman-ur": "LANGUAGE DIRECTIVE: The user wrote in ROMAN URDU (Urdu in English letters). Respond in ROMAN URDU ONLY. Do not use English or Urdu script.",
    "ur":       "LANGUAGE DIRECTIVE: The user wrote in URDU SCRIPT. Respond ONLY in Urdu script. Do not use English or Roman Urdu.\nزبان کا حکم: صرف اردو رسم الخط میں جواب دیں۔",
}


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


def _call_llm_json(prompt: str) -> Optional[dict]:
    """Call Gemini Flash (primary) or Groq (fallback) with a JSON-output prompt."""
    import json

    def _parse_json(text: str):
        text = text.strip()
        if "```" in text:
            parts = text.split("```")
            for p in parts:
                p = p.strip()
                if p.startswith("json"):
                    p = p[4:].strip()
                try:
                    return json.loads(p)
                except Exception:
                    continue
        return json.loads(text)

    # Try Gemini first
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            for json_model_name in ("gemini-2.5-flash", "gemini-2.0-flash"):
                try:
                    m = genai.GenerativeModel(
                        json_model_name,
                        generation_config=genai.types.GenerationConfig(temperature=0.1, max_output_tokens=600),
                    )
                    resp = m.generate_content(prompt)
                    return _parse_json(resp.text)
                except Exception as me:
                    print(f"[Gemini JSON {json_model_name}] {me}")
                    continue
        except Exception as e:
            print(f"[Gemini JSON error] {e}")

    # Fallback: Groq with JSON mode
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            for gm in ("llama-3.3-70b-versatile", "llama-3.1-8b-instant"):
                try:
                    r = client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model=gm,
                        max_tokens=600,
                        temperature=0.1,
                        response_format={"type": "json_object"},
                    )
                    text = r.choices[0].message.content or ""
                    if text:
                        return json.loads(text)
                except Exception as me:
                    print(f"[Groq JSON {gm}] {me}")
                    continue
        except Exception as e:
            print(f"[Groq JSON error] {e}")

    return None


def _assess_document(text: str) -> Optional[dict]:
    """Ask Gemini to score a legal document on 4 Pakistani-law criteria."""
    prompt = f"""You are a Pakistani legal document analyst with 20 years of experience.
Analyze the document below and return ONLY valid JSON — no markdown, no explanation, nothing else.

Return exactly this shape:
{{
  "document_type": "Rent Agreement",
  "completeness": 75,
  "legal_validity": 80,
  "clarity": 70,
  "enforceability": 65,
  "overall": 73,
  "grade": "B+",
  "strengths": ["Both parties CNIC present", "Stamp paper attached"],
  "weaknesses": ["No arbitration clause", "Penalty terms vague"],
  "verdict": "Legally valid but needs one or two clauses for stronger enforceability"
}}

Scoring guide (0–100 each, be strict):
- completeness: Are all essential sections present? (parties, date, terms, signatures, witnesses)
- legal_validity: Is it compliant with Pakistani law? (stamp duty, CNIC, proper format)
- clarity: Are clauses clear and unambiguous?
- enforceability: Can a Pakistani court enforce this without ambiguity?
- overall: Weighted average of the four
- grade: A (90+), A- (85+), B+ (80+), B (75+), B- (70+), C+ (65+), C (55+), D (<55)

Document text:
{text[:2800]}"""
    return _call_llm_json(prompt)


def _assess_case_bias(situation: str, ai_analysis: str) -> Optional[dict]:
    """Ask Gemini to assess which party has stronger legal standing under Pakistani law."""
    prompt = f"""You are a Senior Advocate of the High Court of Pakistan with 25 years of experience.
Based on the situation and the legal analysis below, assess which party has stronger legal standing.
Return ONLY valid JSON — no markdown, no explanation.

Return exactly this shape:
{{
  "user_favor": 65,
  "opponent_favor": 35,
  "dominant_factor": "User has written contract and payment receipts — strong evidentiary position under Punjab Rented Premises Act",
  "key_risk": "Must file complaint within 3-year limitation period (Limitation Act 1908)",
  "honest_note": "Landlord has violated the Rent Restriction Ordinance — user's position is strong"
}}

Rules:
- user_favor + opponent_favor MUST equal exactly 100
- Be honest — if the user's claim is legally weak or they are at fault, reflect that accurately
- user_favor below 40 means the opponent's position is legally stronger
- Base assessment purely on Pakistani law and facts stated, not sympathy

Situation: {situation[:600]}

Legal Analysis: {ai_analysis[:700]}"""
    return _call_llm_json(prompt)


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

        # Newest available models first
        for model_name in ("gemini-2.5-flash", "gemini-2.0-flash"):
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

        for groq_model in (
            "llama-3.3-70b-versatile",   # Best quality, 100K TPD free
            "llama-3.1-8b-instant",      # Fast fallback, separate quota
            "llama3-8b-8192",            # Additional fallback
        ):
            try:
                response = client.chat.completions.create(
                    messages=messages,
                    model=groq_model,
                    max_tokens=1024,
                    temperature=0.7,
                )
                result = response.choices[0].message.content
                if result:
                    print(f"[Groq] success with model: {groq_model}")
                    return result
            except Exception as model_err:
                print(f"[Groq {groq_model} error] {model_err}")
                continue
        return None
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

    doc_score = _assess_document(extracted_text)

    return {
        "filename": file.filename,
        "extracted_text": extracted_text[:3000],
        "char_count": len(extracted_text),
        "matched_laws": matched,
        "accuracy": accuracy,
        "doc_score": doc_score,
        "disclaimer": "Ye analysis sirf maloomat ke liye hai."
    }


# ─── POST /chat ────────────────────────────────────────────────
@app.post("/chat")
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    lang = (req.reply_lang or "en").lower()
    history = req.history or []

    # Law search: use conversation context (not just latest msg) so follow-ups get right laws
    # e.g. "send notice?" in a rent conversation should match rent laws, not talaq
    search_text = req.message
    if history:
        prior = " ".join(h.get("content", "")[:120] for h in history[-3:])
        search_text = prior + " " + req.message

    matched = smart_find_laws(search_text, top_n=3)
    accuracy = calculate_win_probability(req.message, matched)

    # Build system prompt enriched with law context + language directive
    law_context = _build_law_context(matched)
    lang_directive = LANG_DIRECTIVES.get(lang, LANG_DIRECTIVES["en"])
    system = LAWYER_SYSTEM_PROMPT + f"\n\n{lang_directive}"
    if law_context:
        system += f"\n\n{law_context}"

    # Build message list for LLM (last 8 messages for context window)
    llm_msgs = []
    for h in history[-8:]:
        role = h.get("role", "user")
        content = h.get("content", "")
        if content.strip():
            llm_msgs.append({"role": role, "content": content})
    llm_msgs.append({"role": "user", "content": req.message})

    # Gemini (primary) → Groq (fallback) → connection error (last resort)
    ai_provider = "rule-based"
    response = _call_gemini(llm_msgs, system)
    if response:
        ai_provider = "gemini"
    else:
        response = _call_groq(llm_msgs, system)
        if response:
            ai_provider = "groq"

    if not response:
        # Don't use template fallback in a conversation — it ignores context and confuses topics
        if history:
            response = {
                "en": "I'm having a connection issue right now. Please try your question again.",
                "roman-ur": "Abhi connection mein masla aa raha hai. Dobara try karein.",
                "ur": "ابھی کنیکشن میں مسئلہ آ رہا ہے۔ دوبارہ کوشش کریں۔",
            }.get(lang, "Connection issue. Please try again.")
        else:
            response = _template_chat_fallback(req.message, matched, lang)

    # Case bias assessment — only for first message (no history), skip follow-ups
    case_bias = None
    if len(req.history or []) <= 1 and ai_provider != "rule-based":
        case_bias = _assess_case_bias(req.message, response)

    return {
        "reply": response,
        "matched_laws": matched,
        "accuracy": accuracy,
        "case_bias": case_bias,
        "ai_provider": ai_provider,
    }


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
