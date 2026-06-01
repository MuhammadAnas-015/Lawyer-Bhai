"""
Pakistani Laws Scraper + PDF Bulk Importer
Sources:
  1. pakistanlawsite.com  — All major acts
  2. napit.com.pk         — Punjab/KPK/Sindh provincial laws
  3. Local PDF folder     — Your own downloaded law books

Run: python scraper.py
"""
import os
import re
import json
import time
import sqlite3
import ssl
import urllib.request
import urllib.parse
from pathlib import Path
from laws_engine import DB_PATH, init_db

# Bypass SSL verification (needed for some Pakistani law sites)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

# ─────────────────────────────────────────────
#  Category auto-detector
# ─────────────────────────────────────────────
CATEGORY_KEYWORDS = {
    "Criminal": ["penal","criminal","offence","punishment","murder","theft","robbery","fraud","crime","prison"],
    "Family":   ["family","marriage","divorce","talaq","nikah","maintenance","custody","guardian","dower","khul"],
    "Property": ["property","land","transfer","mortgage","lease","rent","immovable","possession","easement"],
    "Labor":    ["employment","wages","worker","labour","labor","industrial","workman","factory","gratuity","retrenchment"],
    "Civil":    ["contract","agreement","tort","civil","suit","damages","liability","negligence","limitation"],
    "Constitutional": ["constitution","fundamental","rights","parliament","federal","provincial","president","court"],
    "Consumer": ["consumer","protection","defective","goods","services","trade","commerce"],
    "Tax":      ["tax","income","sales","customs","excise","revenue","duty","fbr"],
    "Corporate":["company","companies","secp","securities","corporate","director","shareholder"],
}

def detect_category(text: str) -> str:
    text_lower = text.lower()
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS}
    for cat, words in CATEGORY_KEYWORDS.items():
        for word in words:
            scores[cat] += text_lower.count(word)
    return max(scores, key=scores.get)


# ─────────────────────────────────────────────
#  Extract sections from raw text
# ─────────────────────────────────────────────
def extract_sections_from_text(text: str, act_name: str, act_short: str = "") -> list:
    sections = []

    # Pattern: "Section X." or "X." or "Article X."
    patterns = [
        r'(Section\s+(\d+[A-Z]?(?:-[A-Z])?)\s*[.—–-]\s*([^\n]{5,80})\n((?:(?!Section\s+\d).){20,1500}))',
        r'(Article\s+(\d+[A-Z]?(?:-[A-Z])?)\s*[.—–-]\s*([^\n]{5,80})\n((?:(?!Article\s+\d).){20,1500}))',
        r'^(\d+[A-Z]?\.\s+([A-Z][^\n]{5,70})\n((?:(?!\d+[A-Z]?\.).){20,1000}))',
    ]

    seen_sections = set()
    category = detect_category(text + " " + act_name)

    for pattern in patterns:
        matches = re.finditer(pattern, text, re.MULTILINE | re.DOTALL)
        for m in matches:
            try:
                if len(m.groups()) == 4:
                    _, sec_num, sec_title, sec_text = m.groups()
                else:
                    _, sec_title, sec_text = m.groups()
                    sec_num = m.group(0).split(".")[0].strip()

                sec_num = sec_num.strip()
                sec_title = sec_title.strip()
                sec_text = re.sub(r'\s+', ' ', sec_text).strip()[:1200]

                if sec_num in seen_sections or len(sec_text) < 30:
                    continue
                seen_sections.add(sec_num)

                # Extract keywords from title + text
                kws = extract_keywords(sec_title + " " + sec_text)

                sections.append({
                    "act": act_name,
                    "short": act_short or act_name[:20],
                    "sec": sec_num,
                    "title": sec_title[:120],
                    "text": sec_text,
                    "category": category,
                    "sub": "",
                    "keywords": kws,
                    "punishment": extract_punishment(sec_text),
                    "bailable": detect_bailable(sec_text),
                    "severity": detect_severity(sec_text),
                })
            except Exception:
                continue

    return sections


def extract_keywords(text: str) -> list:
    """Extract meaningful keywords from section text."""
    stopwords = {"the","a","an","is","in","of","to","and","or","for","with","that","this",
                 "by","from","on","at","as","be","are","was","were","has","have","had",
                 "shall","may","any","such","all","not","who","where","when","which","every",
                 "person","act","law","under","upon","said","been","its","their","him","his",
                 "her","them","they","we","it","section","article","clause","sub","thereof"}
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    freq = {}
    for w in words:
        if w not in stopwords:
            freq[w] = freq.get(w, 0) + 1
    top = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:12]
    return [w for w, _ in top]


