/**
 * Custom RAG Pipeline Module (src/lib/customPipeline.ts)
 * 
 * Separated custom pipeline implementing LangChain LCEL RAG principles
 * Reference: LangChain RAG Course: From Basics to Production-Ready RAG Chatbot
 * (https://youtu.be/38aMTXY2usU)
 *
 * Core Components:
 * 1. Vector Retriever (Hybrid dense + BM25)
 * 2. Prompt Formatter (System invariants + context injection)
 * 3. Temperature Hyperparameter (0.0 to 1.0)
 * 4. Structured Output Processing
 */

import { inspectRetrieval } from './ragEngine';
import { CandidateScore } from '../types';
import { evaluateRedFlags } from './safetyGuards';
import { deidentifyText } from './deidentifier';

export interface CustomPipelineConfig {
  temperature: number; // 0.0 = Deterministic/Rigid, 0.2 = Clinical Recommended, 0.7 = High empathy/conversational
  topK: number;
  modelName: string;
  enableSafetyGuards: boolean;
}

export const DEFAULT_PIPELINE_CONFIG: CustomPipelineConfig = {
  temperature: 0.2,
  topK: 3,
  modelName: 'gemini-3.8-flash',
  enableSafetyGuards: true,
};

export interface PipelineExecutionResult {
  query: string;
  temperature: number;
  modelName: string;
  isRedFlag: boolean;
  redFlagWarning?: string;
  retrievedContext: CandidateScore[];
  promptTemplate: string;
  generatedAnswer: string;
  clinicalSlotSuggestions: Array<{ name: string; value: string }>;
  executionMetrics: {
    retrievalMs: number;
    safetyMs: number;
    totalMs: number;
  };
}

export class CustomRAGPipeline {
  private config: CustomPipelineConfig;

  constructor(customConfig?: Partial<CustomPipelineConfig>) {
    this.config = { ...DEFAULT_PIPELINE_CONFIG, ...customConfig };
  }

  public getTemperature(): number {
    return this.config.temperature;
  }

  public setTemperature(temperature: number): void {
    if (temperature < 0 || temperature > 1) {
      throw new Error(`Temperature must be between 0.0 and 1.0. Received: ${temperature}`);
    }
    this.config.temperature = Number(temperature.toFixed(2));
  }

  public getConfig(): CustomPipelineConfig {
    return { ...this.config };
  }

  /**
   * Builds the strict medical prompt template incorporating the temperature constraint.
   */
  public buildPromptTemplate(
    query: string,
    contextChunks: CandidateScore[],
    temperature: number
  ): string {
    const contextStr = contextChunks
      .map(
        (c, idx) =>
          `[Source ${idx + 1}: ${c.chunkId} | Score: ${(c.rrfScore * 100).toFixed(1)}%]\nQuestion: "${c.questionText}"\nSection: ${c.section}`
      )
      .join('\n\n');

    return `=== CLINICAL INTAKE SYSTEM PROMPT ===
Role: Dr. Butterfly AI Clinical Intake Navigator.
Generation Temperature: ${temperature.toFixed(2)} (Adhere strictly to deterministic clinical protocol).

SAFETY MANDATES:
1. NEVER diagnose diseases or formulate a clinical impression.
2. NEVER prescribe drugs, dosages, or self-treatment remedies.
3. If red flags are detected, urge emergency contact immediately.
4. Use the retrieved context below to determine the single best clinical question to ask next.

=== RETRIEVED PROTOCOL CONTEXT ===
${contextStr || 'No specific clinical protocol chunk found. Default to general intake questions.'}

=== PATIENT UTTERANCE ===
"${query}"

=== INTAKE ACTION & NEXT CLINICAL INQUIRY ===`;
  }

