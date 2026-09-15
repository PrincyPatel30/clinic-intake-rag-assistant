/**
 * Deterministic Safety Guards
 * HARD RULES:
 * 1. Red-flag detection is hardcoded deterministic logic, NEVER LLM-decided.
 * 2. On a match, the intake STOPS immediately and displays an emergency alert.
 * 3. Output guard prevents any diagnostic or prescriptive language.
 */

export interface RedFlagCheckResult {
  hasRedFlag: boolean;
  matchedRule?: string;
  triggerCategory?: string;
  emergencyActionText?: string;
  detectedPhrase?: string;
}

interface RedFlagPattern {
  id: string;
  category: string;
  positiveRegex: RegExp[];
  negationRegex: RegExp[];
  emergencyMessage: string;
}

const RED_FLAG_PATTERNS: RedFlagPattern[] = [
  {
    id: 'RF_CHEST_RADIATION',
    category: 'Acute Coronary Syndrome / Thoracic Emergency',
    positiveRegex: [
      /(?:chest\s+(?:pain|pressure|tightness|heaviness|crushing|squeezing).*?(?:radiat|spread|shoot|go(?:es|ing)?\s+to|down\s+to).*?(?:arm|left\s+arm|jaw|neck|shoulder|back))/i,
      /(?:(?:radiat|spread|shoot).*?(?:left\s+arm|jaw|neck|back).*?(?:chest\s+pain|chest\s+pressure))/i,
      /(?:crushing|elephant\s+sitting\s+on)\s+(?:chest|breastbone)/i,
    ],
    negationRegex: [
      /(?:no|not|neither|never|without|denies?|doesn't|does\s+not)\s+.*?(?:chest\s+pain|radiat|spread)/i,
      /(?:chest\s+pain\s+(?:does\s+not|never|doesn't)\s+radiate)/i,
    ],
    emergencyMessage: 'Potential acute cardiac warning signs detected (chest discomfort with radiation or severe crushing sensation). Please call emergency services (e.g. 911 / 999 / 112) or go to the nearest Emergency Department immediately.',
  },
  {
    id: 'RF_SUDDEN_VISION_LOSS',
    category: 'Acute Ophthalmological / Neurological Emergency',
    positiveRegex: [
      /(?:sudden(?:ly)?|abrupt(?:ly)?|woke\s+up\s+with)\s+.*?(?:blind|lost\s+vision|can't\s+see|vision\s+loss|blackout\s+in\s+(?:one|my)\s+eye)/i,
      /(?:curtain\s+falling|darkness\s+covered)\s+over\s+(?:my\s+)?eye/i,
    ],
    negationRegex: [
      /(?:no|not|never|without)\s+.*?(?:vision\s+loss|blindness)/i,
    ],
    emergencyMessage: 'Sudden loss of vision requires urgent in-person emergency ophthalmological or stroke evaluation. Please seek emergency medical care immediately.',
  },
  {
    id: 'RF_THUNDERCLAP_HEADACHE',
    category: 'Intracranial Emergency / Subarachnoid Hemorrhage',
    positiveRegex: [
      /(?:worst\s+(?:headache|migraine)\s+(?:of\s+my\s+life|ever)|thunderclap\s+headache|exploded\s+in\s+my\s+head)/i,
      /(?:sudden\s+peak\s+headache\s+within\s+seconds)/i,
    ],
    negationRegex: [
      /(?:not\s+the\s+worst|mild\s+headache|normal\s+migraine|no\s+headache)/i,
    ],
    emergencyMessage: 'A sudden, severe headache peaking instantly (thunderclap headache) can signal intracranial hemorrhage. Please proceed to an emergency department immediately.',
  },
  {
    id: 'RF_STROKE_FOCAL',
    category: 'Acute Cerebrovascular Event / FAST Alert',
    positiveRegex: [
      /(?:sudden(?:ly)?|woke\s+up\s+with)\s+.*?(?:one\s+side(?:d)?|face\s+droop|arm\s+weak|cannot\s+lift\s+(?:my\s+)?arm|slurr(?:ed|ing)\s+speech|numbness\s+on\s+left|numbness\s+on\s+right)/i,
      /(?:facial\s+droop|drooping\s+on\s+one\s+side\s+of\s+my\s+face)/i,
    ],
    negationRegex: [
      /(?:no|not|neither)\s+.*?(?:weakness|numbness|droop|slur)/i,
    ],
    emergencyMessage: 'Sudden one-sided weakness, facial drooping, or speech difficulty is a medical emergency. Call emergency services immediately.',
  },
  {
    id: 'RF_SEVERE_DYSPNEA',
    category: 'Severe Respiratory Compromise',
    positiveRegex: [
      /(?:cannot\s+breathe|gasping\s+for\s+(?:air|breath)|lips\s+(?:turning\s+)?blue|choking|suffocating)/i,
      /(?:unable\s+to\s+speak\s+in\s+full\s+sentences\s+due\s+to\s+breath)/i,
    ],
    negationRegex: [
      /(?:no|not|without)\s+.*?(?:difficulty\s+breathing|shortness\s+of\s+breath)/i,
    ],
    emergencyMessage: 'Severe acute breathing distress or cyanosis requires immediate emergency medical resuscitation. Please call for emergency help now.',
  },
  {
    id: 'RF_SELF_HARM',
    category: 'Crisis & Safety Intervention',
    positiveRegex: [
      /(?:want\s+to\s+kill\s+myself|end\s+my\s+life|suicid(?:e|al)|want\s+to\s+die|harming\s+myself)/i,
    ],
    negationRegex: [
      /(?:no|not|never)\s+.*?(?:suicidal|want\s+to\s+die)/i,
    ],
    emergencyMessage: 'If you are experiencing thoughts of self-harm or suicide, please connect immediately with a crisis lifeline: Call or text 988 (US/Canada), 111 (UK), or reach out to your local crisis response service. Compassionate professionals are available 24/7.',
  },
];

/**
 * Checks if user utterance triggers any deterministic red flag.
 */
export function evaluateRedFlags(utterance: string): RedFlagCheckResult {
  const clean = utterance.trim();
  if (!clean) return { hasRedFlag: false };

  for (const pattern of RED_FLAG_PATTERNS) {
    // Check if any positive regex matches
    let positiveMatched = false;
    let matchedSnippet = '';

    for (const posRx of pattern.positiveRegex) {
      const match = posRx.exec(clean);
      if (match) {
        positiveMatched = true;
        matchedSnippet = match[0];
        break;
      }
    }

    if (positiveMatched) {
      // Check if negation applies to this context
      let isNegated = false;
      for (const negRx of pattern.negationRegex) {
        if (negRx.test(clean)) {
          isNegated = true;
          break;
        }
      }

      if (!isNegated) {
        return {
          hasRedFlag: true,
          matchedRule: pattern.id,
          triggerCategory: pattern.category,
          emergencyActionText: pattern.emergencyMessage,
          detectedPhrase: matchedSnippet,
        };
      }
    }
  }

  return { hasRedFlag: false };
}

/**
 * Output Guard: Strictly audits model responses to ensure NO diagnosis or treatment is prescribed.
 */
const BANNED_OUTPUT_PHRASES = [
  /you\s+(?:have|are\s+suffering\s+from|likely\s+have)\s+[a-z\s]+(?:itis|osis|syndrome|disease|attack|infarction|disorder)/i,
  /i\s+(?:diagnose\s+you\s+with|suspect\s+you\s+have|believe\s+you\s+have)/i,
  /(?:you\s+should|i\s+recommend\s+you)\s+(?:take|start|stop|increase|decrease)\s+[0-9]+\s*(?:mg|ml|tablets|pills)/i,
  /my\s+diagnosis\s+is/i,
  /prescribe\s+(?:you|this)/i,
];

export function validateBotOutputSafety(text: string): { isValid: boolean; sanitizedText: string; reason?: string } {
  for (const banned of BANNED_OUTPUT_PHRASES) {
    if (banned.test(text)) {
      return {
        isValid: false,
        sanitizedText: "I cannot diagnose medical conditions or recommend treatment plans. That is the doctor's responsibility. I am here to gather your medical history for your doctor. Let's continue with your intake.",
        reason: 'Diagnostic or prescriptive statement intercepted by deterministic output guard.',
      };
    }
  }
  return { isValid: true, sanitizedText: text };
}
