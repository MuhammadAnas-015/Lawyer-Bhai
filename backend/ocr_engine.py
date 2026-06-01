"""
OCR Engine — Extract text from uploaded PDFs and images.
Uses Tesseract (free, local) + pdfminer for PDFs.
"""
import io
import os
import tempfile
from pathlib import Path

# ─── PDF text extraction ───────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        from pdfminer.high_level import extract_text as pdf_extract
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        text = pdf_extract(tmp_path)
        os.unlink(tmp_path)
        return text.strip()
    except Exception as e:
        return f"[PDF extraction error: {str(e)}]"


# ─── Image OCR ────────────────────────────────────────────
def extract_text_from_image(file_bytes: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image

        # Tesseract languages: English + Urdu
        langs = "eng+urd"
        img = Image.open(io.BytesIO(file_bytes))

        # Convert to RGB if needed
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        text = pytesseract.image_to_string(img, lang=langs)
        return text.strip()
    except Exception as e:
        return f"[OCR error: {str(e)}]"


# ─── Router — detect type and extract ─────────────────────
def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"):
        return extract_text_from_image(file_bytes)
    else:
        # Try as plain text
        try:
            return file_bytes.decode("utf-8").strip()
        except Exception:
            return "[Unsupported file format]"
