"""
Fast PDF importer — handles PPC-style Pakistani law books
Format detected:
  "302. Punishment for qatl-e-amd.--Whoever commits..."
  "70. Fine leviable within six years..."
  "337-A. Itlaf-i-Udw.--Whoever commits..."

Run: python import_pdf.py [pdf_path] [act_name] [short]
     python import_pdf.py law_pdfs/laws.pdf "Pakistan Penal Code 1860" PPC
"""
import re
import sys
import json
import sqlite3

DB_PATH = "laws.db"

STOPWORDS = {
    "the","a","an","is","in","of","to","and","or","for","with","that","this","by",
    "from","on","at","as","be","are","was","were","has","have","had","shall","may",
    "any","such","all","not","who","where","when","which","every","person","act",
    "under","upon","said","been","its","their","him","his","her","section","article",
    "thereof","whether","other","same","also","than","then","will","more","been",
    "being","after","before","without","within","against","unless","until","upon",
    "into","each","only","both","between","during","through","further","another"
}

CATEGORY_MAP = {
    "Criminal":      ["penal","criminal","offence","punishment","murder","theft","robbery","crime","prison","hurt","assault"],
    "Constitutional":["constitution","fundamental","rights","parliament","federal","provincial","president"],
    "Family":        ["family","marriage","divorce","talaq","nikah","maintenance","custody","guardian","dower"],
    "Property":      ["property","land","transfer","mortgage","lease","rent","immovable","immoveable","possession"],
    "Labor":         ["employment","wages","worker","labour","labor","industrial","workman","factory","gratuity"],
    "Civil":         ["contract","agreement","civil","damages","liability","obligation","consideration"],
    "Tax":           ["tax","income","revenue","duty","customs","excise"],
    "Consumer":      ["consumer","protection","goods","services","trade"],
    "Corporate":     ["company","companies","secp","securities","corporate","director","shareholder"],
}

def detect_category(text):
    t = text.lower()
    best, best_score = "Civil", 0
    for cat, words in CATEGORY_MAP.items():
        score = sum(t.count(w) for w in words)
        if score > best_score:
            best, best_score = cat, score
    return best

def get_keywords(text):
    words = re.findall(r'\b[a-z]{4,}\b', text.lower())
    freq = {}
    for w in words:
        if w not in STOPWORDS:
            freq[w] = freq.get(w, 0) + 1
    top = sorted(freq.items(), key=lambda x: -x[1])[:12]
    return [w for w, _ in top]

def get_punishment(text):
    patterns = [
        r'punish(?:ed|ment|able)\s+with\s+([^.]{10,150})',
        r'(death[^.]{0,60})',
        r'(imprisonment[^.]{10,120})',
        r'(fine[^.]{10,80})',
    ]
    for p in patterns:
        m = re.search(p, text, re.I)
        if m:
            result = m.group(1) if '(' in p else m.group(0)
            return result[:150].strip()
    return None

def get_severity(text):
    t = text.lower()
    if any(x in t for x in ["death", "life imprisonment", "not less than ten years", "not less than fourteen"]):
        return "High"
    if any(x in t for x in ["seven years", "ten years", "five years", "rigorous imprisonment"]):
        return "Medium"
    return "Low"

def get_bailable(text):
    t = text.lower()
    if "non-bailable" in t: return False
    if "bailable" in t:     return True
    return None

