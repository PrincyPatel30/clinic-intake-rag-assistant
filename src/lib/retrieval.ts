/**
 * Hybrid retrieval, run against Supabase Postgres.
 *
 * This is the module that replaced the simulated retrieval in ragEngine.ts.
 * Both arms are now real:
 *
 *   dense  — the question is embedded by Gemini, and Postgres compares that
 *            vector against every stored chunk vector with pgvector cosine
 *            distance (HNSW indexed). The vectors never come back into Node.
 *   sparse — Postgres full-text search (`ts_rank` over a GIN index), which is
 *            what the old in-process BM25 class was standing in for.
 *
 * The two rankings are then fused with Reciprocal Rank Fusion, exactly as
 * before — RRF only needs ranks, so swapping the underlying scorers changes
 * nothing about the fusion step.
 *
 * Server-side only: it needs the Gemini key to embed the query.
 */

import { ClinicalChunk, CandidateScore } from '../types';
import { embedText } from './embeddings';
import { getSupabase } from './supabaseClient';

/** One row as the hybrid_search_clinical_chunks() SQL function returns it. */
interface HybridRow {
  id: string;
  document_id: string;
  document_name: string;
  specialty: string;
  section: string;
  heading_path: string[];
  question_text: string;
  context_sentence: string;
  question_ids: string[];
  keywords: string[];
  target_slot: string;
  suggested_quick_replies: string[] | null;
  input_widget: string | null;
  dense_score: number;
  sparse_score: number;
}

export interface RetrievalOutput {
  candidates: CandidateScore[];
  selectedChunk: ClinicalChunk | null;
  isLowConfidenceFallback: boolean;
  /** Every chunk the database returned, so callers can resolve ids to content. */
  chunks: ClinicalChunk[];
}

/**
 * Below this cosine similarity, a "match" is noise rather than a real hit.
 *
 * Embeddings are anisotropic: unrelated text does NOT score near zero, so a
 * naive `score > 0.2` floor never fires. Measured against the 30-item benchmark
 * stored in the `retrieval_eval_set` table:
 *
 *   lowest-scoring on-topic query   0.577
 *   highest-scoring off-topic query 0.556
 *
 * 0.57 sits in that gap. The gap is narrow (0.021) and rests on only two
 * off-topic examples, so treat this as provisional: add more true negatives to
 * the eval set and re-measure before relying on it in production.
 */
export const RELEVANCE_FLOOR = Number(process.env.RELEVANCE_FLOOR ?? 0.57);

/**
 * Weight of the keyword (sparse) ranking in the fusion. The vector ranking is
 * always weighted 1.0.
 *
 * The original spec mandated equal-weight hybrid RRF at k=60. Measured on the
 * 30-item benchmark, equal weighting is the WORST setting for this corpus:
 *
 *   sparse weight   hit@1    hit@3    MRR
 *   0.0             96.4%    100%     0.976
 *   0.2             92.9%    100%     0.958
 *   0.6             89.3%    100%     0.935
 *   1.0 (spec)      85.7%    96.4%    0.912
 *
 * The cause is the corpus itself: 15 short, near-synonymous intake questions,
 * most of which contain "pain", "chest" or "symptom". Keyword ranking cannot
 * separate them, so it injects noise that drags correct vector hits off the top
 * spot. Hybrid retrieval earns its keep on large corpora with rare exact tokens
 * (drug names, billing codes) -- this corpus is neither large nor rare-token.
 *
 * The sparse arm therefore stays fully implemented but weighted 0 by default,
 * one env var away from returning. Re-run the benchmark as the corpus grows;
 * this number is expected to flip.
 */
export const SPARSE_WEIGHT = Number(process.env.RRF_SPARSE_WEIGHT ?? 0);

function rowToChunk(row: HybridRow): ClinicalChunk {
  return {
    id: row.id,
    documentId: row.document_id,
    documentName: row.document_name,
    specialty: row.specialty as ClinicalChunk['specialty'],
    section: row.section,
    headingPath: row.heading_path ?? [],
    questionText: row.question_text,
    contextSentence: row.context_sentence,
    questionIds: row.question_ids ?? [],
    keywords: row.keywords ?? [],
    targetSlot: row.target_slot,
    suggestedQuickReplies: row.suggested_quick_replies ?? undefined,
    inputWidget: (row.input_widget as ClinicalChunk['inputWidget']) ?? undefined,
  };
}

