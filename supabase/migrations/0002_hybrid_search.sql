-- Hybrid retrieval: every candidate comes back with BOTH a real cosine
-- similarity and a real full-text rank, so the app can fuse the two rankings
-- with RRF and show the user why a chunk lost, not just which one won.
--
-- Note on the tsquery: patients type sentences, not search terms.
-- `websearch_to_tsquery` AND-s every word together, which matched almost
-- nothing and left most rows tied at rank 0 -- arbitrary ties that RRF then
-- treated as signal. OR-ing the lexemes gives the sparse arm a real ordering.
create or replace function public.hybrid_search_clinical_chunks(
  query_embedding extensions.vector(1536),
  query_text      text,
  filter_specialty text default null
)
returns table (
  id text, document_id text, document_name text, specialty text, section text,
  heading_path text[], question_text text, context_sentence text,
  question_ids text[], keywords text[], target_slot text,
  suggested_quick_replies text[], input_widget text,
  dense_score double precision, sparse_score double precision
)
language sql stable
set search_path = public, extensions
as $$
  with q as (
    select case
      when array_length(tsvector_to_array(to_tsvector('english', coalesce(query_text, ''))), 1) is null
        then null::tsquery
      else array_to_string(tsvector_to_array(to_tsvector('english', query_text)), ' | ')::tsquery
    end as tsq
  )
  select
    c.id, c.document_id, c.document_name, c.specialty, c.section, c.heading_path,
    c.question_text, c.context_sentence, c.question_ids, c.keywords,
    c.target_slot, c.suggested_quick_replies, c.input_widget,
    -- pgvector's <=> is cosine DISTANCE (0 = identical); 1 - distance = similarity
    (1 - (c.embedding <=> query_embedding))::double precision as dense_score,
    coalesce(ts_rank(c.fts, q.tsq), 0)::double precision       as sparse_score
  from public.clinical_chunks c
  cross join q
  where c.embedding is not null
    and (filter_specialty is null or filter_specialty = 'All' or c.specialty = filter_specialty)
  order by dense_score desc;
$$;
