/**
 * Butterfly Clinic — Care Navigation Routing Engine
 * Source: Care Navigation RAG (Colab notebook reference)
 *
 * Implements:
 * Stage 8: Hardcoded Red-flag Detection (Runs FIRST)
 * Stage 9: Hybrid Retrieval (Dense Vector + BM25 Sparse + RRF k=60)
 * Stage 10: Cross-Encoder Reranking
 * Stage 11: Route with the Escalate-Only Rule
 * Stage 12: Under-routing vs Over-routing Evaluator
 */

import {
  ReferralCriterion,
  REFERRAL_CRITERIA,
  CARE_LEVEL,
  Specialty,
  DENTAL_EVAL_SET,
  BenchmarkItem,
} from '../data/dental_referral_corpus';

// --- STAGE 8: HARDCODED RED-FLAG SPECIFICATION ---
export interface RedFlagRule {
  label: string;
  patterns: RegExp[];
  actionText: string;
}

export const DENTAL_RED_FLAGS: RedFlagRule[] = [
  {
    label: 'Swelling spreading toward the eye or neck',
    patterns: [
      /swell\w*.{0,40}(eye|neck|throat)/i,
      /(eye|neck|throat).{0,40}swell\w*/i,
      /swelling\s+(?:moving|spreading|traveling)\s+(?:up|down)?\s*(?:to|toward)\s+(?:my\s+)?(?:eye|neck|throat)/i,
    ],
    actionText: 'Spreading facial swelling toward the periorbital or deep fascial spaces can compromise the airway or orbit. Immediate hospital emergency assessment required.',
  },
  {
    label: 'Difficulty swallowing or breathing',
    patterns: [
      /(can.?t|cannot|difficult\w*|trouble|hard to)\s*(swallow|breath|breathe)/i,
      /shortness\s+of\s+breath.{0,30}throat/i,
    ],
    actionText: 'Dysphagia or airway embarrassment secondary to odontogenic infection is a surgical airway emergency. Call 911 / seek immediate emergency care.',
  },
  {
    label: 'Unable to open the mouth (Severe Trismus)',
    patterns: [
      /(can.?t|cannot|unable to)\s*open\s*(my\s*)?(mouth|jaw)/i,
      /jaw.{0,20}locked/i,
      /mouth\s+opening\s+restricted\s+to\s+less\s+than/i,
    ],
    actionText: 'Acute trismus with acute infection indicates involvement of the masticator space. Urgent surgical evaluation needed.',
  },
  {
    label: 'Fever with acute facial swelling',
    patterns: [
      /fever.{0,60}swell/i,
      /swell.{0,60}(fever|temperature)/i,
      /hot\s+to\s+touch.{0,30}face/i,
    ],
    actionText: 'Systemic signs of sepsis combined with facial swelling require immediate intravenous antibiotic therapy and surgical drainage.',
  },
  {
    label: 'Uncontrolled bleeding',
    patterns: [
      /bleeding.{0,30}(won.?t stop|not stopping|hours|gushing)/i,
      /mouth\s+full\s+of\s+blood/i,
    ],
    actionText: 'Persistent active hemorrhage following extraction or trauma that fails local pressure requires emergency surgical hemostasis.',
  },
  {
    label: 'Facial trauma with possible fracture',
    patterns: [
      /(hit|struck|accident|fell|punch).{0,60}(jaw|face|cheek)/i,
      /broken\s+(jaw|cheekbone|facial\s+bone)/i,
    ],
    actionText: 'Suspected maxillofacial skeletal fracture requires acute maxillofacial trauma imaging and stabilization.',
  },
];

export function checkDentalRedFlag(utterance: string): { hasRedFlag: boolean; label?: string; actionText?: string } {
  const text = utterance.toLowerCase().trim();

  // Negation check (e.g. "no swelling near my eye", "never had difficulty swallowing")
  const negationGuard = /(?:no|not|neither|without|denies?)\s+.*?(?:swelling|swallow|fever|bleed)/i;
  if (negationGuard.test(text)) {
    // If explicitly negated without positive emergency co-occurrence, allow regular retrieval
    const containsAffirmativeEmergency = /swelling\s+spreading|can't\s+swallow|cannot\s+breathe/i.test(text);
    if (!containsAffirmativeEmergency) {
      return { hasRedFlag: false };
    }
  }

  for (const rule of DENTAL_RED_FLAGS) {
    for (const pat of rule.patterns) {
      if (pat.test(text)) {
        return {
          hasRedFlag: true,
          label: rule.label,
          actionText: rule.actionText,
        };
      }
    }
  }

  return { hasRedFlag: false };
}

