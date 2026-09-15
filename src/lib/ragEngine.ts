/**
 * Browser-side retrieval client.
 *
 * This file used to contain the retrieval engine itself: an in-process BM25
 * index plus a `computeDenseSimilarity()` function whose comment claimed to
 * "simulate high-dimensional semantic alignment". In practice that was a
 * hand-written keyword and synonym lookup — no embedding was ever computed, so
 * the "dense vector" column in the Pipeline Inspector was not a vector score.
 *
 * Real retrieval now lives in `src/lib/retrieval.ts` and runs on the server,
 * because it needs the Gemini API key to embed the query and a Supabase
 * connection to search the vectors. Neither belongs in a browser bundle.
 *
 * What is left here is the thin client the UI uses to ask the server to run it.
 */

import { CandidateScore, ClinicalChunk } from '../types';

export interface RetrievalInspection {
  candidates: CandidateScore[];
  selectedChunk: ClinicalChunk | null;
  isLowConfidenceFallback: boolean;
  corpusSize: number;
}

/**
 * Run the real hybrid retrieval pipeline on the server and return what it saw.
 *
 * Scores in the result are genuine: `denseScore` is pgvector cosine similarity
 * against a Gemini embedding, `bm25Score` is a Postgres `ts_rank`.
 */
export async function inspectRetrieval(
  query: string,
  askedQuestionIds: string[] = [],
  activeSpecialty?: string
): Promise<RetrievalInspection> {
  const res = await fetch('/api/retrieval/inspect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, askedQuestionIds, activeSpecialty }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.error || `Retrieval failed (${res.status})`);
  }
  return res.json();
}
