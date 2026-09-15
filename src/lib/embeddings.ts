/**
 * Gemini embeddings — the real semantic layer.
 *
 * This replaces the old `computeDenseSimilarity()` in ragEngine.ts, which was a
 * hand-written keyword/synonym lookup dressed up as a vector score. Nothing here
 * is simulated: text goes to Gemini, a float vector comes back.
 *
 * Server-side only. The API key never reaches the browser.
 */

import { GoogleGenAI } from '@google/genai';

/** Gemini's current embedding model. */
export const EMBEDDING_MODEL = 'gemini-embedding-001';

/**
 * Why 1536 and not the model's native 3072:
 * pgvector's HNSW index caps out at 2000 dimensions, so a 3072-dim column can be
 * stored but never indexed — every query would fall back to a sequential scan.
 * Gemini's embeddings are Matryoshka (MRL), so truncating to 1536 keeps most of
 * the signal and buys us a real ANN index. Must match vector(1536) in the schema.
 */
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Google truncates rather than re-normalizes when outputDimensionality < 3072,
 * so the returned vector is no longer unit length. Cosine distance divides the
 * norms out anyway, but normalizing keeps the stored vectors correct if anything
 * ever compares them with a plain dot product.
 */
function normalize(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum);
  return norm === 0 ? v : v.map((x) => x / norm);
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set — cannot generate embeddings.');
    }
    client = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return client;
}

/**
 * Embed a single piece of text.
 *
 * `taskType` matters: Gemini embeds the same sentence differently depending on
 * whether it is a stored document or a search query, and using the right one on
 * each side measurably improves retrieval.
 */
export async function embedText(
  text: string,
  taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_QUERY'
): Promise<number[]> {
  const response = await getClient().models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values || values.length === 0) {
    throw new Error('Gemini returned an empty embedding.');
  }
  if (values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${values.length}. ` +
        'The database column is vector(1536) and will reject this.'
    );
  }
  return normalize(values);
}

/**
 * Embed many texts, in small batches so one failure doesn't cost the whole run
 * and so we stay well inside the free tier's rate limits.
 */
export async function embedBatch(
  texts: string[],
  taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_DOCUMENT',
  onProgress?: (done: number, total: number) => void
): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    out.push(await embedText(texts[i], taskType));
    onProgress?.(i + 1, texts.length);
  }
  return out;
}
