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

# ── DB path: use /data on Render (persistent disk), else local ──
import laws_engine
if os.path.exists("/data"):
    laws_engine.DB_PATH = "/data/laws.db"

# ─── App init ──────────────────────────────────────────────────
app = FastAPI(
    title="Lawyer Bhai AI — Laws API",
    description="Pakistani legal AI backend. No paid API needed.",
    version="1.0.0"
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


# ─── Health Check ──────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "service": "Lawyer Bhai AI", "version": "1.0.0"}


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
    results = find_laws(q, category=category, top_n=top)
    return {"query": q, "total": len(results), "laws": results}


# ─── POST /analyze ─────────────────────────────────────────────
@app.post("/analyze")
def analyze_case(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(400, "Text cannot be empty")

    matched = find_laws(req.text, category=req.category, top_n=5)
    accuracy = calculate_win_probability(req.text, matched)

    lang = (req.reply_lang or "en").lower()

    if matched:
        top_law = matched[0]
        category = top_law["category"]
        advice = _generate_advice(req.text, matched, category, lang)
    else:
        advice = {
            "ur": "آپ کے مسئلے سے متعلق کوئی پاکستانی قانون نہیں ملا۔ کسی تجربہ کار وکیل سے براہ راست رابطہ کریں۔",
            "roman-ur": "Aapke masle ke liye relevant Pakistani qanoon nahi mila. Kisi tajurbakar vakeel se direct raabta karen.",
            "en": "No relevant Pakistani law found for your problem. Please contact an experienced lawyer directly.",
        }.get(lang, "No relevant Pakistani law found. Please contact a lawyer.")

    disclaimer = {
        "ur": "یہ مشورہ صرف معلومات کے لیے ہے۔ قانونی فیصلوں کے لیے کسی وکیل سے ملیں۔",
        "roman-ur": "Ye mashwara sirf maloomat ke liye hai. Qanooni faislon ke liye kisi vakeel se milein.",
        "en": "This advice is for information only. Consult a lawyer for legal decisions.",
    }.get(lang, "This advice is for information only. Consult a lawyer.")

    return {
        "query": req.text,
        "matched_laws": matched,
        "accuracy": accuracy,
        "advice": advice,
        "disclaimer": disclaimer,
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

    matched = find_laws(extracted_text, top_n=5)
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

    matched = find_laws(req.message, top_n=3)
    accuracy = calculate_win_probability(req.message, matched)
    lang = (req.reply_lang or "en").lower()

    if matched:
        top = matched[0]
        title = top["title"]
        act = top["act_name"]
        sec = top["section_num"]
        body = top["text_en"][:350]
        punishment = top.get("punishment")
        win = accuracy["win_pct"]

        if lang == "ur":
            response = (
                f"آپ کے سوال کے مطابق، پاکستانی قانون میں یہ متعلقہ ہے:\n\n"
                f"**{act} — {sec}**: {title}\n\n{body}...\n\n"
            )
            if punishment:
                response += f"**سزا**: {punishment}\n\n"
            response += f"**آپ کے حق میں امکان**: {win}%\n\n"
            response += "_یہ صرف معلومات ہے، قانونی مشورہ نہیں۔ کسی وکیل سے ضرور ملیں۔_"
        elif lang == "roman-ur":
            response = (
                f"Aapke sawaal ke mutabiq, Pakistani qanoon mein yeh relevant hai:\n\n"
                f"**{act} — {sec}**: {title}\n\n{body}...\n\n"
            )
            if punishment:
                response += f"**Saza**: {punishment}\n\n"
            response += f"**Aapke haq mein imkaan**: {win}%\n\n"
            response += "_Ye sirf maloomat hai, qanooni mashwara nahi. Vakeel se zaroor milein._"
        else:  # english
            response = (
                f"Based on your question, this is relevant in Pakistani law:\n\n"
                f"**{act} — {sec}**: {title}\n\n{body}...\n\n"
            )
            if punishment:
                response += f"**Punishment**: {punishment}\n\n"
            response += f"**Your chances**: {win}%\n\n"
            response += "_This is information only, not legal advice. Please consult a lawyer._"
    else:
        if lang == "ur":
            response = "معذرت — اس سوال سے متعلق کوئی مخصوص پاکستانی قانون نہیں ملا۔ براہ کرم اپنا مسئلہ تھوڑا تفصیل سے دوبارہ پوچھیں۔"
        elif lang == "roman-ur":
            response = "Maafi chahta hun — is sawaal se mutabiq koi specific Pakistani qanoon nahi mila. Kripaya apna masla thoda tafseeli likh kar dobara poochein."
        else:
            response = "Sorry — I couldn't find a specific Pakistani law matching this question. Please describe your problem in a bit more detail."

    return {"reply": response, "matched_laws": matched, "accuracy": accuracy}


# ─── Advice generator (language-aware) ─────────────────────────
# intro = before law text, action = practical step after it.
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
        "en":       ("In your case, {b} applies. ", "Consult an experienced lawyer."),
        "roman-ur": ("Aapke case mein {b} laagu hoti hai. ", "Aik tajurbakar vakeel se mashwara karein."),
        "ur":       ("آپ کے کیس میں {b} لاگو ہوتا ہے۔ ", "کسی تجربہ کار وکیل سے مشورہ کریں۔"),
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
