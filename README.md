# Clinic Intake RAG Assistant

A patient intake chatbot where **retrieval decides what the assistant asks next**, not what it answers.

Most RAG systems retrieve context in order to *answer* a question. This one inverts that: a patient describes how they feel in their own words, and the retriever searches a corpus of clinical intake protocols to find the single most relevant **question that has not been asked yet**. The result is a structured pre-consultation note a clinician can read in thirty seconds, with every filled field traceable back to the exact patient sentence and protocol chunk that produced it.

It never diagnoses, never prescribes, and declines when the patient's message isn't covered by the protocols it holds.

---

## Why this exists

Clinic intake is usually a paper form that asks everyone the same forty questions. Most are irrelevant to any given patient, so people skim, leave gaps, and the clinician starts the appointment doing data entry instead of medicine.

An interview that adapts is better — but a chatbot that free-associates about symptoms is worse than a form, because it will happily invent clinical advice. The design goal here is an interview that adapts **only within a vetted protocol corpus**, and can prove where every question came from.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + Tailwind + MUI |
| API | Express (TypeScript), deployed as a Vercel serverless function |
| Vector store | Supabase Postgres + `pgvector` (HNSW index) |
| Embeddings | Gemini `gemini-embedding-001`, 1536 dims |
| Generation | Gemini via `@google/genai` |
| Hosting | Vercel (frontend + API in one deployment) |

Everything runs inside free tiers.

---

## How a single turn works

```
Patient message
      │
      ▼
1. Red-flag guard ......... deterministic regex, no model involved
      │                     (chest pain + radiation, stroke signs, suicidal ideation)
      │  └── if triggered → stop the interview, show emergency guidance
      ▼
2. De-identification ...... names/dates/phones → [NAME_1], [DATE_1], [PHONE_1]
      │                     PII is replaced BEFORE anything leaves the server
      ▼
3. Embed the message ...... Gemini, taskType=RETRIEVAL_QUERY
      ▼
4. Search Postgres ........ pgvector cosine over protocol chunks
      │                     + Postgres full-text rank, fused by RRF
      │                     + specialty filter and already-asked exclusion in SQL
      ▼
5. Relevance floor ........ top cosine < 0.57 → decline instead of forcing a question
      ▼
6. Gemini extraction ...... pull structured slots out of the message
      ▼
7. Output guard ........... reject any reply that diagnoses or prescribes
      ▼
Next question + updated clinical note + full provenance trace
```

Step 1 is deliberately *not* delegated to the model. An emergency phrase has to halt the interview whether or not an LLM is having a good day.

---

## Quick start