def clean_text(text):
    """Remove PDF artifacts like extra spaces, soft hyphens, page numbers"""
    text = re.sub(r'[\xad­]', '', text)           # soft hyphens
    text = re.sub(r'Page \d+ of \d+', '', text)        # page numbers
    text = re.sub(r'\[Omitted\.\]|\[Repealed\.\]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_sections_ppc_style(text, act_name):
    """
    PPC-style PDF format:
    Section number, title, and text are on same/adjacent lines.
    Pattern: NUMBER[LETTER]?. Title text.--Body text
    """
    category = detect_category(act_name + " " + text[:3000])
    short = "".join(w[0].upper() for w in act_name.split() if w[0].isalpha())[:5]

    # Skip table of contents — find where content actually starts
    # Look for the first occurrence of "1." with substantial text after it
    toc_end = 0
    # Find the point where sections start having actual substantive text
    content_start = re.search(
        r'\n\s*1\.\s+(?:Short title|Title and extent|Extent and commencement)',
        text, re.IGNORECASE
    )
    if content_start:
        toc_end = content_start.start()

    actual_text = text[toc_end:]

    # Main pattern: "NUMBER. Title text" followed by substantive body
    # Handles: "302.", "337-A.", "489-F.", "52 A."
    sec_pattern = re.compile(
        r'(?:^|\n)\s*'
        r'(\d{1,3}(?:\s*[A-Z])?(?:-[A-Z])?)\.\s+'   # section number like 302, 337-A, 489-F, 52 A
        r'([A-Z][^\n]{3,100}?)'                         # title
        r'(?:\.--|\.\s+(?=[A-Z])|\n)'                  # separator
        r'((?:.(?!\n\s*\d{1,3}(?:\s*[A-Z])?(?:-[A-Z])?\.\s+[A-Z]))+)',  # body until next section
        re.MULTILINE | re.DOTALL
    )

    seen = set()
    sections = []

    for m in sec_pattern.finditer(actual_text):
        sec_num = m.group(1).replace(' ', '').strip()
        title   = m.group(2).strip()[:120]
        body    = clean_text(m.group(3))[:1400]

        # Quality filters
        if sec_num in seen:
            continue
        if len(body) < 50:
            continue
        if len(title) < 5:
            continue
        # Skip if body is just more titles (ToC artifact)
        word_count = len(body.split())
        if word_count < 8:
            continue

        seen.add(sec_num)
        kws = get_keywords(title + " " + body)

        sections.append({
            "act":       act_name,
            "short":     short,
            "sec":       sec_num,
            "title":     title,
            "text":      body,
            "category":  category,
            "sub":       "",
            "keywords":  kws,
            "punishment": get_punishment(body),
            "bailable":  get_bailable(body),
            "severity":  get_severity(body),
        })

    return sections

def save_to_db(sections):
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()
    saved = 0
    for s in sections:
        try:
            cur.execute("""
                INSERT OR IGNORE INTO laws
                  (act_name, act_short, section_num, title, text_en,
                   category, sub_cat, keywords, punishment, bailable, severity)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """, (
                s["act"], s["short"], s["sec"], s["title"], s["text"],
                s["category"], s["sub"], json.dumps(s["keywords"]),
                s["punishment"],
                1 if s["bailable"] is True else (0 if s["bailable"] is False else None),
                s["severity"]
            ))
            if cur.rowcount:
                saved += 1
        except Exception:
            pass
    conn.commit()
    conn.close()
    return saved

if __name__ == "__main__":
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else "law_pdfs/laws.pdf"
    act_name = sys.argv[2] if len(sys.argv) > 2 else "Unknown Act"

    print(f"[1] Reading PDF: {pdf_path}")
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(pdf_path)
        print(f"    Extracted: {len(text):,} characters")
    except Exception as e:
        print(f"    ERROR: {e}")
        sys.exit(1)

    print("[2] Extracting sections...")
    sections = extract_sections_ppc_style(text, act_name)
    print(f"    Found: {len(sections)} sections")

    if not sections:
        print("    WARNING: No sections found. PDF format may need custom parser.")
        sys.exit(0)

    print("\n[3] Sample sections:")
    print(f"    {'SEC':<8} {'TITLE':<50} CHARS")
    print(f"    {'-'*8} {'-'*50} -----")
    for s in sections[:10]:
        print(f"    {s['sec']:<8} {s['title'][:50]:<50} {len(s['text'])}")

    print(f"\n[4] Saving to database...")
    saved = save_to_db(sections)
    print(f"    Saved: {saved} new sections")

    # Final DB stats
    conn = sqlite3.connect(DB_PATH)
    total = conn.execute("SELECT COUNT(*) FROM laws").fetchone()[0]
    cats  = conn.execute(
        "SELECT category, COUNT(*) as n FROM laws GROUP BY category ORDER BY n DESC"
    ).fetchall()
    conn.close()

    print(f"\n{'='*45}")
    print(f"  TOTAL LAWS IN DATABASE: {total}")
    print(f"  By Category:")
    for cat, cnt in cats:
        bar = '#' * (cnt // 3)
        print(f"    {cat:<22} {cnt:>4}  {bar}")
    print(f"{'='*45}")
