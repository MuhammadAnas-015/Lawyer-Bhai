# Lawyer Bhai AI — Deployment Guide

## Step 1 — GitHub pe upload karo

1. https://github.com pe account banao (free)
2. "New Repository" → name: `lawyer-bhai-ai` → Create
3. Apne PC pe Git Bash kholo:

```bash
cd C:\Users\anass\LawyerBhaiAI
git init
git add .
git commit -m "Lawyer Bhai AI — initial commit"
git remote add origin https://github.com/YOUR_USERNAME/lawyer-bhai-ai.git
git push -u origin main
```

---

## Step 2 — Frontend Deploy (Vercel — FREE)

1. https://vercel.com pe account banao (GitHub se login karo)
2. "Add New Project" → apna repo select karo
3. Framework: **Other** (static HTML)
4. Root Directory: `/` (main folder)
5. Deploy click karo

**Result:** `https://lawyer-bhai-ai.vercel.app` (FREE domain!)

---

## Step 3 — Backend Deploy (Render — FREE)

1. https://render.com pe account banao
2. "New Web Service" → GitHub repo connect karo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11
4. "Add Disk" → Mount Path: `/data`, Size: 1GB
5. Deploy karo

**Result:** `https://lawyer-bhai-api.onrender.com` (FREE!)

---

## Step 4 — Frontend ko Backend se connect karo

`index.html` mein yeh line update karo:

```javascript
// Pehle:
const API_BASE = "http://localhost:8000";

// Baad mein (Render URL daalo):
const API_BASE = "https://lawyer-bhai-api.onrender.com";
```

Phir Vercel pe dobara deploy karo.

---

## Step 5 — Custom Domain (Optional)

- `.pk` domain: PKR 2,000-3,000/year (PKNIC.net)
- `.com` domain: $10-15/year (Namecheap)
- Vercel pe free me connect ho jata hai

---

## Future: Supabase (Production DB)

Jab users badhein to Supabase use karo:
1. https://supabase.com → New Project
2. `database/schema.sql` run karo
3. `database/seed_laws.sql` run karo
4. `.env` mein Supabase URL + Key daalo
