/**
 * Universal Multi-Specialty Patient Care Hub Dataset
 * Covers all patient body systems: Chest/Cardio, Neuro/Head, GI/Stomach,
 * Musculoskeletal, Respiratory, Dermatology, ENT/Eye, Dental, and General.
 * Grounded in verified clinical triage protocols (Emergency, Urgent, Specialist, Primary Care).
 */

export interface BodySystemOption {
  id: string;
  label: string;
  sublabel: string;
  iconName: string;
  bgPastel: string;
  accentColor: string;
  category: 'cardio' | 'neuro' | 'respiratory' | 'digestive' | 'ortho' | 'dental' | 'derma' | 'ent' | 'general';
  defaultPrompt: string;
  customIssues: CustomIssueQuestion[];
}

export interface CustomIssueOption {
  id: string;
  label: string;
  iconName?: string;
  isEmergencyAlert?: boolean;
}

export interface CustomIssueQuestion {
  id: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'scale';
  options: CustomIssueOption[];
}

export const UNIVERSAL_FEELING_OPTIONS: BodySystemOption[] = [
  {
    id: 'chest_heart',
    label: 'Chest & Heart',
    sublabel: 'Tightness, fluttering, breathing',
    iconName: 'HeartPulse',
    bgPastel: '#fee2e2',
    accentColor: '#dc2626',
    category: 'cardio',
    defaultPrompt: 'I feel tightness or discomfort in my chest with slight shortness of breath.',
    customIssues: [
      {
        id: 'chest_nature',
        question: 'What does the sensation feel like?',
        type: 'multi_select',
        options: [
          { id: 'crushing_pressure', label: 'Heavy squeezing / crushing pressure', isEmergencyAlert: true },
          { id: 'radiating_arm_jaw', label: 'Spreads to left arm, neck, or jaw', isEmergencyAlert: true },
          { id: 'sharp_on_breath', label: 'Sharp stabbing pain when taking a deep breath' },
          { id: 'racing_palpitations', label: 'Racing, skipped, or fluttering heartbeats' },
          { id: 'burning_after_eating', label: 'Burning acid sensation after meals / lying down' },
        ],
      },
      {
        id: 'chest_onset',
        question: 'When did this start?',
        type: 'single_select',
        options: [
          { id: 'sudden_minutes', label: 'Suddenly within the last 15-30 minutes', isEmergencyAlert: true },
          { id: 'started_today', label: 'Gradually earlier today' },
          { id: 'intermittent_days', label: 'Comes and goes over several days' },
        ],
      },
    ],
  },
  {
    id: 'head_neuro',
    label: 'Head & Brain',
    sublabel: 'Severe headache, dizziness, vision',
    iconName: 'Brain',
    bgPastel: '#f3e8ff',
    accentColor: '#9333ea',
    category: 'neuro',
    defaultPrompt: 'I have a painful headache with dizziness and sensitivity to bright lights.',
    customIssues: [
      {
        id: 'head_nature',
        question: 'Which symptoms are you experiencing?',
        type: 'multi_select',
        options: [
          { id: 'thunderclap', label: 'Sudden worst headache of life (Thunderclap)', isEmergencyAlert: true },
          { id: 'face_droop_arm_weak', label: 'Facial drooping or one-sided arm weakness', isEmergencyAlert: true },
          { id: 'speech_slurred', label: 'Difficulty speaking or slurred words', isEmergencyAlert: true },
          { id: 'pulsing_migraine', label: 'Throbbing on one side with light/sound sensitivity' },
          { id: 'spinning_vertigo', label: 'Room feels like it is spinning when turning head' },
          { id: 'band_tension', label: 'Dull tight band squeezing forehead & temples' },
        ],
      },
      {
        id: 'head_onset',
        question: 'How quickly did it peak?',
        type: 'single_select',
        options: [
          { id: 'peak_seconds', label: 'Explosive onset within seconds', isEmergencyAlert: true },
          { id: 'built_over_hours', label: 'Built up steadily over several hours' },
          { id: 'recurrent_episodes', label: 'Frequent recurring pattern I get monthly' },
        ],
      },
    ],
  },
  {
    id: 'stomach_digestive',
    label: 'Stomach & Gut',
    sublabel: 'Cramps, nausea, sharp pains',
    iconName: 'Activity',
    bgPastel: '#fef3c7',
    accentColor: '#d97706',
    category: 'digestive',
    defaultPrompt: 'I have severe stomach cramps, bloating, and nausea.',
    customIssues: [
      {
        id: 'stomach_location',
        question: 'Where is the pain concentrated?',
        type: 'single_select',
        options: [
          { id: 'lower_right_sharp', label: 'Sharp pain in Lower Right abdomen (Appendicitis sign)', isEmergencyAlert: true },
          { id: 'upper_right_after_fatty', label: 'Upper right under ribs after eating fatty food' },
          { id: 'burning_upper_center', label: 'Burning in upper center chest / epigastric area' },
          { id: 'generalized_cramping', label: 'Generalized abdominal cramping with bloating' },
        ],
      },
      {
        id: 'stomach_red_flags',
        question: 'Any of these additional signs?',
        type: 'multi_select',
        options: [
          { id: 'vomiting_blood_coffee', label: 'Vomiting blood or dark coffee-ground material', isEmergencyAlert: true },
          { id: 'black_tarry_stool', label: 'Black tarry or bloody bowel movements', isEmergencyAlert: true },
          { id: 'high_fever_chills', label: 'High fever and uncontrollable shaking chills' },
          { id: 'mild_nausea', label: 'Mild nausea without vomiting' },
          { id: 'none_of_above', label: 'None of these severe signs' },
        ],
      },
    ],
  },
  {
    id: 'respiratory_flu',
    label: 'Cough & Breathing',
    sublabel: 'Short of breath, wheezing, fever',
    iconName: 'Wind',
    bgPastel: '#e0f2fe',
    accentColor: '#0284c7',
    category: 'respiratory',
    defaultPrompt: 'I have a deep persistent cough, fever, and difficulty catching my breath.',
    customIssues: [
      {
        id: 'respiratory_nature',
        question: 'What are you noticing with your lungs and breathing?',
        type: 'multi_select',
        options: [
          { id: 'struggling_breath_rest', label: 'Struggling to breathe even while resting', isEmergencyAlert: true },
          { id: 'blue_lips_fingers', label: 'Bluish or pale color around lips or fingers', isEmergencyAlert: true },
          { id: 'audible_wheezing', label: 'High-pitched whistling or wheezing sound' },
          { id: 'cough_yellow_green', label: 'Coughing up thick yellow, green, or rusty mucus' },
          { id: 'scratchy_throat_mild', label: 'Ticklish dry cough with runny nose' },
        ],
      },
      {
        id: 'fever_level',
        question: 'Do you have a temperature / fever?',
        type: 'single_select',
        options: [
          { id: 'high_over_103', label: 'High fever over 103°F (39.4°C) with confusion', isEmergencyAlert: true },
          { id: 'moderate_100_102', label: 'Moderate fever between 100°F - 102°F' },
          { id: 'no_fever', label: 'No fever detected' },
        ],
      },
    ],
  },
  {
    id: 'dental_oral',
    label: 'Dental & Oral',
    sublabel: 'Toothache, gums, jaw, wisdom',
    iconName: 'Zap',
    bgPastel: '#ccfbf1',
    accentColor: '#0f766e',
    category: 'dental',
    defaultPrompt: 'I have a throbbing toothache in my lower jaw that hurts when biting down.',
    customIssues: [
      {
        id: 'dental_nature',
        question: 'What is happening with your teeth or mouth?',
        type: 'multi_select',
        options: [
          { id: 'spreading_face_swelling', label: 'Swelling spreading toward eye, neck or throat', isEmergencyAlert: true },
          { id: 'cannot_swallow_mouth', label: 'Unable to swallow saliva or open mouth', isEmergencyAlert: true },
          { id: 'throbbing_tooth_night', label: 'Constant throbbing ache worse when lying down' },
          { id: 'shock_hot_cold', label: 'Lingering sharp shock with hot coffee or cold water' },
          { id: 'bleeding_tender_gums', label: 'Tender gums that bleed easily when brushing' },
          { id: 'chipped_jagged_edge', label: 'Chipped enamel edge cutting tongue or cheek' },
        ],
      },
      {
        id: 'dental_duration',
        question: 'How long has it been bothering you?',
        type: 'single_select',
        options: [
          { id: 'started_suddenly_today', label: 'Started suddenly today' },
          { id: 'lingering_weeks', label: 'Lingering for over a week' },
          { id: 'recurring_flareup', label: 'Periodic flare-up from a back wisdom tooth' },
        ],
      },
    ],
  },
  {
    id: 'bones_joints_back',
    label: 'Bones & Spine',
    sublabel: 'Back spasm, sprained joint, neck',
    iconName: 'Bone',
    bgPastel: '#ffedd5',
    accentColor: '#ea580c',
    category: 'ortho',
    defaultPrompt: 'My lower back locked up with sharp shooting pain down my leg.',
    customIssues: [
      {
        id: 'ortho_nature',
        question: 'What injury or discomfort occurred?',
        type: 'multi_select',
        options: [
          { id: 'loss_bowel_bladder', label: 'Numbness in groin or loss of bowel/bladder control', isEmergencyAlert: true },
          { id: 'unable_bear_weight', label: 'Inability to take 4 steps / bear any weight on leg' },
          { id: 'shooting_sciatica', label: 'Electric shooting pain down the back of thigh & calf' },
          { id: 'joint_hot_swollen', label: 'Joint is red, hot to touch, and rapidly swelling' },
          { id: 'muscle_stiffness', label: 'Dull ache and morning stiffness after lifting' },
        ],
      },
    ],
  },
  {
    id: 'skin_allergies',
    label: 'Skin & Allergies',
    sublabel: 'Rashes, hives, bites, swelling',
    iconName: 'ShieldAlert',
    bgPastel: '#fce7f3',
    accentColor: '#db2777',
    category: 'derma',
    defaultPrompt: 'I developed an itchy red rash and hives spreading over my arms and torso.',
    customIssues: [
      {
        id: 'skin_nature',
        question: 'What does the skin or reaction look like?',
        type: 'multi_select',
        options: [
          { id: 'lip_tongue_swelling', label: 'Swelling of lips, tongue, or throat tightening', isEmergencyAlert: true },
          { id: 'rapid_spreading_hives', label: 'Rapidly spreading raised itchy red welts (Hives)' },
          { id: 'blistering_painful', label: 'Painful fluid-filled blisters along one side of body' },
          { id: 'red_streaks_fever', label: 'Expanding red border with warm red streak from wound', isEmergencyAlert: true },
          { id: 'dry_flaking_eczema', label: 'Dry, itchy patches on elbows or behind knees' },
        ],
      },
    ],
  },
  {
    id: 'eyes_ears_ent',
    label: 'Eyes, Ears & ENT',
    sublabel: 'Earache, eye redness, sinus pain',
    iconName: 'Eye',
    bgPastel: '#f1f5f9',
    accentColor: '#475569',
    category: 'ent',
    defaultPrompt: 'I have severe sinus pressure above my eyes and sharp pain deep in my ear.',
    customIssues: [
      {
        id: 'ent_nature',
        question: 'What specific issue are you noticing?',
        type: 'multi_select',
        options: [
          { id: 'sudden_vision_loss', label: 'Sudden loss or curtain falling over vision', isEmergencyAlert: true },
          { id: 'severe_eye_pain_halo', label: 'Severe aching eye pain with rainbow halos around lights', isEmergencyAlert: true },
          { id: 'deep_ear_pain_drain', label: 'Sharp stabbing earache with yellow fluid draining' },
          { id: 'sinus_maxillary_ache', label: 'Intense forehead/cheek pressure worse when bending over' },
          { id: 'sore_throat_tonsils', label: 'Swollen white spots on tonsils with painful swallowing' },
        ],
      },
    ],
  },
  {
    id: 'general_wellness',
    label: 'General & Preventive',
    sublabel: 'Exhaustion, routine health screen',
    iconName: 'Sparkles',
    bgPastel: '#ecfdf5',
    accentColor: '#059669',
    category: 'general',
    defaultPrompt: 'I would like a routine clinical wellness checkup, lab panels, and health advice.',
    customIssues: [
      {
        id: 'wellness_goals',
        question: 'What is your primary care objective today?',
        type: 'multi_select',
        options: [
          { id: 'annual_physical', label: 'Annual full-body health exam & baseline vitals' },
          { id: 'chronic_fatigue', label: 'Persistent exhaustion despite sleeping 8 hours' },
          { id: 'bloodwork_screening', label: 'Routine cholesterol, diabetes & thyroid blood panel' },
          { id: 'immunization_vaccines', label: 'Travel immunizations or booster vaccines' },
        ],
      },
    ],
  },
];

