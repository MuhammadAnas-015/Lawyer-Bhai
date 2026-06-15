# ⚖️ Lawyer Bhai AI

Pakistan ka AI Legal Assistant — bilingual (English/Urdu) legal guidance, document analysis, aur law search.

## Features
- 🤖 **LawyerGPT** — AI legal chat assistant
- 📋 **Legal Guide** — apna masla likho, relevant Pakistani laws + win probability
- 📄 **Document Analysis** — PDF/image upload → OCR + legal analysis
- 📖 **Law Book** — 1000+ Pakistani laws (PPC, Constitution, Family, Property...)
- 💼 **My Cases** — case tracking
- 👨‍⚖️ **Find Vakeel** — lawyer directory
- 🎭 **3D Avatar** — animated legal advisor (FBX + Three.js)

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS + Motion |
| 3D | Three.js (FBX avatar) |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / Supabase PostgreSQL (prod) |
| NLP | Custom keyword + TF-IDF matching |
| OCR | Tesseract + pdfminer |

## PakLaw API 🆕
Standalone product in [`laws-api/`](laws-api/) — Pakistan's first structured laws API.
API-key protected (`pklw_...`), full-text search, case matching, tiered rate limits.
Lawyer Bhai AI backend consumes it via `backend/paklaw_client.py` (env:
`PAKLAW_API_URL`, `PAKLAW_API_KEY`) with automatic local fallback.
See [laws-api/README.md](laws-api/README.md).

## Project Structure
```
LawyerBhaiAI/
├── laws-api/          PakLaw API (standalone product)
├── frontend/          React + Vite app
│   ├── src/
│   │   ├── components/   All UI components
│   │   ├── utils/        API client + avatar preloader
│   │   └── styles/       main.css
│   └── public/avatar.fbx
├── backend/           FastAPI server
│   ├── main.py          API endpoints
│   ├── laws_engine.py   NLP + laws database
│   ├── ocr_engine.py    Document text extraction
│   └── scraper.py       Bulk law importer
└── database/          SQL schema + seed for Supabase
```

## Local Setup

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8000   # http://localhost:8000
```

## Deployment
See [DEPLOY.md](./DEPLOY.md) for full guide (Vercel + Render).

## License
Proprietary — © 2026 Lawyer Bhai AI


