# Clinic Intake RAG Assistant

A patient intake chatbot built with the RAG (Retrieval-Augmented Generation) approach, with one twist: **retrieval decides what the assistant asks next, not what it answers.**

---

## What it does

A patient describes how they feel in plain language. Instead of answering with medical advice, the system searches a corpus of clinical intake protocols and finds the most relevant **question that hasn't been asked yet** — the same question a nurse would ask before your appointment.

After a few turns it produces a structured pre-consultation summary the clinician can read in under a minute, with every answer traceable back to the exact patient sentence and protocol chunk that produced it.

It never diagnoses, never prescribes, and says so plainly when the question falls outside its protocols.

---

## What the patient sees

**Answer cards, not a blank box.** Each protocol chunk ships with four suggested
answers written alongside the question, so the assistant offers them as pick-one cards.
They come from the corpus rather than the model, which means they cannot be
hallucinated — and most patients would rather tap "Worse with exertion / better with
rest" than compose that sentence themselves. Free text still works for anything the
options do not cover.

**A four-stage tracker** — Symptom, Duration & severity, History, Summary — so the
patient can see how much is left. The stage is derived from what the conversation has
actually established, not from a turn counter, so it cannot drift out of sync with
reality.

**Visible grounding.** Every reply is labelled with the protocol specialty it came
from, or carries an explicit "no clinical protocol matched" badge when it falls below
the relevance floor. In that case the answer cards are suppressed: offering canned
answers to a question the corpus never covered is precisely the misleading behaviour
the floor exists to prevent.

---

## Technology / Tech Stack

React 19 + Vite, Express.js (TypeScript), Supabase PostgreSQL with pgvector, and the Google Gemini API. Deployed on Vercel — frontend and API in a single project. Everything runs inside free tiers.

## AI Model / Approach

I used Google Gemini for both generating embeddings and generating the final chat response. The API key came from Google AI Studio.

The corpus is 15 clinical intake protocol chunks across five specialties (Cardiology, General Practice, Dermatology, Oral Surgery, Pulmonology). Each chunk goes through four stages: **validation, embedding-text assembly, embedding, and storage**. Embeddings are generated with `gemini-embedding-001` at 1536 dimensions and stored in PostgreSQL using the pgvector extension.

When a patient sends a message, I generate an embedding for that message too. Postgres with pgvector compares it against every stored chunk vector using cosine similarity and returns the closest matches, filtered to exclude questions already asked in the session.

The retrieved question is then added to the prompt and sent to Gemini, which phrases it conversationally. Because the question itself comes from the corpus rather than from the model, the assistant can't invent a clinical question that isn't in the vetted protocols.

The project also includes a **relevance floor**, so if the message doesn't match the protocols closely enough, the assistant says it can't help with that rather than steering the interview somewhere the protocols never covered.

---

## Flow

```
Protocol corpus → Validate → Build embedding text → Generate embeddings
    → Store in PostgreSQL/pgvector
        → Patient message → Red-flag guard → De-identify → Query embedding
            → Vector similarity search → Relevance floor → Top question
                → Gemini → Next question + updated intake summary
```

Two stages in that chain are deliberately **not** handled by the model:

**The red-flag guard** is hardcoded regex. Chest pain radiating to the jaw, stroke signs, suicidal ideation — these halt the interview and show emergency guidance whether or not an LLM is having a good day.

**De-identification** replaces names, dates and phone numbers with tokens (`[NAME_1]`, `[DATE_1]`) *before* anything leaves the server.

---

## Retrieval quality, measured

The repo ships a 30-item benchmark covering direct symptoms, negations ("I am **not** taking blood thinners"), exact drug names, misspellings ("ankels and feat are swolen"), vague complaints, and two unanswerable questions. Run against the live vector store:

| Strategy | hit@1 | hit@3 | MRR |
|---|---|---|---|
| Vector only | **96.4%** | **100%** | **0.976** |
| Keyword only | 75.0% | — | — |
| Hybrid RRF, equal weight | 85.7% | 96.4% | 0.912 |

