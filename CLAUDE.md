# CLAUDE.md — Clinic Intake RAG Assistant Architecture & Decision Log

**Date:** 2026-09-09
**Model Chosen:** `gemini-3.8-flash` via `@google/genai` SDK
**Cost Structure:** $0 Recurring Cost (Gemini free tier, local OCR/embeddings, local client/server memory)

---

## 1. Paradigm Shift: Inverted RAG
In conventional RAG, retrieval produces context to **answer** questions.
In Clinic Intake RAG, **retrieval decides what the bot asks next, not what it answers**.
Patient utterances are parsed for symptom entities, and the highest-ranking clinical protocol question that has not yet been asked is surfaced with verified provenance.

---

## 2. Model Currency & SDK Compliance
- **SDK:** `@google/genai` (v2.4.0) with server-side proxying on port 3000.
- **Model:** `gemini-3.8-flash` for structured slot extraction and safe conversational transitions.
- **Header:** Configured with `User-Agent: 'aistudio-build'` per SDK guidelines.
- **Deprecated models avoided:** `gemini-1.5-flash`, `gemini-2.0-flash`, `text-bison` are strictly prohibited.

---

## 3. The 10 Invariant Hard Rules
1. **Never Diagnose:** The assistant never names a disease, infers pathology, or provides prognosis.
2. **No Clinical Image Interpretation:** Photos of wounds, rashes, and body parts are deterministically rejected before any model API call.
3. **Deterministic Safety Guards:** Emergency red-flag detection (chest pain radiation, stroke FAST signs, severe dyspnea, suicide ideation) is hardcoded code, never delegated to an LLM.
4. **Structured JSON Validation:** All model outputs conform to schema validation.
5. **Zero Recurring Cost:** Operates within free tier constraints.
6. **De-identification:** PII is scrubbed into HIPAA tokens (`[NAME_1]`, `[DATE_1]`, `[PHONE_1]`) prior to external model transit.
7. **Tri-State Slot Tracking:** Every clinical note field must reflect `filled`, `patient_unsure`, or `not_yet_asked`.
8. **Provenance Tracking:** Every populated note slot holds a foreign reference to the exact patient quote or document chunk.
9. **Hybrid Retrieval:** Sparse BM25 + Dense vector similarity fused via Reciprocal Rank Fusion ($k=60$).
10. **Question State Filtering:** Questions already asked are excluded via SQL/state filters to prevent repetitive loops.
