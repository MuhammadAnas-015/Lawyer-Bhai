# 🏛️ PakLaw API — The Big Vision

> **Status (2026-06-11):** API built & live-tested locally in [`laws-api/`](laws-api/).
> Name finalized: **PakLaw API** (keys: `pklw_...`). Lawyer Bhai AI backend
> integrated via `backend/paklaw_client.py`. pakistancode.gov.pk importer ready.

> **Founder's note (Anas):** Ye Lawyer Bhai AI ka asli core / moat hai.
> Pakistan ka complete, structured, searchable laws database — aur uski
> apni LIVE API. Duniya mein abhi tak Pakistani laws ki koi proper public
> API nahi hai. Hum wo banayenge — apni creation, jo hum live provide karenge.

---

## 🎯 The Core Idea

Pakistan ke **saare valid laws** (jin par actual court cases handle hote hain)
ko ek jagah collect karna:

1. **Books → PDF** — har zaroori law book ki PDF nikalo
2. **Extract** — PDF se saare sections/articles structured form mein
3. **Store** — ek **secure + fast database** mein
4. **API** — uss data ki apni **live API** banao
5. **Provide** — duniya ko (developers, law firms, apps) live serve karo

**Why it's huge:** Globally Pakistani laws ki koi structured API exist
nahi karti. Ye khud ek standalone product + revenue stream hai — Lawyer
Bhai AI to iska sirf pehla consumer hai.

---

## 📚 Laws to Cover (Anas batayega exact list)

Pakistan ke wo saare laws jin par cases base hote hain. Categories:

| Category | Example Acts (confirm karna hai) |
|----------|----------------------------------|
| Criminal | Pakistan Penal Code 1860, CrPC 1898 |
| Civil | Contract Act 1872, CPC 1908, Specific Relief Act |
| Constitutional | Constitution of Pakistan 1973 |
| Family | MFLO 1961, Dissolution of Muslim Marriages Act 1939, Guardian & Wards Act |
| Property | Transfer of Property Act 1882, Registration Act, Stamp Act, Rent laws |
| Labor | ICEO 1968, Payment of Wages, Factories Act, Industrial Relations Act |
| Tax | Income Tax Ordinance 2001, Sales Tax Act, Customs Act |
| Corporate | Companies Act 2017, SECP regulations |
| Cyber | PECA 2016 |
| Consumer | Consumer Protection Acts (provincial) |
| Special | NAB Ordinance, Anti-Terrorism Act, Drug laws, Arms Act, etc. |

> ⚠️ **TODO:** Anas se exact authoritative book list leni hai — wahi books
> jo Pakistani courts/lawyers actually use karte hain (latest amended versions).

---

## 🏗️ Technical Architecture (Plan)

### 1. Extraction Pipeline (already partly built)
- `backend/import_pdf.py` — PDF → sections (PPC pe test ho chuka, 991 sections nikle)
- `backend/scraper.py` — bulk importer + auto-categorizer
- Improve: better section parsing, Urdu text, amendments tracking,
  cross-references between sections

### 2. Secure + Fast Database
- **Supabase (PostgreSQL)** — already connected for auth
- `pgvector` extension → semantic/vector search (NLP ke liye)
- Full-text search (English + Urdu)
- Tables: `laws`, `acts`, `amendments`, `case_precedents`, `cross_refs`
- Schema base already in `database/schema.sql`

### 3. The Laws API (our creation — the product)
Endpoints (planned):
```
GET  /api/v1/acts                     → list all acts
GET  /api/v1/acts/{id}/sections       → sections of an act
GET  /api/v1/laws/{id}                → single law full detail
GET  /api/v1/search?q=...&lang=ur     → full-text + semantic search
POST /api/v1/match                    → case description → relevant laws
GET  /api/v1/categories               → law categories
```
- **Auth:** API keys per consumer (rate-limited tiers)
- **Speed:** caching (Redis), indexed queries, CDN
- **Reliability:** versioned (v1), documented (OpenAPI/Swagger)

### 4. Monetization of the API itself
| Tier | Price | Use case |
|------|-------|----------|
| Free | 1000 calls/month | Hobby devs, students |
| Pro | Rs.X/month | Startups, small firms |
| Enterprise | Custom | Law firms, govt, legal-tech |

> Ye Lawyer Bhai AI se **alag** revenue stream hai. "Stripe for Pakistani laws."

---

## 🔒 Key Principles (Anas ke words)

1. **Apni creation** — koi paid 3rd-party API nahi, sab khud banaya
2. **Secure** — proper DB, no data loss, API-key protected
3. **Fast** — production-grade speed (caching, indexing)
4. **Live** — always-on, reliable uptime
5. **First-of-its-kind** — Pakistan laws ki koi aisi API exist nahi karti

---

## ✅ Already Done (foundation ready hai)
- [x] PDF → sections extractor (`import_pdf.py`) — PPC pe 991 sections extracted
- [x] Auto-categorizer (Criminal/Family/Property/etc.)
- [x] Keyword + NLP matching engine (`laws_engine.py`)
- [x] 1056 laws in local DB (PPC + curated acts)
- [x] `laws_seed.json` export (1056 laws, git-tracked)
- [x] Supabase project connected
- [x] Base SQL schema (`database/schema.sql`)

## ⏭️ Next Steps
- [x] Build versioned public Laws API (FastAPI) — `laws-api/app/main.py`
- [x] API key system + rate limiting + tiers — `pklw_` keys, free/pro/enterprise
- [x] Swagger/OpenAPI docs — auto at `/docs`
- [x] pakistancode.gov.pk bulk importer — `laws-api/scrape_pakistancode.py`
- [x] Lawyer Bhai AI integration — `backend/paklaw_client.py` (PakLaw first, local fallback)
- [ ] Full corpus import (run `--import` batches until catalog done)
- [ ] Anas ki authoritative book PDFs → `laws-api/import_pdf.py`
- [ ] Deploy live on Render (`laws-api/render.yaml` ready)
- [ ] Extraction pipeline improve (Urdu, amendments, cross-refs)
- [ ] Migrate laws → Supabase (PostgreSQL + pgvector) for scale
- [ ] Public launch as standalone product

---

_Note saved: Anas exact books batayega, phir yahin se implement karenge.
Ye project ka core moat hai — sabse bada differentiator._
