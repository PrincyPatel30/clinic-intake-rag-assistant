-- Vector store for the clinic intake corpus.
create extension if not exists vector with schema extensions;

create table if not exists public.clinical_chunks (
  id                      text primary key,
  document_id             text not null,
  document_name           text not null,
  specialty               text not null,
  section                 text not null,
  heading_path            text[] not null default '{}',
  question_text           text not null,
  context_sentence        text not null,
  question_ids            text[] not null default '{}',
  keywords                text[] not null default '{}',
  target_slot             text not null,
  suggested_quick_replies text[],
  input_widget            text,
  -- exact text handed to the embedding model, kept for provenance/debugging
  embedded_text           text not null,
  -- flattened question + context + keywords + headings, for keyword search
  search_text             text not null,
  -- 1536 dims: Gemini embeddings truncated via MRL so pgvector HNSW can index
  -- them (HNSW caps at 2000 dims, so the native 3072 would be unindexable)
  embedding               extensions.vector(1536),
  created_at              timestamptz not null default now(),
  fts tsvector generated always as (to_tsvector('english', coalesce(search_text, ''))) stored
);

create index if not exists clinical_chunks_embedding_hnsw
  on public.clinical_chunks using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists clinical_chunks_fts_gin
  on public.clinical_chunks using gin (fts);
create index if not exists clinical_chunks_specialty_idx
  on public.clinical_chunks (specialty);

-- The app reads with the publishable key and never writes. Writes are left to
-- the ingest script, which uses the service role key.
alter table public.clinical_chunks enable row level security;

create policy "clinical corpus is readable"
  on public.clinical_chunks for select to anon, authenticated using (true);
