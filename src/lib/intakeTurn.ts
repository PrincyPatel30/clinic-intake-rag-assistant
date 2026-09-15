/**
 * The intake conversation, one turn at a time.
 *
 * ---------------------------------------------------------------------------
 * Why this is not a decision tree
 * ---------------------------------------------------------------------------
 * The obvious way to build a guided medical intake is a hardcoded branching
 * script: headache -> ask these five, chest pain -> ask those five. It is easy
 * to write and it demos well.
 *
 * It also throws away the entire point of this project. Retrieval is what picks
 * the next question here; a script would make the vector store decorative, and
 * every new protocol document would mean hand-writing new branches.
 *
 * So the branching is real but it is *data-driven*: retrieval chooses WHICH
 * question comes next, and each protocol chunk already declares HOW it should be
 * answered (`inputWidget`) and WHAT the sensible answers are
 * (`suggestedQuickReplies`). Adding a new protocol document to the corpus adds
 * new branches automatically, with no UI changes at all.
 *
 * The one exception is the opening screen. Before the patient has said anything
 * there is no text to embed, so the first screen is a fixed set of common
 * reasons for visiting. From the second turn onward, retrieval drives.
 */

import { ClinicalChunk } from '../types';

/** How the answer to a question should be collected. */
export type WidgetKind =
  | 'symptom_picker'  // opening screen: icon cards
  | 'single_choice'   // 3-5 option cards
  | 'severity'        // 1-10 scale
  | 'yes_no'          // two large actions
  | 'text'            // free text box
  | 'summary';        // review-and-confirm

export interface SummaryChip {
  slot: string;
  label: string;
  value: string;
}

export interface IntakeTurnResponse {
  /** Short human acknowledgement of what the patient just said. May be empty. */
  acknowledgement: string;
  /** The question being asked now. */
  question: string;
  widget: WidgetKind;
  options: string[];
  /** Everything captured so far, for the running summary. */
  summary: SummaryChip[];
  stage: { index: number; total: number; label: string };
  chunkId: string | null;
  specialty: string | null;
  /** True when retrieval found nothing close enough in the corpus. */
  offProtocol: boolean;
  /** True when the interview is finished. */
  done: boolean;
  redFlag?: { text: string; phrase: string };
  latencyMs?: number;
}

/**
 * The opening screen.
 *
 * These are reasons for visiting, not diagnoses -- a patient knows "my tooth
 * hurts", not "pericoronitis". Each maps to a specialty so the first retrieval
 * can be scoped, which measurably improves the first question.
 */
export const OPENING_OPTIONS: Array<{
  label: string;
  icon: string;
  specialty: string;
  seed: string;
}> = [
  { label: 'Chest discomfort', icon: 'heart', specialty: 'Cardiology', seed: 'chest discomfort or tightness' },
  { label: 'Breathing trouble', icon: 'wind', specialty: 'Pulmonology', seed: 'shortness of breath, difficulty breathing' },
  { label: 'Tooth or jaw pain', icon: 'tooth', specialty: 'Oral Surgery', seed: 'wisdom tooth pain and jaw swelling' },
  { label: 'Skin or a mole', icon: 'scan', specialty: 'Dermatology', seed: 'a mole or skin patch that has changed' },
  { label: 'Feeling unwell', icon: 'thermometer', specialty: 'General Practice', seed: 'fever, chills, tiredness, feeling generally unwell' },
  { label: 'Swelling', icon: 'droplet', specialty: 'Cardiology', seed: 'swollen ankles, feet or legs' },
];

/** Human labels for the slots, used in the running summary. */
const SLOT_LABELS: Record<string, string> = {
  symptom_location: 'Location',
  symptom_radiation: 'Spreads to',
  severity_rating: 'Severity',
  symptom_onset: 'Started',
  provocative_factors: 'Triggers',
  associated_dyspnea: 'Breathing',
  peripheral_edema: 'Swelling',
  current_medications: 'Medications',
  allergies_history: 'Allergies',
  constitutional_symptoms: 'Fever / weight',
  past_medical_history: 'History',
  lesion_characteristics: 'Skin changes',
  reason_for_visit: 'Reason for visit',
};

export function slotLabel(slot: string): string {
  return SLOT_LABELS[slot] ?? slot.replace(/_/g, ' ');
}

/**
 * Map a protocol chunk's declared widget onto a UI control.
 *
 * `body_map` becomes single_choice rather than an anatomical diagram: the corpus
 * already supplies four plain-language location options, and a clickable body
 * diagram is a large amount of UI for a question four buttons answer better on
 * a phone.
 */
export function widgetFor(chunk: ClinicalChunk): WidgetKind {
  switch (chunk.inputWidget) {
    case 'severity_scale':
      return 'severity';
    case 'yes_no_unsure':
      // These chunks carry four nuanced options ("Spreads to left arm",
      // "Not sure"), which are far more useful than a bare Yes/No.
      return chunk.suggestedQuickReplies?.length ? 'single_choice' : 'yes_no';
    case 'body_map':
      return 'single_choice';
    case 'text':
    default:
      return chunk.suggestedQuickReplies?.length ? 'single_choice' : 'text';
  }
}

/**
 * The four stages, derived from which slots are actually filled rather than
 * from a turn counter -- so it can never claim "almost done" while half the
 * interview is still ahead.
 */
export function stageFor(slots: Record<string, string>): {
  index: number;
  total: number;
  label: string;
} {
  const has = (s: string) => Boolean(slots[s]);
  const hasTiming = has('symptom_onset');
  const hasSeverity = has('severity_rating');
  const hasHistory = has('current_medications') || has('allergies_history') || has('past_medical_history');

  if (hasTiming && hasSeverity && hasHistory) return { index: 4, total: 4, label: 'Almost done' };
  if (hasTiming && hasSeverity) return { index: 3, total: 4, label: 'A bit of history' };
  if (hasTiming || hasSeverity) return { index: 2, total: 4, label: 'How it feels' };
  return { index: 1, total: 4, label: 'What brings you in' };
}

export function buildSummary(slots: Record<string, string>): SummaryChip[] {
  return Object.entries(slots)
    .filter(([, v]) => v && v.trim())
    .map(([slot, value]) => ({ slot, label: slotLabel(slot), value }));
}

/**
 * Enough is enough.
 *
 * A patient should not be made to answer every question the corpus happens to
 * hold. Once timing, severity and some history are captured, the clinician has
 * what they need to start the appointment.
 */
export function isComplete(slots: Record<string, string>): boolean {
  const filled = Object.keys(slots).length;
  const st = stageFor(slots);
  return st.index >= 4 || filled >= 6;
}