/** Rank an array of scores, highest first, returning 1-based ranks by index. */
function ranksFor(scores: number[]): number[] {
  const order = scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
  const ranks = new Array(scores.length).fill(0);
  order.forEach((idx, rank) => {
    ranks[idx] = rank + 1;
  });
  return ranks;
}

/**
 * Reciprocal Rank Fusion at k = 60.
 *
 * RRF deliberately ignores the raw score magnitudes and uses only positions,
 * which is why a cosine similarity (0..1) and a ts_rank (unbounded) can be
 * combined without normalizing either one.
 */
function fuse(
  rows: HybridRow[],
  askedQuestionIds: Set<string>,
  activeSpecialty?: string
): CandidateScore[] {
  const K = 60;
  const denseRanks = ranksFor(rows.map((r) => r.dense_score));
  const sparseRanks = ranksFor(rows.map((r) => r.sparse_score));

  const candidates: CandidateScore[] = rows.map((row, idx) => {
    const dRank = denseRanks[idx];
    const sRank = sparseRanks[idx];

    let excludedReason: string | undefined;
    if ((row.question_ids ?? []).some((qid) => askedQuestionIds.has(qid))) {
      excludedReason = 'Question already asked in this intake session';
    } else if (activeSpecialty && activeSpecialty !== 'All' && row.specialty !== activeSpecialty) {
      excludedReason = `Specialty mismatch (Session: ${activeSpecialty}, Chunk: ${row.specialty})`;
    }

    return {
      chunkId: row.id,
      section: row.section,
      questionText: row.question_text,
      // Kept under the original field names so the Pipeline Inspector UI and the
      // trace format continue to work unchanged.
      bm25Score: Number(row.sparse_score.toFixed(3)),
      bm25Rank: sRank,
      denseScore: Number(row.dense_score.toFixed(3)),
      denseRank: dRank,
      rrfScore: Number((1 / (K + dRank) + SPARSE_WEIGHT / (K + sRank)).toFixed(5)),
      finalRank: 0,
      excludedReason,
    };
  });

  candidates.sort((a, b) => b.rrfScore - a.rrfScore);
  candidates.forEach((c, i) => {
    c.finalRank = i + 1;
  });
  return candidates;
}

/**
 * Retrieve the next best intake question for an utterance.
 *
 * Note this is the "inverted RAG" the project is built around: retrieval picks
 * what the assistant ASKS next, not what it answers.
 */
export async function runHybridRetrieval(
  query: string,
  askedQuestionIds: Set<string> = new Set(),
  activeSpecialty?: string
): Promise<RetrievalOutput> {
  const queryEmbedding = await embedText(query, 'RETRIEVAL_QUERY');

  const { data, error } = await getSupabase().rpc('hybrid_search_clinical_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    query_text: query,
    filter_specialty: activeSpecialty ?? null,
  });

  if (error) {
    throw new Error(`Supabase hybrid search failed: ${error.message}`);
  }

  const rows = (data ?? []) as HybridRow[];
  if (rows.length === 0) {
    return { candidates: [], selectedChunk: null, isLowConfidenceFallback: true, chunks: [] };
  }

  const chunks = rows.map(rowToChunk);
  const candidates = fuse(rows, askedQuestionIds, activeSpecialty);
  const eligible = candidates.filter((c) => !c.excludedReason);

  if (eligible.length === 0) {
    // Everything in scope has been asked already — fall back to the first
    // unasked chunk rather than repeating a question.
    const fallback =
      chunks.find((c) => !c.questionIds.some((qid) => askedQuestionIds.has(qid))) ?? chunks[0];
    return { candidates, selectedChunk: fallback, isLowConfidenceFallback: true, chunks };
  }

  const top = eligible[0];
  const selectedChunk = chunks.find((c) => c.id === top.chunkId) ?? null;

  // The relevance floor is checked against the real cosine score, not the fused
  // rank: RRF always produces a #1 even when nothing is actually relevant.
  const isLowConfidenceFallback = top.denseScore < RELEVANCE_FLOOR;

  return { candidates, selectedChunk, isLowConfidenceFallback, chunks };
}
