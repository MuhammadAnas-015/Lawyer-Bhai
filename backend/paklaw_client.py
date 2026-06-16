"""
PakLaw API client for Lawyer Bhai AI backend.
Uses the live PakLaw API when PAKLAW_API_URL + PAKLAW_API_KEY are set;
falls back silently to the local laws_engine if unreachable.

Env:
  PAKLAW_API_URL  e.g. https://paklaw-api.onrender.com  (or http://localhost:9000)
  PAKLAW_API_KEY  e.g. pklw_xxxxxxxx...
"""
import os
import requests

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass

PAKLAW_URL = os.environ.get("PAKLAW_API_URL", "").rstrip("/")
PAKLAW_KEY = os.environ.get("PAKLAW_API_KEY", "")


def enabled() -> bool:
    return bool(PAKLAW_URL and PAKLAW_KEY)


def _headers():
    return {"X-API-Key": PAKLAW_KEY}


def search_laws(query: str, category: str = None, top: int = 5):
    """Returns list of laws (PakLaw schema mapped to local schema) or None on failure."""
    if not enabled():
        return None
    try:
        r = requests.post(
            f"{PAKLAW_URL}/v1/match",
            json={"description": query, "category": category, "limit": top},
            headers=_headers(), timeout=10,
        )
        r.raise_for_status()
        return [_map_law(l) for l in r.json().get("laws", [])]
    except requests.RequestException:
        return None


def _map_law(l: dict) -> dict:
    """PakLaw v1 law → local laws_engine row shape (drop-in compatible)."""
    return {
        "act_name": l.get("act_name", ""),
        "act_short": l.get("short_name") or "",
        "section_num": l.get("section_no", ""),
        "title": l.get("title") or "",
        "text_en": l.get("text", ""),
        "category": l.get("category") or "General",
        "sub_cat": l.get("sub_category") or "",
        "keywords": l.get("keywords") or [],
        "punishment": l.get("punishment"),
        "bailable": l.get("bailable"),
        "severity": l.get("severity") or "Medium",
        "score": l.get("relevance", 0),
    }