export interface TriageResult {
  urgencyLevel: 'emergency' | 'urgent' | 'specialist' | 'primary_care';
  urgencyLabel: string;
  urgencyColor: string;
  matchedDepartment: string;
  matchedDoctorTitle: string;
  summaryTitle: string;
  plainEnglishExplanation: string;
  redFlagsList: string[];
  doctorVisitQuestions: string[];
  recommendedAction: string;
}

export function evaluateUniversalTriage(
  primarySystemId: string,
  selectedOptions: string[],
  painScore: number,
  freeText: string
): TriageResult {
  const combinedText = `${primarySystemId} ${selectedOptions.join(' ')} ${freeText}`.toLowerCase();

  // 1. EMERGENCY LEVEL CHECKS
  const isEmergency =
    selectedOptions.some((opt) =>
      [
        'crushing_pressure',
        'radiating_arm_jaw',
        'sudden_minutes',
        'thunderclap',
        'face_droop_arm_weak',
        'speech_slurred',
        'peak_seconds',
        'lower_right_sharp',
        'vomiting_blood_coffee',
        'black_tarry_stool',
        'struggling_breath_rest',
        'blue_lips_fingers',
        'high_over_103',
        'spreading_face_swelling',
        'cannot_swallow_mouth',
        'loss_bowel_bladder',
        'lip_tongue_swelling',
        'red_streaks_fever',
        'sudden_vision_loss',
        'severe_eye_pain_halo',
      ].includes(opt)
    ) ||
    /shortness\s+of\s+breath|chest\s+pain|cannot\s+breathe|unable\s+to\s+swallow|vomiting\s+blood|slurred\s+speech|worst\s+headache/i.test(
      combinedText
    );

  if (isEmergency) {
    return {
      urgencyLevel: 'emergency',
      urgencyLabel: '🔴 IMMEDIATE EMERGENCY ASSESSMENT REQUIRED',
      urgencyColor: '#dc2626',
      matchedDepartment: 'Emergency Department (ED / Trauma Center)',
      matchedDoctorTitle: 'Attending Emergency Medicine Physician',
      summaryTitle: 'High-Priority Clinical Red Flag Detected',
      plainEnglishExplanation:
        'Your reported symptoms include clinical signs that require prompt medical evaluation in an emergency setting. Do not drive yourself; please have someone assist you or call local emergency dispatch immediately.',
      redFlagsList: [
        'Sudden severe chest pressure, jaw or arm pain radiating outward',
        'Difficulty breathing, wheezing at rest, or inability to swallow saliva',
        'Sudden numbness, facial weakness, speech difficulty or vision loss',
        'High fever accompanied by confusion, stiff neck, or spreading facial swelling',
      ],
      doctorVisitQuestions: [
        'What immediate diagnostic tests (ECG, CT scan, blood labs) are being performed?',
        'Are there signs of acute myocardial, neurological, or airway compromise?',
        'What medications or stabilization procedures are recommended right now?',
      ],
      recommendedAction: 'Call 911 or proceed immediately to the nearest Hospital Emergency Room.',
    };
  }

  // 2. SAME-DAY URGENT CARE
  const isUrgent =
    painScore >= 7 ||
    selectedOptions.some((opt) =>
      [
        'sharp_on_breath',
        'spinning_vertigo',
        'high_fever_chills',
        'audible_wheezing',
        'cough_yellow_green',
        'moderate_100_102',
        'throbbing_tooth_night',
        'unable_bear_weight',
        'joint_hot_swollen',
        'deep_ear_pain_drain',
        'rapid_spreading_hives',
      ].includes(opt)
    ) ||
    combinedText.includes('severe') ||
    combinedText.includes('fever') ||
    combinedText.includes('throbbing');

  if (isUrgent) {
    let department = 'Urgent Care Center';
    let doctorTitle = 'Urgent Care Clinician / Medical Officer';

    if (primarySystemId === 'dental_oral') {
      department = 'Emergency Dental Care / Endodontics';
      doctorTitle = 'Specialist Endodontist / Dental Surgeon';
    } else if (primarySystemId === 'bones_joints_back') {
      department = 'Orthopedic Urgent Care';
      doctorTitle = 'Orthopedic Trauma Specialist';
    } else if (primarySystemId === 'respiratory_flu') {
      department = 'Pulmonology / Acute Respiratory Clinic';
      doctorTitle = 'Pulmonologist / Acute Care Physician';
    }

    return {
      urgencyLevel: 'urgent',
      urgencyLabel: '🟠 SAME-DAY URGENT CLINICAL CARE RECOMMENDED',
      urgencyColor: '#ea580c',
      matchedDepartment: department,
      matchedDoctorTitle: doctorTitle,
      summaryTitle: 'Acute Clinical Presentation Requiring Prompt Care',
      plainEnglishExplanation:
        'Your symptoms indicate an active inflammatory or acute process that should be evaluated by a healthcare professional within 12 to 24 hours to prevent complications and quickly relieve pain.',
      redFlagsList: [
        'Pain intensity escalating past 7/10 despite rest',
        'New fever developing or localized swelling spreading',
        'Inability to tolerate fluids or sleep through the night',
      ],
      doctorVisitQuestions: [
        'Is imaging (X-ray, ultrasound, dental radiograph) indicated today?',
        'What is the root cause of this acute inflammation?',
        'What is the targeted clinical treatment to resolve this promptly?',
      ],
      recommendedAction: 'Reserve a same-day priority slot with an on-call specialist or visit an Urgent Care Center today.',
    };
  }

  // 3. SPECIALIST CONSULTATION
  const isSpecialist =
    selectedOptions.some((opt) =>
      [
        'racing_palpitations',
        'pulsing_migraine',
        'upper_right_after_fatty',
        'shock_hot_cold',
        'shooting_sciatica',
        'blistering_painful',
        'sinus_maxillary_ache',
      ].includes(opt)
    ) || painScore >= 4;

  if (isSpecialist) {
    let department = 'Outpatient Specialty Clinic';
    let doctorTitle = 'Board-Certified Specialist';

    if (primarySystemId === 'chest_heart') {
      department = 'Cardiology Consultation';
      doctorTitle = 'Consultant Cardiologist';
    } else if (primarySystemId === 'head_neuro') {
      department = 'Neurology & Headache Clinic';
      doctorTitle = 'Consultant Neurologist';
    } else if (primarySystemId === 'stomach_digestive') {
      department = 'Gastroenterology';
      doctorTitle = 'Specialist Gastroenterologist';
    } else if (primarySystemId === 'dental_oral') {
      department = 'Restorative Dentistry & Periodontics';
      doctorTitle = 'Consultant Dental Surgeon';
    } else if (primarySystemId === 'skin_allergies') {
      department = 'Dermatology & Immunology';
      doctorTitle = 'Specialist Dermatologist';
    } else if (primarySystemId === 'eyes_ears_ent') {
      department = 'Otolaryngology (ENT)';
      doctorTitle = 'ENT Specialist Surgeon';
    }

    return {
      urgencyLevel: 'specialist',
      urgencyLabel: '🟡 SPECIALIST CONSULTATION RECOMMENDED',
      urgencyColor: '#d97706',
      matchedDepartment: department,
      matchedDoctorTitle: doctorTitle,
      summaryTitle: 'Targeted Specialty Evaluation Recommended',
      plainEnglishExplanation:
        'Your presentation is best addressed by a specialist focused on this specific organ system. An in-depth clinical consultation will pinpoint the underlying mechanism and provide a customized recovery strategy.',
      redFlagsList: [
        'Noticeable worsening over the next 48-72 hours',
        'Sudden increase in pain intensity or new radiating symptoms',
      ],
      doctorVisitQuestions: [
        'Are there specific diagnostic markers or tests to confirm this diagnosis?',
        'What conservative or targeted therapies will prevent recurrence?',
        'When should I schedule a follow-up check to monitor healing?',
      ],
      recommendedAction: 'Schedule a specialized in-person or virtual consultation with our matched clinical department.',
    };
  }

  // 4. ROUTINE PRIMARY CARE / WELLNESS
  return {
    urgencyLevel: 'primary_care',
    urgencyLabel: '🟢 ROUTINE PRIMARY CARE & TELEHEALTH',
    urgencyColor: '#059669',
    matchedDepartment: 'Family Medicine & Primary Care',
    matchedDoctorTitle: 'Primary Care Physician / General Practitioner',
    summaryTitle: 'Mild / Preventive Presentation Suitable for Standard Consultation',
    plainEnglishExplanation:
      'Your symptoms appear mild, early-stage, or preventive in nature. A routine office appointment or virtual telehealth consultation is ideal for reviewing your overall health and preventative steps.',
    redFlagsList: [
      'Unexpected spike in pain or fever',
      'Symptoms lingering past 7-10 days without gradual improvement',
    ],
    doctorVisitQuestions: [
      'What lifestyle or preventive adjustments do you recommend?',
      'Are there routine screenings or lab tests appropriate for my age group?',
    ],
    recommendedAction: 'Book a convenient routine appointment or online video consultation with a primary care clinician.',
  };
}