// --- TOKENIZER & BM25 SPARSE SCORING (Stage 9) ---
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export class BM25Engine {
  private criteria: ReferralCriterion[];
  private docTokens: string[][];
  private docLengths: number[];
  private avgDocLength = 0;
  private idf: Map<string, number> = new Map();
  private k1 = 1.5;
  private b = 0.75;

  constructor(criteria: ReferralCriterion[], usecontextual = true) {
    this.criteria = criteria;
    this.docTokens = criteria.map((c) => {
      const textToTokenize = usecontextual ? `${c.contextSentence} ${c.text}` : c.text;
      return tokenize(textToTokenize);
    });
    this.docLengths = this.docTokens.map((d) => d.length);
    this.avgDocLength = this.docLengths.reduce((a, b) => a + b, 0) / (criteria.length || 1);
    this.computeIdf();
  }

  private computeIdf() {
    const N = this.criteria.length;
    const df: Map<string, number> = new Map();

    this.docTokens.forEach((doc) => {
      const uniqueTokens = new Set(doc);
      uniqueTokens.forEach((tok) => {
        df.set(tok, (df.get(tok) || 0) + 1);
      });
    });

    df.forEach((count, term) => {
      // Okapi BM25 standard IDF formula
      const idfVal = Math.log((N - count + 0.5) / (count + 0.5) + 1);
      this.idf.set(term, Math.max(0.1, idfVal));
    });
  }

  public score(query: string): number[] {
    const qTokens = tokenize(query);
    const scores: number[] = new Array(this.criteria.length).fill(0);

    qTokens.forEach((term) => {
      const termIdf = this.idf.get(term) || 0;
      if (termIdf <= 0) return;

      this.docTokens.forEach((doc, idx) => {
        const tf = doc.filter((t) => t === term).length;
        if (tf > 0) {
          const docLen = this.docLengths[idx];
          const num = tf * (this.k1 + 1);
          const denom = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
          scores[idx] += termIdf * (num / denom);
        }
      });
    });

    return scores;
  }
}

// --- DENSE SIMILARITY SCORER (Stage 6/9) ---
export function computeDentalDenseSimilarity(query: string, criterion: ReferralCriterion, usecontextual = true): number {
  const qTokens = tokenize(query);
  const qSet = new Set(qTokens);

  let score = 0.25; // baseline semantic prior

  // Match against keywords
  for (const kw of criterion.keywords) {
    const kwTokens = tokenize(kw);
    let matchedInKw = 0;
    for (const kt of kwTokens) {
      if (qSet.has(kt)) matchedInKw++;
    }
    if (matchedInKw === kwTokens.length && kwTokens.length > 0) {
      score += 0.38;
    } else if (matchedInKw > 0) {
      score += 0.15 * (matchedInKw / kwTokens.length);
    }
  }

  // Match against title
  const titleTokens = tokenize(criterion.title);
  for (const tt of titleTokens) {
    if (qSet.has(tt)) score += 0.12;
  }

  // Match against contextual sentence if enabled
  if (usecontextual) {
    const specLabelTokens = tokenize(criterion.specialtyLabel);
    for (const st of specLabelTokens) {
      if (qSet.has(st)) score += 0.18;
    }
  }

  return Math.min(0.99, score);
}

// --- CROSS-ENCODER RERANKER (Stage 10) ---
export function crossEncodeLogit(query: string, criterion: ReferralCriterion): number {
  const qTokens = tokenize(query);
  const qSet = new Set(qTokens);

  let logit = -1.2; // default uncalibrated negative logit

  // Dense term overlap with exact rule lines
  let bestLineMatch = 0;
  for (const line of criterion.lines) {
    const lineTokens = tokenize(line);
    const common = lineTokens.filter((t) => qSet.has(t)).length;
    const ratio = common / Math.max(1, Math.min(lineTokens.length, qTokens.length));
    if (ratio > bestLineMatch) bestLineMatch = ratio;
  }

  logit += bestLineMatch * 4.5;

  // Keyword exact matches
  for (const kw of criterion.keywords) {
    const kwTokens = tokenize(kw);
    if (kwTokens.every((t) => qSet.has(t))) {
      logit += 1.8;
      break;
    }
  }

  return Number(logit.toFixed(3));
}

// --- ROUTING ENGINE WITH ESCALATE-ONLY INVARIANT (Stage 11) ---
export interface CandidateMatch {
  criterion: ReferralCriterion;
  bm25Score: number;
  bm25Rank: number;
  denseScore: number;
  denseRank: number;
  rrfScore: number;
  rrfRank: number;
  crossLogit: number;
  finalRank: number;
}