**Prerequisites:** Node 20+, pnpm, a Gemini API key ([free](https://aistudio.google.com/apikey)), a Supabase project.

```bash
pnpm install
cp .env.example .env.local     # fill in your keys
pnpm ingest                    # embed the protocol corpus into Supabase
pnpm dev                       # http://localhost:3000
```

### Database setup

Run against your Supabase project:

```sql
create extension if not exists vector with schema extensions;
```

Then create the `clinical_chunks` table and the `hybrid_search_clinical_chunks()` function — both are in `supabase/migrations/`.

### Environment variables

| Variable | Needed by | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | app + ingest | Embeddings and generation |
| `SUPABASE_URL` | app + ingest | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | app | Read-only corpus access |
| `SUPABASE_SERVICE_ROLE_KEY` | **ingest only** | Write access. Never deploy this. |
| `RELEVANCE_FLOOR` | app (optional) | Decline threshold, default `0.57` |
| `RRF_SPARSE_WEIGHT` | app (optional) | Keyword arm weight, default `0` — see below |

The running app only ever *reads*. Row Level Security is on with a select-only policy, so the deployed application carries no credential that can write to the database.

---

## Retrieval quality, measured

The repo ships a 30-item benchmark (`retrieval_eval_set`) covering direct symptoms, negations ("I am **not** taking blood thinners"), exact drug names, misspellings ("ankels and feat are swolen"), vague complaints, and two unanswerable questions. Results against the live vector store:

| Strategy | hit@1 | hit@3 | MRR |
|---|---|---|---|
| Vector only | **96.4%** | **100%** | **0.976** |
| Keyword only | 75.0% | — | — |
| Hybrid RRF, equal weight | 85.7% | 96.4% | 0.912 |

### The keyword arm makes this corpus worse

The original specification mandated hybrid retrieval with equal-weight Reciprocal Rank Fusion. Measured, that is the **worst** configuration here:

| Sparse weight | hit@1 | MRR |
|---|---|---|
| 0.0 | 96.4% | 0.976 |
| 0.2 | 92.9% | 0.958 |
| 0.6 | 89.3% | 0.935 |
| 1.0 (as specified) | 85.7% | 0.912 |

The cause is the corpus, not the technique. There are 15 short, near-synonymous intake questions and most contain "pain", "chest" or "symptom" — keyword ranking cannot separate them, so it contributes noise that drags correct vector hits off the top spot. Hybrid retrieval earns its keep on large corpora with rare exact tokens (drug names, billing codes, part numbers); this corpus is neither large nor rare-token.

So the keyword arm is fully implemented and weighted `0` by default, one environment variable away from returning. **This is expected to flip as the corpus grows** — re-run the benchmark before trusting the default.

### The relevance floor is measured, not guessed

Embeddings are anisotropic: unrelated text does *not* score near zero, so a naive `score > 0.2` check never fires. Measured on the benchmark:

- lowest-scoring **on-topic** query: `0.577`
- highest-scoring **off-topic** query: `0.556`

`0.57` sits in that gap. The gap is narrow (0.021) and rests on only two off-topic examples, so treat it as provisional — add more true negatives and re-measure before relying on it in production.

---

## Safety design

Ten rules, enforced in code rather than in prompts:

1. **Never diagnose** — no disease names, no prognosis. An output guard inspects the reply before it is sent.
2. **No clinical image interpretation** — photos of wounds and rashes are rejected before any model call.
3. **Deterministic red-flag detection** — emergency phrases are hardcoded regex, never delegated to a model.
4. **Schema-validated model output** — structured extraction conforms to a JSON schema or is discarded.
5. **De-identification before transit** — PII becomes tokens before any external API call.
6. **Tri-state slots** — every field is `filled`, `patient_unsure`, or `not_yet_asked`. There is no silent default.
7. **Provenance on every slot** — each filled field references the exact quote and chunk that produced it.
8. **Grounded refusal** — below the relevance floor, the assistant declines rather than forcing an irrelevant question.
9. **No repeated questions** — already-asked chunks are excluded in SQL, before scoring.
10. **Zero recurring cost** — free tiers throughout.

---

## Project layout

```
api/index.ts              Vercel serverless entry (re-exports the Express app)
server.ts                 All API routes; also runs standalone for local dev
scripts/ingest.ts         Corpus → validate → embed → Supabase
src/lib/
  embeddings.ts           Gemini embedding calls
  retrieval.ts            Hybrid search + RRF fusion + relevance floor
  supabaseClient.ts       Read-only DB connection
  safetyGuards.ts         Red-flag detection, output validation
  deidentifier.ts         PII tokenization
  ragEngine.ts            Browser-side client for /api/retrieval/inspect
src/data/protocols.ts     The clinical protocol corpus
src/components/           Patient view, doctor view, pipeline inspector
```

### A note on `ragEngine.ts`

This file previously contained the retrieval engine itself, including a `computeDenseSimilarity()` function documented as simulating "high-dimensional semantic alignment". It was a hand-written keyword and synonym lookup — no embedding was ever computed, though the UI labelled its output "dense vector embeddings".

Real retrieval now lives in `src/lib/retrieval.ts` and runs server-side, because it needs an API key to embed the query and a database connection to search. What remains in `ragEngine.ts` is the thin client the browser uses to ask the server to run it.

---

## Deployment

Deployed on Vercel as a single project: Vite builds the frontend to `dist/`, and `api/index.ts` becomes a serverless function that `vercel.json` routes all `/api/*` traffic to.

Functions are pinned to `bom1` (Mumbai) to sit beside the Supabase project in `ap-south-1`. Co-locating matters here — every turn makes a database round trip, and crossing continents for it would add hundreds of milliseconds to an already model-bound request.

Set `GEMINI_API_KEY`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the Vercel project's environment variables. Do **not** set the service role key.

---

## Known limitations

- **`medicalKnowledgeRetriever.ts` is still demo-rigged.** It hardcodes specific refusal phrases (`q.includes('xylophrin')`) rather than retrieving. It backs a separate demo tab, not the main intake chat, and has not been rebuilt.
- **The corpus is small** — 15 chunks across five specialties. Enough to demonstrate the pipeline, not enough for real clinical coverage.
- **The relevance floor rests on two negative examples.** See above.
- **Not a medical device.** This is an educational project, not validated for clinical use, and must not be used to make care decisions.
