/**
 * Butterfly Clinic — Care Navigation Referral Criteria Corpus
 * Source & Guidance: Care Navigation RAG (Colab notebook reference)
 *
 * One chunk = one referral criterion with structured metadata.
 * CARE_LEVEL ladder ensures "more specialised" is an auditable number.
 */

export type Specialty =
  | 'general_dentist'
  | 'endodontist'
  | 'periodontist'
  | 'orthodontist'
  | 'oral_surgeon'
  | 'emergency'
  | 'no_care';

export const CARE_LEVEL: Record<Specialty, number> = {
  no_care: 0, // Never a permitted output — system can escalate, never de-escalate
  general_dentist: 1,
  endodontist: 2,
  periodontist: 2,
  orthodontist: 2,
  oral_surgeon: 3,
  emergency: 4,
};

export interface ReferralCriterion {
  id: string;
  docTitle: string;
  specialty: Specialty;
  specialtyLabel: string;
  careLevel: number;
  criterionNumber: number;
  title: string;
  text: string;
  lines: string[];
  contextSentence: string;
  keywords: string[];
}

export const REFERRAL_CRITERIA: ReferralCriterion[] = [
  // --- GENERAL DENTAL PRACTICE ---
  {
    id: 'general_dentist::c1',
    docTitle: 'Butterfly Clinic General Dental Scope & First-Line Management (Rev 2026)',
    specialty: 'general_dentist',
    specialtyLabel: 'General Dentist',
    careLevel: 1,
    criterionNumber: 1,
    title: 'Routine assessment and cleaning',
    text: `Criterion 1: Routine assessment and cleaning
Manage patients presenting for routine examination, scaling, and polishing.
Manage bleeding gums during brushing without gum recession or tooth mobility.
Manage staining, mild bad breath, and requests for whitening assessment.`,
    lines: [
      'Manage patients presenting for routine examination, scaling, and polishing.',
      'Manage bleeding gums during brushing without gum recession or tooth mobility.',
      'Manage staining, mild bad breath, and requests for whitening assessment.',
    ],
    contextSentence:
      'From Butterfly Clinic General Dental Scope. This criterion describes when to refer or manage a patient with a general dentist. Topic: Routine assessment and cleaning.',
    keywords: ['routine', 'cleaning', 'scale', 'polish', 'staining', 'whitening', 'bad breath', 'bleeding gums brushing', 'examination', 'checkup'],
  },
  {
    id: 'general_dentist::c2',
    docTitle: 'Butterfly Clinic General Dental Scope & First-Line Management (Rev 2026)',
    specialty: 'general_dentist',
    specialtyLabel: 'General Dentist',
    careLevel: 1,
    criterionNumber: 2,
    title: 'Simple caries and fillings',
    text: `Criterion 2: Simple caries and fillings
Manage tooth sensitivity to sweet foods, cold air, or brushing without spontaneous pain.
Manage visible small cavities and lost or chipped fillings.
Manage a chipped tooth edge where there is no pain and no exposed pulp.`,
    lines: [
      'Manage tooth sensitivity to sweet foods, cold air, or brushing without spontaneous pain.',
      'Manage visible small cavities and lost or chipped fillings.',
      'Manage a chipped tooth edge where there is no pain and no exposed pulp.',
    ],
    contextSentence:
      'From Butterfly Clinic General Dental Scope. This criterion describes when to manage simple cavities, fillings, and sensitivity with a general dentist.',
    keywords: ['filling', 'caries', 'cavity', 'chipped filling', 'lost filling', 'sweet sensitivity', 'cold air', 'chipped edge no pain'],
  },
  {
    id: 'general_dentist::c3',
    docTitle: 'Butterfly Clinic General Dental Scope & First-Line Management (Rev 2026)',
    specialty: 'general_dentist',
    specialtyLabel: 'General Dentist',
    careLevel: 1,
    criterionNumber: 3,
    title: 'Simple extraction',
    text: `Criterion 3: Simple extraction
Manage a loose tooth in an adult with advanced mobility and no facial swelling.
Manage a fully erupted tooth requiring removal with no bony impaction.`,
    lines: [
      'Manage a loose tooth in an adult with advanced mobility and no facial swelling.',
      'Manage a fully erupted tooth requiring removal with no bony impaction.',
    ],
    contextSentence:
      'From Butterfly Clinic General Dental Scope. This criterion describes when to perform simple tooth extractions with a general dentist without surgical impaction.',
    keywords: ['simple extraction', 'loose tooth', 'adult mobility', 'fully erupted tooth', 'no bony impaction', 'no facial swelling'],
  },
  {
    id: 'general_dentist::c4',
    docTitle: 'Butterfly Clinic General Dental Scope & First-Line Management (Rev 2026)',
    specialty: 'general_dentist',
    specialtyLabel: 'General Dentist',
    careLevel: 1,
    criterionNumber: 4,
    title: 'Initial assessment and onward referral (Broadest Safe Option)',
    text: `Criterion 4: Initial assessment and onward referral
Undertake first assessment of any oral complaint and refer onward where criteria are met.
Where a presentation does not clearly match any specialist criterion, assess here first.`,
    lines: [
      'Undertake first assessment of any oral complaint and refer onward where criteria are met.',
      'Where a presentation does not clearly match any specialist criterion, assess here first.',
    ],
    contextSentence:
      'From Butterfly Clinic General Dental Scope. Broadest safe option for vague or uncertain oral complaints requiring first-line clinician triage.',
    keywords: ['initial assessment', 'broadest safe option', 'fallback', 'first line', 'onward referral', 'unclear presentation'],
  },

  // --- ENDODONTIST (CARE LEVEL 2) ---
  {
    id: 'endodontist::c1',
    docTitle: 'Butterfly Clinic Endodontic Referral Criteria (Rev 2026)',
    specialty: 'endodontist',
    specialtyLabel: 'Endodontist',
    careLevel: 2,
    criterionNumber: 1,
    title: 'Pulpal pain',
    text: `Criterion 1: Pulpal pain
Refer spontaneous throbbing tooth pain that wakes the patient at night.
Refer pain lingering more than thirty seconds after a cold or hot stimulus is removed.
Refer pain that the patient cannot localise to a single tooth.`,
    lines: [
      'Refer spontaneous throbbing tooth pain that wakes the patient at night.',
      'Refer pain lingering more than thirty seconds after a cold or hot stimulus is removed.',
      'Refer pain that the patient cannot localise to a single tooth.',
    ],
    contextSentence:
      'From Butterfly Clinic Endodontic Referral Criteria. This criterion describes when to refer spontaneous throbbing pulpal pain to an endodontist.',
    keywords: ['throbbing pain', 'wakes at night', 'pulpal pain', 'lingering pain hot cold', 'cannot localise', 'night pain'],
  },
  {
    id: 'endodontist::c2',
    docTitle: 'Butterfly Clinic Endodontic Referral Criteria (Rev 2026)',
    specialty: 'endodontist',
    specialtyLabel: 'Endodontist',
    careLevel: 2,
    criterionNumber: 2,
    title: 'Failed or complex root canal',
    text: `Criterion 2: Failed or complex root canal
Refer a tooth with a previous root canal treatment that has become painful again.
Refer teeth with curved, calcified, or additional canals identified on radiograph.
Refer where a previous root filling appears short or incomplete on imaging.`,
    lines: [
      'Refer a tooth with a previous root canal treatment that has become painful again.',
      'Refer teeth with curved, calcified, or additional canals identified on radiograph.',
      'Refer where a previous root filling appears short or incomplete on imaging.',
    ],
    contextSentence:
      'From Butterfly Clinic Endodontic Referral Criteria. This criterion describes referring previously treated or failed root canals to an endodontist.',
    keywords: ['root canal painful again', 'failed root canal', 'calcified canals', 'curved canals', 'short root filling'],
  },
  {
    id: 'endodontist::c3',
    docTitle: 'Butterfly Clinic Endodontic Referral Criteria (Rev 2026)',
    specialty: 'endodontist',
    specialtyLabel: 'Endodontist',
    careLevel: 2,
    criterionNumber: 3,
    title: 'Localised dental abscess without spread',
    text: `Criterion 3: Localised dental abscess without spread
Refer a localised gum boil or pus discharge at the gum margin adjacent to one tooth.
Refer a tooth tender to biting with a small localised swelling and no facial involvement.`,
    lines: [
      'Refer a localised gum boil or pus discharge at the gum margin adjacent to one tooth.',
      'Refer a tooth tender to biting with a small localised swelling and no facial involvement.',
    ],
    contextSentence:
      'From Butterfly Clinic Endodontic Referral Criteria. This criterion describes localised dental abscess and gum boil management with an endodontist.',
    keywords: ['gum boil', 'pus discharge', 'localised abscess', 'tender to biting', 'pimple on gum', 'no facial spread'],
  },
  {
    id: 'endodontist::c4',
    docTitle: 'Butterfly Clinic Endodontic Referral Criteria (Rev 2026)',
    specialty: 'endodontist',
    specialtyLabel: 'Endodontist',
    careLevel: 2,
    criterionNumber: 4,
    title: 'Traumatic pulp exposure',
    text: `Criterion 4: Traumatic pulp exposure
Refer a fractured tooth with visible pink or bleeding pulp tissue exposed.
Refer a tooth avulsed and replanted requiring pulp management.`,
    lines: [
      'Refer a fractured tooth with visible pink or bleeding pulp tissue exposed.',
      'Refer a tooth avulsed and replanted requiring pulp management.',
    ],
    contextSentence:
      'From Butterfly Clinic Endodontic Referral Criteria. This criterion describes traumatic pulp exposure or knocked out replanted tooth requiring an endodontist.',
    keywords: ['pink tissue exposed', 'bleeding pulp', 'fractured tooth pulp', 'tooth avulsed replanted', 'dental trauma pulp'],
  },

  // --- PERIODONTIST (CARE LEVEL 2) ---
  {
    id: 'periodontist::c1',
    docTitle: 'Butterfly Clinic Periodontal Referral Criteria (Rev 2026)',
    specialty: 'periodontist',
    specialtyLabel: 'Periodontist',
    careLevel: 2,
    criterionNumber: 1,
    title: 'Advanced gum disease',
    text: `Criterion 1: Advanced gum disease
Refer generalised gum recession with exposed root surfaces.
Refer deep pockets persisting after initial cleaning by a general dentist.
Refer multiple mobile teeth in the absence of trauma or facial swelling.`,
    lines: [
      'Refer generalised gum recession with exposed root surfaces.',
      'Refer deep pockets persisting after initial cleaning by a general dentist.',
      'Refer multiple mobile teeth in the absence of trauma or facial swelling.',
    ],
    contextSentence:
      'From Butterfly Clinic Periodontal Referral Criteria. This criterion describes referring advanced gum recession, deep pockets, or loose teeth to a periodontist.',
    keywords: ['gum recession', 'exposed roots', 'deep pockets', 'periodontal disease', 'multiple mobile teeth', 'loose teeth'],
  },
  {
    id: 'periodontist::c2',
    docTitle: 'Butterfly Clinic Periodontal Referral Criteria (Rev 2026)',
    specialty: 'periodontist',
    specialtyLabel: 'Periodontist',
    careLevel: 2,
    criterionNumber: 2,
    title: 'Rapid progression',
    text: `Criterion 2: Rapid progression
Refer bone loss progressing rapidly in a patient under thirty-five.
Refer recurrent gum abscesses affecting several separate sites.`,
    lines: [
      'Refer bone loss progressing rapidly in a patient under thirty-five.',
      'Refer recurrent gum abscesses affecting several separate sites.',
    ],
    contextSentence:
      'From Butterfly Clinic Periodontal Referral Criteria. This criterion describes rapid periodontal bone loss in young patients or multi-site gum abscesses.',
    keywords: ['rapid bone loss', 'under thirty-five', 'recurrent gum abscesses', 'aggressive periodontitis'],
  },
  {
    id: 'periodontist::c3',
    docTitle: 'Butterfly Clinic Periodontal Referral Criteria (Rev 2026)',
    specialty: 'periodontist',
    specialtyLabel: 'Periodontist',
    careLevel: 2,
    criterionNumber: 3,
    title: 'Soft tissue grafting',
    text: `Criterion 3: Soft tissue grafting
Refer recession requiring a gum graft for coverage.
Refer inadequate gum thickness around a planned implant site.`,
    lines: [
      'Refer recession requiring a gum graft for coverage.',
      'Refer inadequate gum thickness around a planned implant site.',
    ],
    contextSentence:
      'From Butterfly Clinic Periodontal Referral Criteria. This criterion describes gum graft surgery and soft tissue augmentation for implants with a periodontist.',
    keywords: ['gum graft', 'soft tissue graft', 'recession coverage', 'implant site gum thickness'],
  },

  // --- ORTHODONTIST (CARE LEVEL 2) ---
  {
    id: 'orthodontist::c1',
    docTitle: 'Butterfly Clinic Orthodontic Referral Criteria (Rev 2026)',
    specialty: 'orthodontist',
    specialtyLabel: 'Orthodontist',
    careLevel: 2,
    criterionNumber: 1,
    title: 'Alignment and spacing',
    text: `Criterion 1: Alignment and spacing
Refer crowded, crooked, or protruding teeth where the patient seeks correction.
Refer gaps between teeth for space management assessment.`,
    lines: [
      'Refer crowded, crooked, or protruding teeth where the patient seeks correction.',
      'Refer gaps between teeth for space management assessment.',
    ],
    contextSentence:
      'From Butterfly Clinic Orthodontic Referral Criteria. This criterion describes referring crowded, crooked, or spaced teeth for orthodontic alignment.',
    keywords: ['crooked teeth', 'crowded teeth', 'straightened', 'braces', 'aligners', 'teeth gap', 'protruding teeth'],
  },
  {
    id: 'orthodontist::c2',
    docTitle: 'Butterfly Clinic Orthodontic Referral Criteria (Rev 2026)',
    specialty: 'orthodontist',
    specialtyLabel: 'Orthodontist',
    careLevel: 2,
    criterionNumber: 2,
    title: 'Bite relationship',
    text: `Criterion 2: Bite relationship
Refer an overbite, underbite, or crossbite affecting function.
Refer a jaw that appears to deviate on closing without pain or locking.`,
    lines: [
      'Refer an overbite, underbite, or crossbite affecting function.',
      'Refer a jaw that appears to deviate on closing without pain or locking.',
    ],
    contextSentence:
      'From Butterfly Clinic Orthodontic Referral Criteria. This criterion describes overbite, underbite, or functional malocclusion referral to an orthodontist.',
    keywords: ['overbite', 'underbite', 'crossbite', 'bite does not line up', 'jaw deviation closing'],
  },
  {
    id: 'orthodontist::c3',
    docTitle: 'Butterfly Clinic Orthodontic Referral Criteria (Rev 2026)',
    specialty: 'orthodontist',
    specialtyLabel: 'Orthodontist',
    careLevel: 2,
    criterionNumber: 3,
    title: 'Growth timing',
    text: `Criterion 3: Growth timing
Refer children with erupting teeth in abnormal position for growth assessment.
Refer retained baby teeth beyond the expected age of loss.`,
    lines: [
      'Refer children with erupting teeth in abnormal position for growth assessment.',
      'Refer retained baby teeth beyond the expected age of loss.',
    ],
    contextSentence:
      'From Butterfly Clinic Orthodontic Referral Criteria. This criterion describes pediatric growth assessment and retained primary teeth with an orthodontist.',
    keywords: ['children erupting teeth', 'retained baby teeth', 'growth assessment', 'abnormal position'],
  },

  // --- ORAL SURGEON (CARE LEVEL 3) ---
  {
    id: 'oral_surgeon::c1',
    docTitle: 'Butterfly Clinic Oral & Maxillofacial Surgery Referral Criteria (Rev 2026)',
    specialty: 'oral_surgeon',
    specialtyLabel: 'Oral & Maxillofacial Surgeon',
    careLevel: 3,
    criterionNumber: 1,
    title: 'Impacted and surgical extraction',
    text: `Criterion 1: Impacted and surgical extraction
Refer an impacted wisdom tooth with recurrent pain or repeated gum infection.
Refer a partially erupted tooth lying sideways or under the bone on radiograph.
Refer a tooth requiring surgical removal with bone removal or sectioning.
Refer a root fractured and retained below the gum line after a failed extraction.`,
    lines: [
      'Refer an impacted wisdom tooth with recurrent pain or repeated gum infection.',
      'Refer a partially erupted tooth lying sideways or under the bone on radiograph.',
      'Refer a tooth requiring surgical removal with bone removal or sectioning.',
      'Refer a root fractured and retained below the gum line after a failed extraction.',
    ],
    contextSentence:
      'From Butterfly Clinic Oral Surgery Referral Criteria. This criterion describes when to refer impacted wisdom teeth, sideways teeth, or broken root fragments to an oral surgeon.',
    keywords: ['impacted wisdom tooth', 'sideways tooth', 'under the bone', 'surgical removal', 'retained root', 'failed extraction'],
  },
  {
    id: 'oral_surgeon::c2',
    docTitle: 'Butterfly Clinic Oral & Maxillofacial Surgery Referral Criteria (Rev 2026)',
    specialty: 'oral_surgeon',
    specialtyLabel: 'Oral & Maxillofacial Surgeon',
    careLevel: 3,
    criterionNumber: 2,
    title: 'Cysts and lesions',
    text: `Criterion 2: Cysts and lesions
Refer a radiolucent lesion or cyst identified around a tooth root or in the jaw.
Refer a persistent hard lump on the jaw bone.
Refer a non-healing ulcer or white or red patch persisting beyond three weeks.`,
    lines: [
      'Refer a radiolucent lesion or cyst identified around a tooth root or in the jaw.',
      'Refer a persistent hard lump on the jaw bone.',
      'Refer a non-healing ulcer or white or red patch persisting beyond three weeks.',
    ],
    contextSentence:
      'From Butterfly Clinic Oral Surgery Referral Criteria. This criterion describes referring cysts, bone lumps, non-healing ulcers, or white patches persisting >3 weeks to an oral surgeon.',
    keywords: ['cyst in jaw', 'hard lump jaw', 'white patch persisting', 'red patch', 'non healing ulcer', 'oral lesion'],
  },
  {
    id: 'oral_surgeon::c3',
    docTitle: 'Butterfly Clinic Oral & Maxillofacial Surgery Referral Criteria (Rev 2026)',
    specialty: 'oral_surgeon',
    specialtyLabel: 'Oral & Maxillofacial Surgeon',
    careLevel: 3,
    criterionNumber: 3,
    title: 'Jaw joint and facial pain',
    text: `Criterion 3: Jaw joint and facial pain
Refer a jaw joint that locks open or locked closed.
Refer persistent facial pain with restricted mouth opening and no dental cause found.`,
    lines: [
      'Refer a jaw joint that locks open or locked closed.',
      'Refer persistent facial pain with restricted mouth opening and no dental cause found.',
    ],
    contextSentence:
      'From Butterfly Clinic Oral Surgery Referral Criteria. This criterion describes referring temporomandibular locked jaw or restricted opening to an oral surgeon.',
    keywords: ['jaw locks open', 'jaw locks closed', 'tmd', 'tmj locking', 'restricted mouth opening', 'facial pain'],
  },
  {
    id: 'oral_surgeon::c4',
    docTitle: 'Butterfly Clinic Oral & Maxillofacial Surgery Referral Criteria (Rev 2026)',
    specialty: 'oral_surgeon',
    specialtyLabel: 'Oral & Maxillofacial Surgeon',
    careLevel: 3,
    criterionNumber: 4,
    title: 'Facial trauma',
    text: `Criterion 4: Facial trauma
Refer a suspected fractured jaw or cheekbone after injury.
Refer a tooth driven into the socket or knocked out with associated bone injury.`,
    lines: [
      'Refer a suspected fractured jaw or cheekbone after injury.',
      'Refer a tooth driven into the socket or knocked out with associated bone injury.',
    ],
    contextSentence:
      'From Butterfly Clinic Oral Surgery Referral Criteria. This criterion describes trauma, suspected jaw fractures, or alveolar bone injury referral to an oral surgeon.',
    keywords: ['fractured jaw', 'fractured cheekbone', 'facial injury trauma', 'bone injury tooth knocked out'],
  },
  {
    id: 'oral_surgeon::c5',
    docTitle: 'Butterfly Clinic Oral & Maxillofacial Surgery Referral Criteria (Rev 2026)',
    specialty: 'oral_surgeon',
    specialtyLabel: 'Oral & Maxillofacial Surgeon',
    careLevel: 3,
    criterionNumber: 5,
    title: 'Implants and reconstruction',
    text: `Criterion 5: Implants and reconstruction
Refer implant placement requiring bone grafting or sinus augmentation.`,
    lines: ['Refer implant placement requiring bone grafting or sinus augmentation.'],
    contextSentence:
      'From Butterfly Clinic Oral Surgery Referral Criteria. This criterion describes complex implant placement with bone grafting or sinus lift.',
    keywords: ['implant bone grafting', 'sinus augmentation', 'sinus lift', 'surgical implant'],
  },
];

