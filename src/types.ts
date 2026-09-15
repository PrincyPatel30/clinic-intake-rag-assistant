/**
 * Core domain types for Clinic Intake RAG Assistant
 */

export type FieldState = 'filled' | 'patient_unsure' | 'not_yet_asked';

export interface ProvenanceRecord {
  fieldId: string;
  sourceType: 'patient_utterance' | 'document_chunk' | 'ocr_tier_2' | 'ocr_tier_3';
  sourceQuote: string;
  sourceChunkId?: string;
  sourceDocumentName?: string;
  sourcePage?: number;
  ocrConfidence?: number;
  timestamp: string;
  turnIndex: number;
}

export interface IntakeSlot {
  id: string;
  name: string;
  label: string;
  section: 'chief_complaint' | 'hpi' | 'medications' | 'allergies' | 'past_history' | 'review_of_systems';
  state: FieldState;
  value: string | null;
  provenance?: ProvenanceRecord;
}

export interface ClinicalChunk {
  id: string;
  documentId: string;
  documentName: string;
  specialty: 'Cardiology' | 'General Practice' | 'Dermatology' | 'Oral Surgery' | 'Pulmonology';
  section: string;
  headingPath: string[];
  questionText: string;
  contextSentence: string;
  questionIds: string[];
  keywords: string[];
  targetSlot: string;
  suggestedQuickReplies?: string[];
  inputWidget?: 'text' | 'severity_scale' | 'body_map' | 'yes_no_unsure';
}

export interface CandidateScore {
  chunkId: string;
  section: string;
  questionText: string;
  bm25Score: number;
  bm25Rank: number;
  denseScore: number;
  denseRank: number;
  rrfScore: number;
  finalRank: number;
  excludedReason?: string;
}

export interface RetrievalTrace {
  id: string;
  turnNumber: number;
  timestamp: string;
  rawUtterance: string;
  deidentifiedUtterance: string;
  tokensMap: Record<string, string>;
  detectedRedFlags: string[];
  extractedFilter: {
    symptom?: string;
    bodySystem?: string;
    isNegated?: boolean;
    duration?: string;
    severity?: number;
    medicationsMentioned?: string[];
  };
  candidateScores: CandidateScore[];
  chosenChunkId: string | null;
  latency: {
    safetyGuardMs: number;
    deidentificationMs: number;
    retrievalMs: number;
    geminiExtractionMs: number;
    totalMs: number;
  };
  schemaValidationSuccess: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  sourceChunk?: {
    chunkId: string;
    documentName: string;
    section: string;
    heading: string;
  };
  quickReplies?: string[];
  inputWidget?: 'text' | 'severity_scale' | 'body_map' | 'yes_no_unsure';
  isRedFlagWarning?: boolean;
  ocrConfirmation?: {
    suggestedDrug: string;
    confidence: number;
    rawOcrText: string;
  };
}

export interface DocumentUploadRecord {
  id: string;
  filename: string;
  category: 'protocol' | 'prescription' | 'lab_report' | 'rejected_clinical_photo';
  status: 'indexed' | 'verified' | 'rejected' | 'pending_confirmation';
  extractionTier: 1 | 2 | 3 | 4;
  confidence: number;
  summary: string;
  chunksCount: number;
  rejectionReason?: string;
  uploadedAt: string;
}

export interface EvalBenchmarkResult {
  id: string;
  query: string;
  category: string;
  expectedChunkId: string;
  denseRank: number;
  bm25Rank: number;
  rrfRank: number;
  retrievedChunkId: string;
  isHit1: boolean;
  isHit3: boolean;
  reciprocalRank: number;
}