export interface RoutingDecision {
  specialty: Specialty;
  specialtyLabel: string;
  careLevel: number;
  reason: string;
  citationId: string | null;
  citationDocTitle: string | null;
  citationText: string | null;
  confidenceLogit: number | null;
  escalatedByRule: boolean;
  fellBackToSafeOption: boolean;
  alternatives: Array<{ specialty: Specialty; label: string; score: number }>;
  candidates: CandidateMatch[];
  stageDurationsMs: {
    redFlagMs: number;
    denseMs: number;
    bm25Ms: number;
    rrfMs: number;
    rerankMs: number;
    totalMs: number;
  };
}

export function routePatientUtterance(
  utterance: string,
  options?: {
    confidenceFloor?: number;
    useContextual?: boolean;
    rrfK?: number;
  }
): RoutingDecision {
  const startTime = Date.now();
  const confidenceFloor = options?.confidenceFloor ?? 0.0;
  const useContextual = options?.useContextual ?? true;
  const rrfK = options?.rrfK ?? 60;

  // 1. STAGE 8: RED FLAG CHECK (RUNS FIRST)
  const rfStart = Date.now();
  const redFlagResult = checkDentalRedFlag(utterance);
  const redFlagMs = Date.now() - rfStart;

  if (redFlagResult.hasRedFlag) {
    return {
      specialty: 'emergency',
      specialtyLabel: 'Hospital Emergency / Urgent Maxillofacial Care',
      careLevel: 4,
      reason: `STOP: ${redFlagResult.label} -> Escalated to Emergency (Care Level 4).`,
      citationId: 'EMERGENCY_ESCALATION_RULE',
      citationDocTitle: 'Butterfly Clinic Emergency Escalation & Airway Safety Protocol',
      citationText: redFlagResult.actionText || 'Seek immediate medical attention.',
      confidenceLogit: 9.99,
      escalatedByRule: true,
      fellBackToSafeOption: false,
      alternatives: [],
      candidates: [],
      stageDurationsMs: {
        redFlagMs,
        denseMs: 0,
        bm25Ms: 0,
        rrfMs: 0,
        rerankMs: 0,
        totalMs: Date.now() - startTime,
      },
    };
  }

  // 2. STAGE 9: DENSE RETRIEVAL
  const denseStart = Date.now();
  const denseScores = REFERRAL_CRITERIA.map((c) => computeDentalDenseSimilarity(utterance, c, useContextual));
  const denseRankedIndices = REFERRAL_CRITERIA.map((_, i) => i).sort((a, b) => denseScores[b] - denseScores[a]);
  const denseMs = Date.now() - denseStart;

  // 3. STAGE 9: BM25 SPARSE RETRIEVAL
  const bm25Start = Date.now();
  const bm25 = new BM25Engine(REFERRAL_CRITERIA, useContextual);
  const bm25Scores = bm25.score(utterance);
  const bm25RankedIndices = REFERRAL_CRITERIA.map((_, i) => i).sort((a, b) => bm25Scores[b] - bm25Scores[a]);
  const bm25Ms = Date.now() - bm25Start;

  // 4. STAGE 9: RECIPROCAL RANK FUSION (RRF k=60)
  const rrfStart = Date.now();
  const rrfScores: number[] = new Array(REFERRAL_CRITERIA.length).fill(0);
  const poolSize = 8;

  denseRankedIndices.slice(0, poolSize).forEach((idx, rank) => {
    rrfScores[idx] += 1 / (rrfK + rank + 1);
  });
  bm25RankedIndices.slice(0, poolSize).forEach((idx, rank) => {
    rrfScores[idx] += 1 / (rrfK + rank + 1);
  });

  const rrfRankedIndices = REFERRAL_CRITERIA.map((_, i) => i).sort((a, b) => rrfScores[b] - rrfScores[a]);
  const rrfMs = Date.now() - rrfStart;

  // 5. STAGE 10: CROSS-ENCODER RERANKING
  const rerankStart = Date.now();
  const topPool = rrfRankedIndices.slice(0, 5);
  const crossScores: { idx: number; logit: number }[] = topPool.map((idx) => ({
    idx,
    logit: crossEncodeLogit(utterance, REFERRAL_CRITERIA[idx]),
  }));
  crossScores.sort((a, b) => b.logit - a.logit);
  const rerankMs = Date.now() - rerankStart;

  // Build candidate objects
  const candidates: CandidateMatch[] = crossScores.map((item, finalRank) => {
    const crit = REFERRAL_CRITERIA[item.idx];
    const denseRank = denseRankedIndices.indexOf(item.idx) + 1;
    const bm25Rank = bm25RankedIndices.indexOf(item.idx) + 1;
    const rrfRank = rrfRankedIndices.indexOf(item.idx) + 1;

    return {
      criterion: crit,
      bm25Score: Number(bm25Scores[item.idx].toFixed(3)),
      bm25Rank,
      denseScore: Number(denseScores[item.idx].toFixed(3)),
      denseRank,
      rrfScore: Number(rrfScores[item.idx].toFixed(5)),
      rrfRank,
      crossLogit: item.logit,
      finalRank: finalRank + 1,
    };
  });

  // 6. STAGE 11: ESCALATE-ONLY ROUTING LOGIC
  const topCandidate = candidates[0];
  const topScore = topCandidate ? topCandidate.crossLogit : -99;

  // Confidence floor check: if score is below floor, fall back to general dentist (broadest safe option)
  // NEVER return level 0 (no_care) — enforced structurally
  if (!topCandidate || topScore < confidenceFloor) {
    const fallbackCrit = REFERRAL_CRITERIA.find((c) => c.id === 'general_dentist::c4') || REFERRAL_CRITERIA[0];
    return {
      specialty: 'general_dentist',
      specialtyLabel: 'General Dentist (First-Line Triage)',
      careLevel: 1,
      reason: 'No specialist criterion matched with high confidence; routed to broadest safe clinical option for in-person examination.',
      citationId: fallbackCrit.id,
      citationDocTitle: fallbackCrit.docTitle,
      citationText: fallbackCrit.text,
      confidenceLogit: topScore,
      escalatedByRule: false,
      fellBackToSafeOption: true,
      alternatives: candidates.slice(1, 4).map((c) => ({
        specialty: c.criterion.specialty,
        label: c.criterion.specialtyLabel,
        score: c.crossLogit,
      })),
      candidates,
      stageDurationsMs: {
        redFlagMs,
        denseMs,
        bm25Ms,
        rrfMs,
        rerankMs,
        totalMs: Date.now() - startTime,
      },
    };
  }

  // Safe matched criterion
  const matched = topCandidate.criterion;
  return {
    specialty: matched.specialty,
    specialtyLabel: matched.specialtyLabel,
    careLevel: matched.careLevel,
    reason: matched.title,
    citationId: matched.id,
    citationDocTitle: matched.docTitle,
    citationText: matched.text,
    confidenceLogit: topCandidate.crossLogit,
    escalatedByRule: matched.careLevel > 1,
    fellBackToSafeOption: false,
    alternatives: candidates.slice(1, 4).map((c) => ({
      specialty: c.criterion.specialty,
      label: c.criterion.specialtyLabel,
      score: c.crossLogit,
    })),
    candidates,
    stageDurationsMs: {
      redFlagMs,
      denseMs,
      bm25Ms,
      rrfMs,
      rerankMs,
      totalMs: Date.now() - startTime,
    },
  };
}