Two results worth calling out, because both contradict what you'd assume.

### Hybrid retrieval made this corpus worse

The plan was hybrid retrieval — keyword and vector search fused with Reciprocal Rank Fusion. Measured, every bit of keyword weight hurt:

| Sparse weight | hit@1 | MRR |
|---|---|---|
| 0.0 | 96.4% | 0.976 |
| 0.2 | 92.9% | 0.958 |
| 0.6 | 89.3% | 0.935 |
| 1.0 | 85.7% | 0.912 |

The cause is the corpus, not the technique. Fifteen short intake questions, most containing "pain", "chest" or "symptom" — keyword ranking can't separate them, so it adds noise that drags correct vector hits off the top spot. Hybrid retrieval earns its keep on large corpora with rare exact tokens (drug names, billing codes); this corpus is neither.

The keyword arm is fully implemented and weighted `0` by default, one env var (`RRF_SPARSE_WEIGHT`) away from returning. Expect this to flip as the corpus grows.

### The relevance floor had to be measured, not guessed

Embeddings are anisotropic — unrelated text does *not* score near zero, so a naive `score > 0.2` check never fires. Measured against the benchmark:

- lowest-scoring **on-topic** query: `0.577`
- highest-scoring **off-topic** query (*"what time is the cafeteria open?"*): `0.556`

`0.57` sits in that gap. It's a narrow gap resting on two negative examples, so it's provisional — add more true negatives and re-measure before trusting it in production.

---

## Running it locally

**Prerequisites:** Node 20+, pnpm, a [Gemini API key](https://aistudio.google.com/apikey), a Supabase project.

```bash
pnpm install
cp .env.example .env.local     # add your keys
pnpm ingest                    # embed the corpus into Supabase
pnpm dev                       # http://localhost:3000
```

Database schema lives in `supabase/migrations/` — run those against your project first, and enable `pgvector`.

| Variable | Needed by | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | app + ingest | Embeddings and generation |
| `SUPABASE_URL` | app + ingest | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | app | Read-only corpus access |
| `SUPABASE_SERVICE_ROLE_KEY` | **ingest only** | Write access. Never deploy this. |
| `RELEVANCE_FLOOR` | optional | Decline threshold, default `0.57` |
| `RRF_SPARSE_WEIGHT` | optional | Keyword arm weight, default `0` |

The running app only ever *reads*. Row Level Security is on with a select-only policy, so nothing deployed carries a credential that can write to the database.

---

## Project layout

```
api/index.ts              Vercel serverless entry
server.ts                 All API routes; exports the Express app
dev.ts                    Local dev server (Vite middleware + listen)
scripts/ingest.ts         Corpus → validate → embed → Supabase
supabase/migrations/      Schema, hybrid search function, eval set
src/lib/
  embeddings.ts           Gemini embedding calls
  retrieval.ts            Vector + keyword search, RRF, relevance floor
  safetyGuards.ts         Red-flag detection, output validation
  deidentifier.ts         PII tokenization
src/data/protocols.ts     The clinical protocol corpus
src/components/           Patient view, doctor view, pipeline inspector
rag_chatbot_pipeline.ipynb  Exploratory notebook (LangChain + Chroma prototype)
```

---

## Honest limitations

- **`medicalKnowledgeRetriever.ts` is demo-rigged.** It hardcodes refusal phrases (`q.includes('xylophrin')`) instead of retrieving. It backs a separate demo tab, not the main intake chat.
- **The corpus is small** — 15 chunks. Enough to demonstrate the pipeline, not enough for real clinical coverage.
- **Cold-start latency is ~15s** on a first request: serverless cold start, then an embedding call, then generation.
- **The relevance floor rests on two negative examples.**
- **Not a medical device.** This is an educational project. It is not validated for clinical use and must not be used to make care decisions. AI can make mistakes.
