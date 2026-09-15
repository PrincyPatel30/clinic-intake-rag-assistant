/**
 * One-time ingest: clinical corpus -> Gemini embeddings -> Supabase pgvector.
 *
 *   pnpm ingest
 *
 * Mirrors the classic RAG ingest stages, all visible in one file:
 *   parse -> validate -> build embedding text -> embed -> store
 *
 * Safe to re-run: rows are upserted by chunk id, so a second run refreshes
 * embeddings instead of duplicating the corpus.
 *
 * This is the ONLY writer to the database. It needs the service role key,
 * because RLS denies writes to everyone else — which is exactly why the
 * deployed app (read-only, publishable key) never carries a write credential.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { CLINICAL_CHUNKS } from '../src/data/protocols';
import { embedText, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from '../src/lib/embeddings';
import { ClinicalChunk } from '../src/types';

/**
 * What actually gets embedded.
 *
 * Not just the question: a bare question like "How severe is it?" is nearly
 * meaningless as a vector. Folding in the section heading, the context sentence
 * and the keywords gives the embedding enough signal to match a patient saying
 * "it's about a 7 out of 10".
 */
function buildEmbeddingText(chunk: ClinicalChunk): string {
  return [
    chunk.specialty,
    chunk.headingPath.join(' > '),
    chunk.section,
    chunk.questionText,
    chunk.contextSentence,
    chunk.keywords.join(', '),
  ]
    .filter(Boolean)
    .join('\n');
}

/** Flattened text for Postgres full-text search (the sparse retrieval arm). */
function buildSearchText(chunk: ClinicalChunk): string {
  return [
    chunk.questionText,
    chunk.contextSentence,
    chunk.keywords.join(' '),
    chunk.headingPath.join(' '),
  ]
    .filter(Boolean)
    .join(' ');
}

/** Fail loudly on a malformed chunk rather than storing an unsearchable row. */
function validate(chunk: ClinicalChunk): string[] {
  const problems: string[] = [];
  if (!chunk.id) problems.push('missing id');
  if (!chunk.questionText) problems.push('missing questionText');
  if (!chunk.specialty) problems.push('missing specialty');
  if (!chunk.targetSlot) problems.push('missing targetSlot');
  if (!chunk.keywords?.length) problems.push('no keywords');
  return problems;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
        'The service role key is in your Supabase dashboard under ' +
        'Project Settings > API Keys. Put it in .env.local — it is gitignored ' +
        'and is never deployed to Vercel.'
    );
    process.exit(1);
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY. Get one at https://aistudio.google.com/apikey');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Ingesting ${CLINICAL_CHUNKS.length} clinical chunks`);
  console.log(`Embedding model: ${EMBEDDING_MODEL} @ ${EMBEDDING_DIMENSIONS} dims\n`);

  // --- 1. Validate -------------------------------------------------------
  const invalid = CLINICAL_CHUNKS.map((c) => ({ id: c.id, problems: validate(c) })).filter(
    (r) => r.problems.length > 0
  );
  if (invalid.length > 0) {
    console.error('Validation failed:');
    invalid.forEach((r) => console.error(`  ${r.id}: ${r.problems.join(', ')}`));
    process.exit(1);
  }
  console.log(`Validated ${CLINICAL_CHUNKS.length}/${CLINICAL_CHUNKS.length} chunks\n`);

  // --- 2. Embed ----------------------------------------------------------
  const rows = [];
  for (let i = 0; i < CLINICAL_CHUNKS.length; i++) {
    const chunk = CLINICAL_CHUNKS[i];
    const embeddedText = buildEmbeddingText(chunk);

    // RETRIEVAL_DOCUMENT here, RETRIEVAL_QUERY at search time — Gemini embeds
    // the same sentence differently depending on which side it is on.
    const embedding = await embedText(embeddedText, 'RETRIEVAL_DOCUMENT');

    rows.push({
      id: chunk.id,
      document_id: chunk.documentId,
      document_name: chunk.documentName,
      specialty: chunk.specialty,
      section: chunk.section,
      heading_path: chunk.headingPath,
      question_text: chunk.questionText,
      context_sentence: chunk.contextSentence,
      question_ids: chunk.questionIds,
      keywords: chunk.keywords,
      target_slot: chunk.targetSlot,
      suggested_quick_replies: chunk.suggestedQuickReplies ?? null,
      input_widget: chunk.inputWidget ?? null,
      embedded_text: embeddedText,
      search_text: buildSearchText(chunk),
      embedding: JSON.stringify(embedding),
    });

    process.stdout.write(`\r  embedded ${i + 1}/${CLINICAL_CHUNKS.length}`);
  }
  console.log('\n');

  // --- 3. Store ----------------------------------------------------------
  const { error } = await supabase.from('clinical_chunks').upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error(`Upsert failed: ${error.message}`);
    process.exit(1);
  }

  const { count } = await supabase
    .from('clinical_chunks')
    .select('*', { count: 'exact', head: true });

  console.log(`Stored ${rows.length} chunks. Table now holds ${count} rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
