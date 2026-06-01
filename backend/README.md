---
title: Lawyer Bhai AI Backend
emoji: ⚖️
colorFrom: green
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Lawyer Bhai AI — Backend API

Pakistani legal AI backend. FastAPI + 1000+ laws + NLP + OCR.

## Endpoints
- `GET /` — health check
- `GET /laws/categories` — law counts by category
- `GET /laws/search?q=...` — NLP law search
- `POST /analyze` — case analysis + win probability
- `POST /chat` — LawyerGPT chat
- `POST /ocr` — document text extraction