export interface SpecialistDoctor {
  id: string;
  name: string;
  credentials: string;
  title: string;
  department: string;
  clinicName: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  phone: string;
  nextSlot: string;
  avatarUrl: string;
  bio: string;
  telehealthAvailable: boolean;
  insuranceAccepted: string[];
}

export const MULTI_SPECIALTY_DOCTORS: Record<string, SpecialistDoctor> = {
  cardio: {
    id: 'doc_cardio',
    name: 'Dr. Marcus Vance, MD, FACC',
    credentials: 'Board-Certified Cardiologist • Johns Hopkins Medicine',
    title: 'Senior Attending Cardiologist',
    department: 'Cardiology & Cardiovascular Care',
    clinicName: 'Metropolitan Heart & Vascular Institute',
    address: '450 Health Sciences Way, Suite 400',
    distance: '1.2 miles away',
    rating: 4.95,
    reviewCount: 412,
    phone: '(555) 234-5678',
    nextSlot: 'Today at 3:30 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
    bio: 'Specialist in acute chest pain triage, cardiovascular hemodynamics, ECG interpretation, and preventive coronary therapy.',
    telehealthAvailable: true,
    insuranceAccepted: ['BlueCross', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare'],
  },
  neuro: {
    id: 'doc_neuro',
    name: 'Dr. Sophia Al-Mansoor, MD, PhD',
    credentials: 'Fellowship Trained Neurologist • Harvard Medical School',
    title: 'Consultant Neurologist & Headache Specialist',
    department: 'Neurology & Brain Health',
    clinicName: 'Comprehensive Neurological & Headache Center',
    address: '880 Innovation Parkway, Suite 320',
    distance: '1.8 miles away',
    rating: 4.92,
    reviewCount: 340,
    phone: '(555) 345-6789',
    nextSlot: 'Tomorrow at 10:15 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813637-4467000d6e9f?w=160&auto=format&fit=crop&q=80',
    bio: 'Specializing in acute severe headaches, migraine management, vertiginous disorders, and cranial nerve assessments.',
    telehealthAvailable: true,
    insuranceAccepted: ['BlueCross', 'MetLife', 'Cigna', 'Aetna', 'Medicare'],
  },
  digestive: {
    id: 'doc_digestive',
    name: 'Dr. Robert Sterling, MD, FACG',
    credentials: 'Board-Certified Gastroenterologist • Mayo Clinic College of Medicine',
    title: 'Director of Clinical Gastroenterology',
    department: 'Digestive Health & Endoscopy',
    clinicName: 'Sterling Gastroenterology & Abdominal Health',
    address: '620 Health Park Drive, Suite 210',
    distance: '2.1 miles away',
    rating: 4.88,
    reviewCount: 295,
    phone: '(555) 456-7891',
    nextSlot: 'Today at 4:45 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=160&auto=format&fit=crop&q=80',
    bio: 'Expert clinical evaluation for acute abdominal pain, reflux disorders, peptic conditions, and biliary symptoms.',
    telehealthAvailable: true,
    insuranceAccepted: ['Delta Health', 'UnitedHealthcare', 'Aetna', 'Cigna'],
  },
  respiratory: {
    id: 'doc_respiratory',
    name: 'Dr. Evelyn Zhao, MD, FCCP',
    credentials: 'Pulmonology & Critical Care • Stanford University',
    title: 'Consultant Pulmonologist',
    department: 'Pulmonology & Respiratory Medicine',
    clinicName: 'BreatheFree Pulmonary & Allergy Clinic',
    address: '730 Valley Medical Boulevard, Suite 500',
    distance: '1.5 miles away',
    rating: 4.93,
    reviewCount: 320,
    phone: '(555) 567-8902',
    nextSlot: 'Today at 2:15 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
    bio: 'Comprehensive diagnostic workup for persistent cough, asthma flare-ups, bronchitis, and acute shortness of breath.',
    telehealthAvailable: true,
    insuranceAccepted: ['BlueCross', 'Cigna', 'Medicare', 'Aetna'],
  },
  dental: {
    id: 'doc_dental',
    name: 'Dr. Sarah Jenkins, DDS, MS',
    credentials: 'MS Restorative Dentistry • Columbia University College of Dental Medicine',
    title: 'Senior Clinical Director of Dentistry',
    department: 'Oral & Maxillofacial Dentistry',
    clinicName: 'Butterfly Downtown Dental Pavilion',
    address: '742 Evergreen Terrace, Suite 200',
    distance: '0.8 miles away',
    rating: 4.95,
    reviewCount: 384,
    phone: '(555) 392-1084',
    nextSlot: 'Today at 2:30 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
    bio: 'Specialist in urgent dental pain relief, emergency cracked tooth restoration, and patient-first compassionate dental care.',
    telehealthAvailable: true,
    insuranceAccepted: ['Delta Dental', 'MetLife', 'Cigna', 'Aetna', 'CareCredit'],
  },
  ortho: {
    id: 'doc_ortho',
    name: 'Dr. David Chen, MD',
    credentials: 'Fellowship in Spine & Orthopedic Trauma • UCLA Medical Center',
    title: 'Consultant Orthopedic Surgeon',
    department: 'Orthopedics & Spine Care',
    clinicName: 'Advanced Spine & Orthopedic Institute',
    address: '320 University Avenue, Suite 450',
    distance: '1.4 miles away',
    rating: 4.91,
    reviewCount: 365,
    phone: '(555) 678-9013',
    nextSlot: 'Tomorrow at 9:00 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
    bio: 'Evaluation and non-surgical/surgical treatment for acute spinal disc herniation, severe sciatica, joint pain, and sprains.',
    telehealthAvailable: true,
    insuranceAccepted: ['BlueCross', 'Aetna', 'UnitedHealthcare', 'Medicare'],
  },
  derma: {
    id: 'doc_derma',
    name: 'Dr. Elena Rostova, MD',
    credentials: 'Board-Certified Dermatologist • NYU Langone Health',
    title: 'Specialist Dermatologist & Allergy Expert',
    department: 'Dermatology & Skin Allergy',
    clinicName: 'Prestige Dermatology & Cutaneous Medicine',
    address: '500 Central Park West, Suite 300',
    distance: '1.1 miles away',
    rating: 4.94,
    reviewCount: 290,
    phone: '(555) 789-0124',
    nextSlot: 'Today at 4:00 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813637-4467000d6e9f?w=160&auto=format&fit=crop&q=80',
    bio: 'Diagnosis and immediate comfort management for acute urticaria (hives), contact rashes, painful skin lesions, and infections.',
    telehealthAvailable: true,
    insuranceAccepted: ['BlueCross', 'Cigna', 'Aetna', 'UnitedHealthcare'],
  },
  ent: {
    id: 'doc_ent',
    name: 'Dr. Benjamin Hayes, MD, FACS',
    credentials: 'Otolaryngology Head & Neck Surgery • Johns Hopkins',
    title: 'Consultant ENT Surgeon',
    department: 'Otolaryngology (Ear, Nose & Throat)',
    clinicName: 'Metro Ear, Nose & Throat Specialty Center',
    address: '210 Medical Plaza, Suite 150',
    distance: '1.6 miles away',
    rating: 4.89,
    reviewCount: 275,
    phone: '(555) 890-1235',
    nextSlot: 'Today at 3:15 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=160&auto=format&fit=crop&q=80',
    bio: 'Expert care for severe sinus infections, acute otitis (earache), hearing disturbances, and tonsillar inflammation.',
    telehealthAvailable: true,
    insuranceAccepted: ['BlueCross', 'MetLife', 'Cigna', 'Medicare'],
  },
  general: {
    id: 'doc_general',
    name: 'Dr. Amanda Lewis, MD',
    credentials: 'Board-Certified Family Medicine • UCSF School of Medicine',
    title: 'Attending Primary Care Physician',
    department: 'Comprehensive Family Medicine & Primary Care',
    clinicName: 'Community Health & Wellness Pavilion',
    address: '100 Health Boulevard, Ground Floor',
    distance: '0.6 miles away',
    rating: 4.96,
    reviewCount: 512,
    phone: '(555) 901-2346',
    nextSlot: 'Today at 1:45 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
    bio: 'Holistic clinical assessments, routine preventive health screenings, laboratory workup interpretation, and chronic care.',
    telehealthAvailable: true,
    insuranceAccepted: ['BlueCross', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare', 'Medicaid'],
  },
};