// --- STAGE 12: 24-CASE EVALUATION RUNNER (Exact, Over, and Under-Routing) ---
export interface EvalRunReport {
  contextualOn: {
    exactAccuracy: number;
    overRoutingRate: number;
    underRoutingRate: number;
    totalCases: number;
    problems: Array<{ kind: 'OVER' | 'UNDER'; query: string; expected: Specialty; got: Specialty }>;
  };
  contextualOff: {
    exactAccuracy: number;
    overRoutingRate: number;
    underRoutingRate: number;
    totalCases: number;
    problems: Array<{ kind: 'OVER' | 'UNDER'; query: string; expected: Specialty; got: Specialty }>;
  };
}

export function runBenchmarkEvaluation(confidenceFloor = 0.0): EvalRunReport {
  const evalWithMode = (useContextual: boolean) => {
    let exact = 0;
    let over = 0;
    let under = 0;
    const problems: Array<{ kind: 'OVER' | 'UNDER'; query: string; expected: Specialty; got: Specialty }> = [];

    for (const item of DENTAL_EVAL_SET) {
      const res = routePatientUtterance(item.query, { useContextual, confidenceFloor });
      const got = res.specialty;
      const gotLevel = res.careLevel;
      const wantLevel = CARE_LEVEL[item.expectedSpecialty];

      if (got === item.expectedSpecialty) {
        exact++;
      } else if (gotLevel > wantLevel) {
        over++;
        problems.push({ kind: 'OVER', query: item.query, expected: item.expectedSpecialty, got });
      } else {
        under++;
        problems.push({ kind: 'UNDER', query: item.query, expected: item.expectedSpecialty, got });
      }
    }

    const n = DENTAL_EVAL_SET.length;
    return {
      exactAccuracy: Math.round((exact / n) * 100),
      overRoutingRate: Math.round((over / n) * 100),
      underRoutingRate: Math.round((under / n) * 100),
      totalCases: n,
      problems,
    };
  };

  return {
    contextualOn: evalWithMode(true),
    contextualOff: evalWithMode(false),
  };
}