// --- 24-CASE BENCHMARK EVALUATION SET (Stage 12 of Notebook) ---
export interface BenchmarkItem {
  id: string;
  query: string;
  expectedSpecialty: Specialty;
  expectedCareLevel: number;
  category: 'direct_symptom' | 'urgent_emergency' | 'procedure_exact' | 'vague_fallback';
}

export const DENTAL_EVAL_SET: BenchmarkItem[] = [
  { id: 'EVAL-01', query: 'my back tooth is coming through sideways and keeps getting infected', expectedSpecialty: 'oral_surgeon', expectedCareLevel: 3, category: 'direct_symptom' },
  { id: 'EVAL-02', query: 'wisdom tooth hurts again, third time this year', expectedSpecialty: 'oral_surgeon', expectedCareLevel: 3, category: 'direct_symptom' },
  { id: 'EVAL-03', query: "a white patch in my mouth that hasn't gone in over a month", expectedSpecialty: 'oral_surgeon', expectedCareLevel: 3, category: 'direct_symptom' },
  { id: 'EVAL-04', query: 'my jaw locks when I open it wide', expectedSpecialty: 'oral_surgeon', expectedCareLevel: 3, category: 'direct_symptom' },
  { id: 'EVAL-05', query: 'a piece of root was left behind after my extraction', expectedSpecialty: 'oral_surgeon', expectedCareLevel: 3, category: 'procedure_exact' },
  { id: 'EVAL-06', query: "hard lump on my jaw bone that isn't going away", expectedSpecialty: 'oral_surgeon', expectedCareLevel: 3, category: 'direct_symptom' },
  { id: 'EVAL-07', query: "throbbing pain that wakes me at night and I can't tell which tooth", expectedSpecialty: 'endodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-08', query: 'pain carries on long after I drink something cold', expectedSpecialty: 'endodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-09', query: 'my old root canal has started hurting again', expectedSpecialty: 'endodontist', expectedCareLevel: 2, category: 'procedure_exact' },
  { id: 'EVAL-10', query: 'a gum boil next to one tooth with pus coming out', expectedSpecialty: 'endodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-11', query: 'chipped my tooth and I can see pink tissue inside', expectedSpecialty: 'endodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-12', query: 'my gums have receded and the roots are showing', expectedSpecialty: 'periodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-13', query: "several teeth feel loose but there's no swelling", expectedSpecialty: 'periodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-14', query: 'deep pockets still there after two cleanings', expectedSpecialty: 'periodontist', expectedCareLevel: 2, category: 'procedure_exact' },
  { id: 'EVAL-15', query: 'my teeth are crooked and I want them straightened', expectedSpecialty: 'orthodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-16', query: "there's a big gap between my front teeth", expectedSpecialty: 'orthodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-17', query: "my bite doesn't line up properly", expectedSpecialty: 'orthodontist', expectedCareLevel: 2, category: 'direct_symptom' },
  { id: 'EVAL-18', query: 'my gums bleed a bit when I brush, nothing else', expectedSpecialty: 'general_dentist', expectedCareLevel: 1, category: 'direct_symptom' },
  { id: 'EVAL-19', query: 'teeth are sensitive to sweet things', expectedSpecialty: 'general_dentist', expectedCareLevel: 1, category: 'direct_symptom' },
  { id: 'EVAL-20', query: 'a filling fell out yesterday', expectedSpecialty: 'general_dentist', expectedCareLevel: 1, category: 'procedure_exact' },
  { id: 'EVAL-21', query: "I'd like a check-up and a clean", expectedSpecialty: 'general_dentist', expectedCareLevel: 1, category: 'direct_symptom' },
  { id: 'EVAL-22', query: 'small chip on my front tooth, no pain', expectedSpecialty: 'general_dentist', expectedCareLevel: 1, category: 'direct_symptom' },
  { id: 'EVAL-23', query: 'swelling spreading toward my eye with a fever', expectedSpecialty: 'emergency', expectedCareLevel: 4, category: 'urgent_emergency' },
  { id: 'EVAL-24', query: "I can't swallow properly and my face is swollen", expectedSpecialty: 'emergency', expectedCareLevel: 4, category: 'urgent_emergency' },
];
