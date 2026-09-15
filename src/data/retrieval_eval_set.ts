export interface EvalItem {
  id: string;
  query: string;
  category: 'direct_symptom' | 'negation' | 'medication_name' | 'numeric_severity' | 'misspelling' | 'vague_complaint' | 'out_of_corpus';
  expectedChunkId: string;
  explanation: string;
}

export const RETRIEVAL_EVAL_SET: EvalItem[] = [
  // 1. Direct symptoms
  {
    id: 'EVAL-01',
    query: 'I have a heavy pressure in the center of my chest when walking.',
    category: 'direct_symptom',
    expectedChunkId: 'CARD-CHEST-LOC',
    explanation: 'Targeted to chest localization and pressure characteristics.',
  },
  {
    id: 'EVAL-02',
    query: 'The tightness in my chest shoots down my left arm and up to my jaw.',
    category: 'direct_symptom',
    expectedChunkId: 'CARD-CHEST-RAD',
    explanation: 'Classic radiation pattern to left arm and jaw.',
  },
  {
    id: 'EVAL-03',
    query: 'Whenever I climb the stairs to my apartment, my chest tightens up, but resting 5 minutes makes it go away.',
    category: 'direct_symptom',
    expectedChunkId: 'CARD-EXERTION-TRIGGER',
    explanation: 'Exertional angina pattern with rest relief.',
  },
  {
    id: 'EVAL-04',
    query: 'I have to sleep propped up on 3 pillows or I wake up gasping for air.',
    category: 'direct_symptom',
    expectedChunkId: 'CARD-DYSPNEA-ORTHO',
    explanation: 'Orthopnea screening and pillow elevation.',
  },
  {
    id: 'EVAL-05',
    query: 'My socks are leaving deep indents and both my ankles are puffy and swollen by 5 PM.',
    category: 'direct_symptom',
    expectedChunkId: 'CARD-EDEMA-SWELLING',
    explanation: 'Bilateral ankle edema and fluid retention.',
  },
  {
    id: 'EVAL-06',
    query: 'I have had a mole on my back that started bleeding and turned darker black.',
    category: 'direct_symptom',
    expectedChunkId: 'DERM-LESION-EVOL',
    explanation: 'Dermatology lesion evolution and morphological changes.',
  },
  {
    id: 'EVAL-07',
    query: 'These stomach cramps and nausea started last Thursday night.',
    category: 'direct_symptom',
    expectedChunkId: 'GEN-CHIEF-ONSET',
    explanation: 'General timeline and symptom onset calculation.',
  },
  {
    id: 'EVAL-08',
    query: 'I have been sweating through my sheets at night and lost 8 pounds without trying.',
    category: 'direct_symptom',
    expectedChunkId: 'GEN-SYS-FEVER',
    explanation: 'Constitutional signs: night sweats and unintentional weight loss.',
  },
  {
    id: 'EVAL-09',
    query: 'I have a history of high blood pressure and adult-onset diabetes.',
    category: 'direct_symptom',
    expectedChunkId: 'GEN-PAST-CONDITIONS',
    explanation: 'Chronic comorbidities and past medical history.',
  },
  {
    id: 'EVAL-10',
    query: 'I am allergic to amoxicillin; it gave me hives all over my torso.',
    category: 'direct_symptom',
    expectedChunkId: 'CARD-ALLERGIES-DRUG',
    explanation: 'Adverse drug reaction and allergy intake.',
  },

  // 2. Exact medication names & spellings
  {
    id: 'EVAL-11',
    query: 'I take Metoprolol Tartrate 50mg twice daily and baby Aspirin.',
    category: 'medication_name',
    expectedChunkId: 'CARD-MEDS-BLOODTHIN',
    explanation: 'Beta-blocker and antiplatelet medication reconciliation.',
  },
  {
    id: 'EVAL-12',
    query: 'My cardiologist had me on Eliquis 5mg and Plavix after my stent.',
    category: 'medication_name',
    expectedChunkId: 'CARD-MEDS-BLOODTHIN',
    explanation: 'Anticoagulant and P2Y12 inhibitor names.',
  },
  {
    id: 'EVAL-13',
    query: 'I am taking Lisinopril 20mg and Atorvastatin 40mg at bedtime.',
    category: 'medication_name',
    expectedChunkId: 'CARD-MEDS-BLOODTHIN',
    explanation: 'Antihypertensive and statin medication list.',
  },
  {
    id: 'EVAL-14',
    query: 'Every time they gave me IV contrast iodine dye, my throat started itching.',
    category: 'medication_name',
    expectedChunkId: 'CARD-ALLERGIES-DRUG',
    explanation: 'Radiographic contrast hypersensitivity.',
  },

  // 3. Negations (Crucial: negations must not falsely trigger irrelevant questions)
  {
    id: 'EVAL-15',
    query: 'I am not taking any blood thinners or prescription heart pills whatsoever.',
    category: 'negation',
    expectedChunkId: 'CARD-MEDS-BLOODTHIN',
    explanation: 'Reconciling medication status even when negated.',
  },
  {
    id: 'EVAL-16',
    query: 'I do not have any drug allergies that I know of, never had a reaction.',
    category: 'negation',
    expectedChunkId: 'CARD-ALLERGIES-DRUG',
    explanation: 'No known drug allergies (NKDA) capture.',
  },
  {
    id: 'EVAL-17',
    query: 'The pain does NOT radiate to my arm or jaw at all, it stays strictly in the center.',
    category: 'negation',
    expectedChunkId: 'CARD-CHEST-RAD',
    explanation: 'Explicit absence of radiation to secondary focal points.',
  },
  {
    id: 'EVAL-18',
    query: 'I do not have any swollen feet or puffy ankles.',
    category: 'negation',
    expectedChunkId: 'CARD-EDEMA-SWELLING',
    explanation: 'Absence of peripheral edema.',
  },

  // 4. Numeric severity and scales
  {
    id: 'EVAL-19',
    query: 'The pain is easily an 8 out of 10 right now, it is unbearable.',
    category: 'numeric_severity',
    expectedChunkId: 'CARD-SEV-SCALE',
    explanation: 'High pain numerical severity score rating.',
  },
  {
    id: 'EVAL-20',
    query: 'It is a mild annoyance, probably a 2 or 3 out of 10.',
    category: 'numeric_severity',
    expectedChunkId: 'CARD-SEV-SCALE',
    explanation: 'Low severity score rating.',
  },

  // 5. Misspellings and colloquialisms
  {
    id: 'EVAL-21',
    query: 'Got this dull ache rite under my brestbone',
    category: 'misspelling',
    expectedChunkId: 'CARD-CHEST-LOC',
    explanation: 'Misspelled "right under breastbone".',
  },
  {
    id: 'EVAL-22',
    query: 'My ankels and feat are swolen like balloons by nite time.',
    category: 'misspelling',
    expectedChunkId: 'CARD-EDEMA-SWELLING',
    explanation: 'Misspelled "ankles and feet are swollen".',
  },
  {
    id: 'EVAL-23',
    query: 'I am alergic to penicilin and sufla meds.',
    category: 'misspelling',
    expectedChunkId: 'CARD-ALLERGIES-DRUG',
    explanation: 'Misspelled "penicillin and sulfa".',
  },
  {
    id: 'EVAL-24',
    query: 'Cant breath when layin flat on the matress.',
    category: 'misspelling',
    expectedChunkId: 'CARD-DYSPNEA-ORTHO',
    explanation: 'Orthopnea with colloquial phonetics.',
  },
  {
    id: 'EVAL-25',
    query: 'Taking that metoprolol pill for my hart rithm.',
    category: 'misspelling',
    expectedChunkId: 'CARD-MEDS-BLOODTHIN',
    explanation: 'Misspelled "heart rhythm".',
  },

  // 6. Vague complaints
  {
    id: 'EVAL-26',
    query: 'Just feeling completely wiped out and drained for the past few weeks.',
    category: 'vague_complaint',
    expectedChunkId: 'GEN-SYS-FEVER',
    explanation: 'Constitutional fatigue and systemic check.',
  },
  {
    id: 'EVAL-27',
    query: 'Noticed a funny looking brown patch on my left forearm.',
    category: 'vague_complaint',
    expectedChunkId: 'DERM-LESION-EVOL',
    explanation: 'Dermatological lesion evaluation.',
  },
  {
    id: 'EVAL-28',
    query: 'My ticker just feels a bit strange when I walk to the mailbox.',
    category: 'vague_complaint',
    expectedChunkId: 'CARD-EXERTION-TRIGGER',
    explanation: 'Exertional symptom mapping from colloquial "ticker".',
  },

  // 7. Out of corpus / boundary tests
  {
    id: 'EVAL-29',
    query: 'What time is the clinic cafeteria open on Saturdays?',
    category: 'out_of_corpus',
    expectedChunkId: 'NONE',
    explanation: 'Non-clinical facility question, fallback to default intake question.',
  },
  {
    id: 'EVAL-30',
    query: 'Can you prescribe me 500mg of amoxicillin right now without a doctor?',
    category: 'out_of_corpus',
    expectedChunkId: 'NONE',
    explanation: 'Prescription request strictly blocked by Safety Guard Rule 1.',
  }
];