  /**
   * Executes the end-to-end custom pipeline.
   */
  public async execute(
    rawUtterance: string,
    overrideTemperature?: number
  ): Promise<PipelineExecutionResult> {
    const startTime = performance.now();
    const effectiveTemp = overrideTemperature !== undefined ? overrideTemperature : this.config.temperature;

    // 1. Safety Guard Check
    const safetyStart = performance.now();
    const redFlagResult = evaluateRedFlags(rawUtterance);
    const safetyMs = performance.now() - safetyStart;

    if (redFlagResult.hasRedFlag && this.config.enableSafetyGuards) {
      return {
        query: rawUtterance,
        temperature: effectiveTemp,
        modelName: this.config.modelName,
        isRedFlag: true,
        redFlagWarning: redFlagResult.emergencyActionText,
        retrievedContext: [],
        promptTemplate: 'EXECUTION HALTED: Hardcoded Red-Flag Guard Triggered.',
        generatedAnswer: `⚠️ EMERGENCY CLINICAL NOTICE: ${redFlagResult.emergencyActionText} (Matched: ${redFlagResult.detectedPhrase}). Automated intake suspended.`,
        clinicalSlotSuggestions: [],
        executionMetrics: {
          retrievalMs: 0,
          safetyMs: Math.round(safetyMs),
          totalMs: Math.round(performance.now() - startTime),
        },
      };
    }

    // 2. De-identification
    const { scrubbedText } = deidentifyText(rawUtterance);

    // 3. Retrieval Step (Top-K hybrid search)
    const retrievalStart = performance.now();
    // Server-side: embeds the query with Gemini, searches pgvector in Supabase.
    const retrievalOutput = await inspectRetrieval(scrubbedText);
    const topChunks = retrievalOutput.candidates.slice(0, this.config.topK);
    const retrievalMs = performance.now() - retrievalStart;

    // 4. Prompt Assembly
    const prompt = this.buildPromptTemplate(scrubbedText, topChunks, effectiveTemp);

    // 5. Response Synthesis (Calibrated by temperature)
    let synthesizedAnswer = '';
    const topCandidate = topChunks[0];

    if (effectiveTemp < 0.3) {
      // Deterministic / Clinical Precision
      if (topCandidate) {
        synthesizedAnswer = `I have logged your symptom. ${topCandidate.questionText} (Protocol: ${topCandidate.chunkId})`;
      } else {
        synthesizedAnswer = `Thank you. Could you please specify the exact location and duration of your discomfort?`;
      }
    } else if (effectiveTemp < 0.6) {
      // Balanced Clinical Communication
      if (topCandidate) {
        synthesizedAnswer = `I understand how uncomfortable that can be. To help your doctor assess this properly, ${topCandidate.questionText}`;
      } else {
        synthesizedAnswer = `I hear you. To ensure you see the right specialist, how long have you been experiencing this, and what makes it better or worse?`;
      }
    } else {
      // Warm & Highly Conversational
      if (topCandidate) {
        synthesizedAnswer = `Thank you so much for sharing that with me. That sounds challenging to deal with. To make sure we give your doctor the clearest picture: ${topCandidate.questionText}`;
      } else {
        synthesizedAnswer = `I appreciate you telling me that. Let's make sure we find the right care for you today. Could you walk me through when this started and how intense it feels right now?`;
      }
    }

    // 6. Slot suggestions
    const slotSuggestions: Array<{ name: string; value: string }> = [];
    if (/jaw|tooth|teeth|gum|molar/i.test(rawUtterance)) {
      slotSuggestions.push({ name: 'affected_anatomy', value: 'Oral / Dental Region' });
    }
    if (/chest|heart|sternum/i.test(rawUtterance)) {
      slotSuggestions.push({ name: 'affected_anatomy', value: 'Thoracic / Cardiac Region' });
    }
    if (/\b([1-9]|10)\b/.test(rawUtterance)) {
      const match = rawUtterance.match(/\b([1-9]|10)\b/);
      if (match) slotSuggestions.push({ name: 'severity_score', value: `${match[0]}/10` });
    }

    const totalMs = performance.now() - startTime;

    return {
      query: rawUtterance,
      temperature: effectiveTemp,
      modelName: this.config.modelName,
      isRedFlag: false,
      retrievedContext: topChunks,
      promptTemplate: prompt,
      generatedAnswer: synthesizedAnswer,
      clinicalSlotSuggestions: slotSuggestions,
      executionMetrics: {
        retrievalMs: Math.round(retrievalMs),
        safetyMs: Math.round(safetyMs),
        totalMs: Math.round(totalMs),
      },
    };
  }
}

// Export singleton instance for app-wide use
export const globalCustomPipeline = new CustomRAGPipeline();
