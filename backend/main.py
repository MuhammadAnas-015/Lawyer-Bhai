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

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


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

    if matched:
        top_law = matched[0]
        category = top_law["category"]
        advice = _generate_advice(req.text, matched, category)
    else:
        advice = "Aapke masle ke liye relevant Pakistani qanoon nahi mila. Kisi tajurbakar vakeel se direct raabta karen."

    return {
        "query": req.text,
        "matched_laws": matched,
        "accuracy": accuracy,
        "advice": advice,
        "disclaimer": "Ye mashwara sirf maloomat ke liye hai. Qanooni faislon ke liye kisi vakeel se milein."
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

    if matched:
        top = matched[0]
        response = (
            f"Aapka sawaal \"{req.message[:60]}\" ke mutabiq:\n\n"
            f"**{top['act_name']} — {top['section_num']}**: {top['title']}\n\n"
            f"{top['text_en'][:350]}...\n\n"
        )
        if top.get("punishment"):
            response += f"**Saza**: {top['punishment']}\n\n"
        response += f"**Aapke haq mein imkaan**: {accuracy['win_pct']}% — {accuracy['note']}\n\n"
        response += "_Ye maloomat hai, qanooni mashwara nahi. Vakeel se zaroor milein._"
    else:
        response = (
            "Maafi chahta hun — is sawaal se mutabiq koi specific Pakistani qanoon nahi mila. "
            "Kripaya apna masla thoda tafseeli likh kar dobara poochein."
        )

    return {"reply": response, "matched_laws": matched, "accuracy": accuracy}


# ─── Advice generator ──────────────────────────────────────────
def _generate_advice(query: str, laws: List[dict], category: str) -> str:
    top = laws[0]
    sec = top['section_num']
    sec_label = sec if sec.lower().startswith(("section", "article")) else f"Section {sec}"
    base = f"**{top['act_name']} {sec_label}** ({top['title']})"

    if category == "Criminal":
        return (
            f"Aapke case mein {base} laagu hota hai. "
            f"{top['text_en'][:280]}... "
            f"Agar aap FIR darj karna chahte hain to nazdeeqi police station jayein. "
            f"{'Ye ek qabile zamaanat jurm hai.' if top.get('bailable') else 'Ye ek na-qabile zamaanat jurm hai — bail ke liye court mein darkhwast dein.'}"
        )
    elif category == "Family":
        return (
            f"Aapka masla {base} ke tehat aata hai. "
            f"{top['text_en'][:280]}... "
            f"Pehla qadam: Union Council ya Family Court mein application dein. "
            f"Zarori documents — CNIC, Nikahnama — tayyar rakhein."
        )
    elif category == "Property":
        return (
            f"Aapke property masle mein {base} laagu hota hai. "
            f"{top['text_en'][:280]}... "
            f"Tamam dastawezaat (sale deed, mutation, fard) mahfooz rakhein."
        )
    elif category == "Labor":
        return (
            f"Aapke rozgar masle mein {base} laagu hoti hai. "
            f"{top['text_en'][:280]}... "
            f"NIRC mein complaint file kar sakte hain. Salary slips aur contract mahfooz rakhein."
        )
    elif category == "Civil":
        return (
            f"Aapke masle mein {base} laagu hota hai. "
            f"{top['text_en'][:280]}... "
            f"Civil Court mein suit file kiya ja sakta hai. Limitation period ka khayal rakhein."
        )
    elif category == "Constitutional":
        return (
            f"Aapka masla {base} se mutabiq hai. "
            f"{top['text_en'][:280]}... "
            f"Bunyadi haqooq ki khalaf warzi par High Court mein writ petition dakhil ki ja sakti hai."
        )
    else:
        return (
            f"Aapke case mein {base} laagu hoti hai. "
            f"{top['text_en'][:280]}... "
            f"Aik tajurbakar vakeel se mashwara karein."
        )
