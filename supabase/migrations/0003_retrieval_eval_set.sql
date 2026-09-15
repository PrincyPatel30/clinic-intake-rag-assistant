-- The 30-item retrieval benchmark, kept in the database so quality can be
-- re-measured after any change to chunking, embeddings, or fusion weights.
create table if not exists public.retrieval_eval_set (
  id       text primary key,
  query    text not null,
  expected text not null,
  category text
);

alter table public.retrieval_eval_set enable row level security;

create policy "eval set is readable"
  on public.retrieval_eval_set for select to anon, authenticated using (true);

-- Rows are seeded from src/data/retrieval_eval_set.ts
