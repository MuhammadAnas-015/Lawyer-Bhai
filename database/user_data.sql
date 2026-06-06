-- ============================================================
--  Lawyer Bhai AI — User Data Tables (cases + documents)
--  Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ─── CASES ─────────────────────────────────────────────────
create table if not exists public.cases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  category    text default 'General',
  status      text default 'active',     -- active | pending | closed
  progress    int  default 10,
  created_at  timestamptz default now()
);

-- ─── SAVED DOCUMENTS ──────────────────────────────────────
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  file_name     text not null,
  extracted_text text,
  win_pct       numeric,
  matched_laws  jsonb,
  created_at    timestamptz default now()
);

-- ─── Row Level Security — har user sirf apna data dekhe ───
alter table public.cases     enable row level security;
alter table public.documents enable row level security;

-- Cases policies
create policy "own cases select" on public.cases
  for select using (auth.uid() = user_id);
create policy "own cases insert" on public.cases
  for insert with check (auth.uid() = user_id);
create policy "own cases update" on public.cases
  for update using (auth.uid() = user_id);
create policy "own cases delete" on public.cases
  for delete using (auth.uid() = user_id);

-- Documents policies
create policy "own docs select" on public.documents
  for select using (auth.uid() = user_id);
create policy "own docs insert" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "own docs delete" on public.documents
  for delete using (auth.uid() = user_id);

-- ─── Indexes for speed ────────────────────────────────────
create index if not exists idx_cases_user on public.cases(user_id);
create index if not exists idx_docs_user  on public.documents(user_id);
