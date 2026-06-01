-- ============================================================
--  Lawyer Bhai AI — Laws Database Schema
--  Database: Supabase (PostgreSQL)
-- ============================================================

-- Enable full-text search + vector extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
--  LAWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS laws (
  id              SERIAL PRIMARY KEY,
  act_name        TEXT NOT NULL,          -- "Pakistan Penal Code 1860"
  act_short       TEXT,                   -- "PPC"
  section_number  TEXT NOT NULL,          -- "302", "Article 9"
  section_title   TEXT NOT NULL,          -- "Punishment for Murder"
  text_en         TEXT NOT NULL,          -- Full English text
  text_ur         TEXT,                   -- Urdu translation
  category        TEXT NOT NULL,          -- Criminal | Civil | Constitutional | Family | Property | Labor | Consumer
  sub_category    TEXT,                   -- Murder | Theft | Contract | Divorce etc.
  keywords        TEXT[]  DEFAULT '{}',   -- for NLP keyword matching
  punishment      TEXT,                   -- "Imprisonment up to 7 years / fine"
  is_bailable     BOOLEAN DEFAULT NULL,
  severity        TEXT,                   -- High | Medium | Low
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  INDEXES (for fast search)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_laws_category    ON laws(category);
CREATE INDEX IF NOT EXISTS idx_laws_act         ON laws(act_name);
CREATE INDEX IF NOT EXISTS idx_laws_keywords    ON laws USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_laws_fts         ON laws USING GIN(
  to_tsvector('english', coalesce(text_en,'') || ' ' || coalesce(section_title,'') || ' ' || coalesce(act_name,''))
);
CREATE INDEX IF NOT EXISTS idx_laws_trgm        ON laws USING GIN(section_title gin_trgm_ops);

-- ============================================================
--  CASES TABLE (user cases)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_cases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  status        TEXT DEFAULT 'open',   -- open | closed | pending
  matched_laws  INTEGER[],             -- FK to laws.id
  accuracy_score NUMERIC(5,2),         -- ML win probability %
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  SEARCH FUNCTION (used by API)
-- ============================================================
CREATE OR REPLACE FUNCTION search_laws(query TEXT, cat TEXT DEFAULT NULL)
RETURNS TABLE (
  id INT, act_name TEXT, act_short TEXT, section_number TEXT,
  section_title TEXT, text_en TEXT, category TEXT, keywords TEXT[],
  punishment TEXT, severity TEXT, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id, l.act_name, l.act_short, l.section_number,
    l.section_title, l.text_en, l.category, l.keywords,
    l.punishment, l.severity,
    ts_rank(
      to_tsvector('english', coalesce(l.text_en,'') || ' ' || coalesce(l.section_title,'')),
      plainto_tsquery('english', query)
    ) AS rank
  FROM laws l
  WHERE
    (cat IS NULL OR l.category = cat)
    AND (
      to_tsvector('english', coalesce(l.text_en,'') || ' ' || coalesce(l.section_title,'') || ' ' || coalesce(l.act_name,''))
      @@ plainto_tsquery('english', query)
      OR l.keywords && ARRAY[query]
      OR l.section_title ILIKE '%' || query || '%'
    )
  ORDER BY rank DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