def extract_punishment(text: str) -> str:
    """Extract punishment/penalty from section text."""
    patterns = [
        r'punished? with (imprisonment[^.]{0,100})',
        r'(death[^.]{0,50})',
        r'(fine[^.]{0,80})',
        r'imprisonment[^.]{0,100}',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(0)[:150].strip()
    return None


def detect_bailable(text: str) -> bool:
    text_l = text.lower()
    if "non-bailable" in text_l or "not bailable" in text_l:
        return False
    if "bailable" in text_l:
        return True
    return None


def detect_severity(text: str) -> str:
    text_l = text.lower()
    if any(x in text_l for x in ["death","life imprisonment","murder","rape","terrorism"]):
        return "High"
    if any(x in text_l for x in ["seven years","10 years","five years","rigorous"]):
        return "High"
    if any(x in text_l for x in ["three years","two years","fine"]):
        return "Medium"
    return "Low"


# ─────────────────────────────────────────────
#  PDF Bulk Importer
# ─────────────────────────────────────────────
def import_from_pdf(pdf_path: str, act_name: str = "", act_short: str = "") -> int:
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(pdf_path)
    except Exception as e:
        print(f"  [ERR] PDF read error: {e}")
        return 0

    if not act_name:
        act_name = Path(pdf_path).stem.replace("_", " ").replace("-", " ").title()

    sections = extract_sections_from_text(text, act_name, act_short)
    saved = save_laws_to_db(sections)
    return saved


def import_from_folder(folder_path: str) -> int:
    """Import all PDFs from a folder."""
    folder = Path(folder_path)
    total = 0
    pdfs = list(folder.glob("*.pdf"))
    if not pdfs:
        print(f"  No PDFs found in {folder_path}")
        return 0

    for pdf in pdfs:
        act_name = pdf.stem.replace("_", " ").replace("-", " ").title()
        print(f"  📄 Importing: {act_name}")
        count = import_from_pdf(str(pdf), act_name)
        print(f"     ✅ {count} sections added")
        total += count
    return total


# ─────────────────────────────────────────────
#  Web Scraper — pakistanlawsite.com
# ─────────────────────────────────────────────
LAW_URLS = {
    "Pakistan Penal Code 1860":         "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FPenalCode.pdf",
    "Code of Criminal Procedure 1898":  "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FCrPC.pdf",
    "Code of Civil Procedure 1908":     "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FCPC.pdf",
    "Contract Act 1872":                "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FContractAct.pdf",
    "Transfer of Property Act 1882":    "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FTPA.pdf",
    "Constitution of Pakistan 1973":    "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FConstitution.pdf",
    "Muslim Family Laws Ordinance 1961":"https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FMFLO.pdf",
    "Dissolution of Muslim Marriages Act 1939": "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FDMMA.pdf",
    "Guardian and Wards Act 1890":      "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FGWA.pdf",
    "Companies Act 2017":               "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FCompaniesAct2017.pdf",
    "Income Tax Ordinance 2001":        "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FITO.pdf",
    "Prevention of Corruption Act 1947":"https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FPCA.pdf",
    "Limitation Act 1908":              "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FLimitationAct.pdf",
    "Specific Relief Act 1877":         "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FSRA.pdf",
    "Arbitration Act 1940":             "https://pakistanlawsite.com/Login/GetFile?pth=P%2FPakistanCode%2FArbitrationAct.pdf",
}

def download_and_import(act_name: str, url: str, out_dir: str = "downloaded_laws") -> int:
    os.makedirs(out_dir, exist_ok=True)
    filename = act_name.replace(" ", "_")[:50] + ".pdf"
    out_path = os.path.join(out_dir, filename)

    if os.path.exists(out_path):
        print(f"  [SKIP] Already downloaded: {act_name}")
    else:
        try:
            print(f"  [GET] Downloading: {act_name}")
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as resp, open(out_path, "wb") as f:
                f.write(resp.read())
            time.sleep(1)  # polite delay
        except Exception as e:
            print(f"  [FAIL] Download failed: {e}")
            return 0

    return import_from_pdf(out_path, act_name)


# ─────────────────────────────────────────────
#  DB Save
# ─────────────────────────────────────────────
def save_laws_to_db(laws: list) -> int:
    if not laws:
        return 0
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    saved = 0
    for law in laws:
        try:
            cur.execute("""
                INSERT OR IGNORE INTO laws
                  (act_name,act_short,section_num,title,text_en,category,sub_cat,keywords,punishment,bailable,severity)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """, (
                law["act"], law["short"], law["sec"], law["title"], law["text"],
                law["category"], law.get("sub",""),
                json.dumps(law["keywords"]),
                law.get("punishment"), law.get("bailable"), law.get("severity","Medium")
            ))
            if cur.rowcount:
                saved += 1
        except Exception:
            pass
    conn.commit()
    conn.close()
    return saved


# ─────────────────────────────────────────────
#  MAIN — Run this script
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  Lawyer Bhai AI — Laws Bulk Importer")
    print("=" * 55)

    init_db()

    print("\n[1] Checking for local PDF folder...")
    pdf_folder = "law_pdfs"
    if os.path.exists(pdf_folder):
        count = import_from_folder(pdf_folder)
        print(f"  [OK] Total sections from local PDFs: {count}")
    else:
        os.makedirs(pdf_folder, exist_ok=True)
        print(f"  [CREATED] Folder: '{pdf_folder}/'")
        print(f"  -> Apni law PDFs yahan rakhein aur dobara chalayein.\n")

    print("\n[2] Downloading laws from pakistanlawsite.com...")
    total = 0
    for act_name, url in LAW_URLS.items():
        count = download_and_import(act_name, url)
        print(f"  [OK] {act_name}: {count} sections")
        total += count

    # Final stats
    conn = sqlite3.connect(DB_PATH)
    total_in_db = conn.execute("SELECT COUNT(*) FROM laws").fetchone()[0]
    cats = conn.execute("SELECT category, COUNT(*) FROM laws GROUP BY category").fetchall()
    conn.close()

    print("\n" + "=" * 55)
    print(f"  TOTAL LAWS IN DATABASE: {total_in_db}")
    print("  By Category:")
    for cat, cnt in cats:
        print(f"    {cat:<20} {cnt} sections")
    print("=" * 55)
