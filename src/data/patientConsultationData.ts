/**
 * Patient Consultation Dataset & Real-World Doctors Directory
 * Grounded in patient-friendly clinical communication and ADA dental guidance.
 */

export interface FeelingQuickOption {
  id: string;
  label: string;
  sublabel: string;
  iconName: string; // Lucide icon
  bgPastel: string;
  accentColor: string;
  defaultUtterance: string;
  defaultSymptomCategory: string;
  suggestedPainScore: number;
}

export const FEELING_TODAY_OPTIONS: FeelingQuickOption[] = [
  {
    id: 'toothache',
    label: 'Toothache',
    sublabel: 'Throbbing or sharp',
    iconName: 'Zap',
    bgPastel: '#fee2e2', // soft rose
    accentColor: '#ef4444',
    defaultUtterance: 'I have a painful toothache that keeps throbbing, especially when I drink cold water or try to chew.',
    defaultSymptomCategory: 'Toothache / Nerve Pain',
    suggestedPainScore: 7,
  },
  {
    id: 'sensitivity',
    label: 'Sensitivity',
    sublabel: 'Hot & cold jolts',
    iconName: 'Snowflake',
    bgPastel: '#e0f2fe', // icy blue
    accentColor: '#0284c7',
    defaultUtterance: 'My teeth feel sharp jolts of pain whenever I have hot tea or ice cold drinks.',
    defaultSymptomCategory: 'Hot / Cold Sensitivity',
    suggestedPainScore: 4,
  },
  {
    id: 'bleeding_gums',
    label: 'Bleeding Gums',
    sublabel: 'Red or swollen',
    iconName: 'Droplets',
    bgPastel: '#fce7f3', // soft pink
    accentColor: '#ec4899',
    defaultUtterance: 'My gums bleed whenever I brush or floss and they look puffy and reddish.',
    defaultSymptomCategory: 'Gum Inflammation / Bleeding',
    suggestedPainScore: 3,
  },
  {
    id: 'broken_tooth',
    label: 'Broken Tooth',
    sublabel: 'Chipped or cracked',
    iconName: 'ShieldAlert',
    bgPastel: '#ffedd5', // soft peach
    accentColor: '#f97316',
    defaultUtterance: 'I bit down on something hard and chipped a piece of my tooth off, the edge feels sharp to my tongue.',
    defaultSymptomCategory: 'Chipped / Cracked Tooth',
    suggestedPainScore: 6,
  },
  {
    id: 'swelling',
    label: 'Swollen Gum',
    sublabel: 'Tender lump / bump',
    iconName: 'AlertCircle',
    bgPastel: '#fef3c7', // soft amber
    accentColor: '#d97706',
    defaultUtterance: 'There is a tender swollen bump on my gum near a back tooth that feels warm and sore.',
    defaultSymptomCategory: 'Localized Swelling / Abscess',
    suggestedPainScore: 8,
  },
  {
    id: 'wisdom_tooth',
    label: 'Wisdom Tooth',
    sublabel: 'Back jaw pressure',
    iconName: 'Compass',
    bgPastel: '#ede9fe', // soft lavender
    accentColor: '#8b5cf6',
    defaultUtterance: 'My back tooth is coming through sideways and keeps getting infected, making it sore to open my jaw.',
    defaultSymptomCategory: 'Impacted Wisdom Tooth',
    suggestedPainScore: 6,
  },
  {
    id: 'jaw_pain',
    label: 'Jaw Ache',
    sublabel: 'Clicking or tension',
    iconName: 'Activity',
    bgPastel: '#f1f5f9', // soft slate
    accentColor: '#64748b',
    defaultUtterance: 'My jaw aches when I wake up in the morning and clicks or feels stiff when chewing.',
    defaultSymptomCategory: 'Jaw Joint / Clenching (TMJ)',
    suggestedPainScore: 4,
  },
  {
    id: 'routine_clean',
    label: 'Checkup & Clean',
    sublabel: 'Preventive care',
    iconName: 'Sparkles',
    bgPastel: '#ccfbf1', // soft mint teal
    accentColor: '#0d9488',
    defaultUtterance: 'I would like to book a routine dental checkup, scale and polish cleaning.',
    defaultSymptomCategory: 'Routine Preventive Care',
    suggestedPainScore: 1,
  },
];

export interface TrustBadge {
  id: string;
  label: string;
  sublabel: string;
  iconName: string;
  tooltip: string;
}

export const TRUST_CERTIFICATION_CHIPS: TrustBadge[] = [
  {
    id: 'doctor_curated',
    label: 'Curated by Board-Certified Dental Surgeons',
    sublabel: 'Verified clinical accuracy',
    iconName: 'Stethoscope',
    tooltip: 'Every triage protocol and clinical recommendation is authored and reviewed by licensed dentists and oral surgeons.',
  },
  {
    id: 'whitelisted_pharma',
    label: 'Whitelisted Pharmaceuticals Only',
    sublabel: 'FDA & CDSCO standard compliance',
    iconName: 'ShieldCheck',
    tooltip: 'We strictly recommend regulated, evidence-based OTC pharmaceutical formulations. Zero untested or unsafe supplements.',
  },
  {
    id: 'friendly_empathetic',
    label: '100% Patient-Friendly & Reassuring Language',
    sublabel: 'No terrifying medical jargon',
    iconName: 'HeartHandshake',
    tooltip: 'Complex clinical terms are translated into gentle, understandable guidance designed to ease dental anxiety.',
  },
  {
    id: 'verified_chemists',
    label: 'Trusted Chemist Dispatch (PharmEasy, 1mg, Apollo)',
    sublabel: 'Direct certified links',
    iconName: 'Pill',
    tooltip: 'Direct fulfillment links to licensed, verified online pharmacies with genuine batch verification.',
  },
  {
    id: 'safety_ladder',
    label: 'Escalate-Only Safety Ladder Guarantee',
    sublabel: 'Zero under-routing invariant',
    iconName: 'CheckCircle2',
    tooltip: 'Deterministic safety rules guarantee severe symptoms are immediately escalated, never downplayed.',
  },
];

export interface ChemistStoreLink {
  storeName: 'PharmEasy' | 'Tata 1mg' | 'Apollo Pharmacy' | 'Netmeds';
  searchUrl: string;
  badge: string;
  color: string;
}

export interface WhitelistedPharmaceutical {
  id: string;
  genericName: string;
  brandExamples: string;
  category: 'analgesic' | 'anti_inflammatory' | 'oral_rinse' | 'desensitizing' | 'topical_anesthetic' | 'saline_cleanser';
  categoryLabel: string;
  regulatoryStandard: string; // e.g. 'FDA / CDSCO Whitelisted Dental OTC'
  standardDosage: string;
  howToTake: string;
  doctorCuratedTip: string;
  safetyWarning: string;
  contraindications: string[];
  iconName: string;
  color: string;
  chemistLinks: ChemistStoreLink[];
}

export const WHITELISTED_PHARMACEUTICALS: WhitelistedPharmaceutical[] = [
  {
    id: 'paracetamol_500',
    genericName: 'Paracetamol (Acetaminophen) 500mg IP / USP',
    brandExamples: 'Crocin 500 / Dolo 650 / Tylenol Regular',
    category: 'analgesic',
    categoryLabel: 'First-Line Oral Analgesic',
    regulatoryStandard: 'FDA & CDSCO Whitelisted OTC Analgesic',
    standardDosage: '500mg to 650mg every 6 to 8 hours as needed (Max 3000mg/24h)',
    howToTake: 'Swallow with water after food. Safe for patients with sensitive stomach, ulcers, or taking blood thinners.',
    doctorCuratedTip: 'Excellent baseline pain control that calms dental throbbing without irritating the stomach lining.',
    safetyWarning: 'Do not exceed 3000mg total in 24 hours. Avoid alcohol while taking. Check other medications for acetaminophen to prevent accidental duplication.',
    contraindications: ['Severe liver disease', 'Chronic alcoholism', 'Known paracetamol allergy'],
    iconName: 'Pill',
    color: '#0d9488',
    chemistLinks: [
      {
        storeName: 'PharmEasy',
        searchUrl: 'https://pharmeasy.in/search/all?name=paracetamol+500mg',
        badge: 'Genuine Chemist Stock • Express Delivery',
        color: '#10847e',
      },
      {
        storeName: 'Tata 1mg',
        searchUrl: 'https://www.1mg.com/search/all?name=paracetamol+500mg',
        badge: 'Verified Batch • 15% Off',
        color: '#ff6f61',
      },
      {
        storeName: 'Apollo Pharmacy',
        searchUrl: 'https://www.apollopharmacy.in/search-medicines/paracetamol%20500',
        badge: '2-Hour Delivery Near You',
        color: '#005b82',
      },
    ],
  },
  {
    id: 'ibuprofen_400',
    genericName: 'Ibuprofen 400mg IP / USP (NSAID)',
    brandExamples: 'Brufen 400 / Advil / Motrin',
    category: 'anti_inflammatory',
    categoryLabel: 'Targeted Anti-Inflammatory (Pulp & Bone)',
    regulatoryStandard: 'FDA & CDSCO Whitelisted OTC NSAID',
    standardDosage: '400mg every 6 to 8 hours with food (Max 1200mg/24h OTC)',
    howToTake: 'Always take with a full glass of water or with meals/milk to protect stomach lining.',
    doctorCuratedTip: 'The clinical gold standard for dental nerve (pulpitis) and ligament pain because it blocks prostaglandins directly in bone and gum tissues.',
    safetyWarning: 'NEVER place an Ibuprofen or Aspirin tablet directly against your gum! It will cause a painful chemical acid burn.',
    contraindications: ['Active stomach ulcers / gastritis', 'Severe kidney disease', 'Third trimester pregnancy', 'Aspirin-exacerbated respiratory disease (AERD)'],
    iconName: 'ShieldAlert',
    color: '#2563eb',
    chemistLinks: [
      {
        storeName: 'PharmEasy',
        searchUrl: 'https://pharmeasy.in/search/all?name=ibuprofen+400mg',
        badge: 'Trusted Medical Store',
        color: '#10847e',
      },
      {
        storeName: 'Tata 1mg',
        searchUrl: 'https://www.1mg.com/search/all?name=ibuprofen+400mg',
        badge: 'Doctor Prescription Checked',
        color: '#ff6f61',
      },
      {
        storeName: 'Apollo Pharmacy',
        searchUrl: 'https://www.apollopharmacy.in/search-medicines/ibuprofen%20400',
        badge: 'Available at local store',
        color: '#005b82',
      },
    ],
  },
  {
    id: 'chlorhexidine_rinse',
    genericName: 'Chlorhexidine Gluconate 0.2% w/v Oral Rinse',
    brandExamples: 'Clohex / Hexidine / Peridex / Corsodyl',
    category: 'oral_rinse',
    categoryLabel: 'Hospital-Grade Antiseptic Mouthwash',
    regulatoryStandard: 'ADA Seal of Acceptance & CDSCO Dental Whitelist',
    standardDosage: '10ml undiluted, swish gently for 60 seconds twice daily after brushing, then spit out',
    howToTake: 'Do not rinse with water or eat/drink for 30 minutes following use. Use for 7-14 days maximum.',
    doctorCuratedTip: 'Possesses unique "substantivity" — it bonds to enamel and oral mucosa, continuously releasing antimicrobial defense for up to 12 hours.',
    safetyWarning: 'Temporary, harmless superficial tooth staining can occur with prolonged use past 14 days, easily polished away by your hygienist.',
    contraindications: ['Known chlorhexidine hypersensitivity', 'Children under 6 years of age'],
    iconName: 'Droplets',
    color: '#0891b2',
    chemistLinks: [
      {
        storeName: 'PharmEasy',
        searchUrl: 'https://pharmeasy.in/search/all?name=chlorhexidine+mouthwash',
        badge: 'Genuine Dental Wash • Dispatched Fast',
        color: '#10847e',
      },
      {
        storeName: 'Tata 1mg',
        searchUrl: 'https://www.1mg.com/search/all?name=chlorhexidine+mouthwash',
        badge: 'Doctor Recommended Formulation',
        color: '#ff6f61',
      },
      {
        storeName: 'Apollo Pharmacy',
        searchUrl: 'https://www.apollopharmacy.in/search-medicines/chlorhexidine%20mouthwash',
        badge: 'In Stock for Same-Day Delivery',
        color: '#005b82',
      },
    ],
  },
  {
    id: 'potassium_nitrate_paste',
    genericName: 'Potassium Nitrate 5% & Sodium Fluoride 0.24% Paste',
    brandExamples: 'Sensodyne Rapid Relief / Colgate Sensitive Pro-Relief / RA Thermoseal',
    category: 'desensitizing',
    categoryLabel: 'Nerve Desensitizer & Tubule Occluder',
    regulatoryStandard: 'FDA Monograph & CDSCO Accepted Whitelist',
    standardDosage: 'Brush twice daily using soft-bristled brush. Can dab pea-sized amount directly on sensitive root area.',
    howToTake: 'Gently massage onto sensitive tooth cervical margin with clean fingertip for 1 minute before sleeping.',
    doctorCuratedTip: 'Potassium ions penetrate dentinal tubules and depolarize the sensory nerve endings, calming cold/hot jolt signals within 60 seconds.',
    safetyWarning: 'If sensitivity persists over 4 weeks despite desensitizing paste, consult your dentist to rule out cracked tooth or irreversible pulpitis.',
    contraindications: ['None known when used as directed'],
    iconName: 'Snowflake',
    color: '#0284c7',
    chemistLinks: [
      {
        storeName: 'PharmEasy',
        searchUrl: 'https://pharmeasy.in/search/all?name=sensodyne+rapid+relief',
        badge: '100% Genuine Dental Care',
        color: '#10847e',
      },
      {
        storeName: 'Tata 1mg',
        searchUrl: 'https://www.1mg.com/search/all?name=sensodyne+toothpaste',
        badge: 'Certified Dental Care Store',
        color: '#ff6f61',
      },
      {
        storeName: 'Apollo Pharmacy',
        searchUrl: 'https://www.apollopharmacy.in/search-medicines/sensodyne',
        badge: 'Verified Health Store',
        color: '#005b82',
      },
    ],
  },
  {
    id: 'pure_eugenol_clove',
    genericName: 'Dental Grade Clove Oil (Eugenol 85% BP / IP)',
    brandExamples: 'Pyx Clove Oil / Stoline Dental Drops / Dentobac',
    category: 'topical_anesthetic',
    categoryLabel: 'Targeted Botanical Neuro-Sedative',
    regulatoryStandard: 'United States Pharmacopeia (USP) & IP Dental Standard',
    standardDosage: '1 to 2 drops onto sterile cotton pellet; gently apply onto tooth cavity for 3 to 5 minutes',
    howToTake: 'Dilute with a drop of edible vegetable oil if burning. Do not rub over wide areas of soft bleeding gums.',
    doctorCuratedTip: 'Eugenol acts as a reversible sodium channel blocker, providing rapid temporary numbing for open tooth cavities.',
    safetyWarning: 'Do not swallow large quantities. Not suitable for infants or young children under 2.',
    contraindications: ['Known eugenol or balsam allergy', 'Open mucosal ulceration'],
    iconName: 'Sparkles',
    color: '#d97706',
    chemistLinks: [
      {
        storeName: 'PharmEasy',
        searchUrl: 'https://pharmeasy.in/search/all?name=clove+oil+dental',
        badge: 'Pure Dental Formula',
        color: '#10847e',
      },
      {
        storeName: 'Tata 1mg',
        searchUrl: 'https://www.1mg.com/search/all?name=clove+oil+dental',
        badge: 'Lab-Tested Purity',
        color: '#ff6f61',
      },
      {
        storeName: 'Apollo Pharmacy',
        searchUrl: 'https://www.apollopharmacy.in/search-medicines/clove%20oil',
        badge: 'Dispatched from licensed pharmacy',
        color: '#005b82',
      },
    ],
  },
  {
    id: 'benzocaine_gel',
    genericName: 'Benzocaine 20% Oral Anesthetic Mucosal Gel',
    brandExamples: 'Orajel Maximum Strength / Anbesol / Dentogel',
    category: 'topical_anesthetic',
    categoryLabel: 'Fast-Acting Mucosal Surface Numbing Gel',
    regulatoryStandard: 'FDA Approved Whitelisted Oral Mucosal Anesthetic',
    standardDosage: 'Apply a pea-sized dab to affected gum margin or aphthous ulcer up to 4 times daily',
    howToTake: 'Dry the gum slightly with a tissue, dab gel gently with clean fingertip or cotton swab. Numbing occurs in ~30 seconds.',
    doctorCuratedTip: 'Ideal for painful gum rub from dentures, orthodontic wire irritation, or small painful canker ulcers.',
    safetyWarning: 'Do not use for teething infants or children under 2 years (risk of methemoglobinemia).',
    contraindications: ['Methemoglobinemia history', 'Allergy to ester-type local anesthetics', 'Children under 2'],
    iconName: 'Zap',
    color: '#7c3aed',
    chemistLinks: [
      {
        storeName: 'PharmEasy',
        searchUrl: 'https://pharmeasy.in/search/all?name=benzocaine+gel',
        badge: 'Verified Chemist Stock',
        color: '#10847e',
      },
      {
        storeName: 'Tata 1mg',
        searchUrl: 'https://www.1mg.com/search/all?name=dentogel+orabase',
        badge: '100% Genuine Pharmacy',
        color: '#ff6f61',
      },
      {
        storeName: 'Apollo Pharmacy',
        searchUrl: 'https://www.apollopharmacy.in/search-medicines/dentogel',
        badge: 'Direct chemist pickup or delivery',
        color: '#005b82',
      },
    ],
  },
];

export interface VisualOption {
  id: string;
  label: string;
  description?: string;
  iconName: string;
}

export const SYMPTOM_NATURE_OPTIONS: VisualOption[] = [
  { id: 'constant_ache', label: 'Constant dull throbbing ache', iconName: 'Pulse' },
  { id: 'lingering_cold_hot', label: 'Lingering pain after hot or ice cold', iconName: 'Snowflake' },
  { id: 'chewing_pain', label: 'Sharp shooting shock when biting down', iconName: 'Utensils' },
  { id: 'night_throbbing', label: 'Pain worsens when lying down to sleep', iconName: 'Moon' },
  { id: 'tender_puffy', label: 'Tender gums that bleed easily', iconName: 'Droplet' },
  { id: 'loose_tooth', label: 'Tooth feels slightly loose or mobile', iconName: 'Move' },
  { id: 'bad_taste', label: 'Unpleasant foul taste or bad breath', iconName: 'Smile' },
];

export const HABIT_OPTIONS: VisualOption[] = [
  { id: 'brush_2x', label: 'Brush twice daily with fluoridated paste', iconName: 'CheckCircle2' },
  { id: 'rarely_floss', label: 'Rarely or occasionally floss between teeth', iconName: 'HelpCircle' },
  { id: 'grind_teeth', label: 'Grind or clench teeth during sleep (Bruxism)', iconName: 'MoonStar' },
  { id: 'soda_coffee', label: 'Drink coffee, tea, or soda daily', iconName: 'Coffee' },
  { id: 'smoke_vape', label: 'Smoke tobacco or use e-cigarettes / vape', iconName: 'Cigarette' },
  { id: 'high_stress', label: 'Experiencing high work or life stress', iconName: 'Brain' },
];

export const ALLERGY_HISTORY_OPTIONS: VisualOption[] = [
  { id: 'penicillin', label: 'Allergic to Penicillin / Amoxicillin', iconName: 'ShieldAlert' },
  { id: 'latex', label: 'Allergic to Latex gloves / rubber dam', iconName: 'Hand' },
  { id: 'aspirin_nsaid', label: 'Stomach ulcer / Sensitive to Aspirin or NSAIDs', iconName: 'Pill' },
  { id: 'hypertension', label: 'High blood pressure / Cardiac medication', iconName: 'HeartPulse' },
  { id: 'diabetes', label: 'Diabetes or elevated blood sugar', iconName: 'Activity' },
  { id: 'pregnant', label: 'Currently pregnant or nursing', iconName: 'Baby' },
  { id: 'prior_root_canal', label: 'Had a previous filling or root canal here', iconName: 'FileText' },
  { id: 'healthy_no_allergies', label: 'No known drug allergies (NKDA) & Healthy', iconName: 'ShieldCheck' },
];

export const VISUAL_APPEARANCE_OPTIONS: VisualOption[] = [
  { id: 'red_puffy_gum', label: 'Gum around tooth looks red and puffy', iconName: 'Eye' },
  { id: 'dark_cavity', label: 'Visible dark brown or black spot / hole', iconName: 'CircleDot' },
  { id: 'white_pimple', label: 'Small white pimple or blister on gum (boil)', iconName: 'Target' },
  { id: 'broken_edge', label: 'Jagged broken enamel edge or lost filling', iconName: 'Scissors' },
  { id: 'cheek_swelling', label: 'Swelling visible on outside of cheek or jaw', iconName: 'AlertOctagon' },
  { id: 'looks_normal', label: 'Looks normal outside, pain is deep inside', iconName: 'Search' },
];

export interface RealWorldDoctor {
  id: string;
  name: string;
  credentials: string;
  title: string;
  specialtyType: 'general_dentist' | 'endodontist' | 'periodontist' | 'oral_surgeon' | 'orthodontist';
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

export const REAL_WORLD_DOCTORS: RealWorldDoctor[] = [
  {
    id: 'dr_jenkins',
    name: 'Dr. Sarah Jenkins, DDS',
    credentials: 'DDS, Univ. of Michigan • 14 Yrs Exp',
    title: 'Family & Restorative Dental Physician',
    specialtyType: 'general_dentist',
    clinicName: 'Butterfly Family Dental Care',
    address: '1420 Butterfly Medical Way, Suite 204',
    distance: '0.8 miles away',
    rating: 4.9,
    reviewCount: 348,
    phone: '(555) 234-8901',
    nextSlot: 'Today at 2:30 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
    bio: 'Specializing in gentle, anxiety-free dental exams, cavity restorations, cracked tooth repair, and patient comfort.',
    telehealthAvailable: true,
    insuranceAccepted: ['Delta Dental', 'MetLife', 'Cigna', 'Aetna', 'Guardian'],
  },
  {
    id: 'dr_vance',
    name: 'Dr. Michael Vance, DDS, MS',
    credentials: 'Board Certified Endodontist • Harvard Dental',
    title: 'Microscopic Endodontics & Root Specialist',
    specialtyType: 'endodontist',
    clinicName: 'Butterfly Advanced Endodontic Institute',
    address: '1420 Butterfly Medical Way, Suite 410',
    distance: '0.8 miles away',
    rating: 5.0,
    reviewCount: 224,
    phone: '(555) 234-8902',
    nextSlot: 'Tomorrow at 9:15 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
    bio: 'Dedicated to saving natural teeth using 3D microscopic visualization. Relieves severe tooth nerve pain swiftly and gently.',
    telehealthAvailable: true,
    insuranceAccepted: ['Delta Dental', 'MetLife', 'Cigna', 'UnitedHealthcare'],
  },
  {
    id: 'dr_rostova',
    name: 'Dr. Elena Rostova, DMD, MS',
    credentials: 'Diplomate, American Board of Periodontology',
    title: 'Periodontist & Regenerative Gum Specialist',
    specialtyType: 'periodontist',
    clinicName: 'Metro Gum Health & Dental Implant Center',
    address: '780 Health Parkway, 3rd Floor',
    distance: '2.1 miles away',
    rating: 4.9,
    reviewCount: 192,
    phone: '(555) 345-6789',
    nextSlot: 'Thursday at 10:30 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813587-0b190f848529?w=160&auto=format&fit=crop&q=80',
    bio: 'Expert in treating bleeding gums, deep periodontal pockets, gum recession, and restoring supportive jawbone health.',
    telehealthAvailable: false,
    insuranceAccepted: ['Delta Dental', 'MetLife', 'Guardian', 'Blue Cross Dental'],
  },
  {
    id: 'dr_chen',
    name: 'Dr. David K. Chen, DDS, MD',
    credentials: 'Dual Degree Oral & Maxillofacial Surgeon • Columbia P&S',
    title: 'Oral & Maxillofacial Surgeon',
    specialtyType: 'oral_surgeon',
    clinicName: 'Butterfly Surgical & Wisdom Tooth Center',
    address: '1420 Butterfly Medical Way, Surgical Wing A',
    distance: '0.8 miles away',
    rating: 4.8,
    reviewCount: 418,
    phone: '(555) 234-8905',
    nextSlot: 'Friday at 11:00 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=160&auto=format&fit=crop&q=80',
    bio: 'Specialist in minimally invasive wisdom teeth extractions, complex surgical roots, IV sedation, and facial trauma repair.',
    telehealthAvailable: true,
    insuranceAccepted: ['Delta Dental', 'Cigna', 'Aetna', 'Medicare / Major Medical'],
  },
  {
    id: 'dr_martinez',
    name: 'Dr. Olivia Martinez, DDS, MS',
    credentials: 'MS Orthodontics • UCLA School of Dentistry',
    title: 'Specialist Orthodontist & Dentofacial Orthopedist',
    specialtyType: 'orthodontist',
    clinicName: 'SmileCraft Orthodontics & Clear Aligners',
    address: '910 Maple Boulevard, Suite 100',
    distance: '1.9 miles away',
    rating: 4.9,
    reviewCount: 286,
    phone: '(555) 456-7890',
    nextSlot: 'Wednesday at 3:15 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
    bio: 'Comprehensive bite alignment, crowded teeth correction, and jaw developmental guidance for adolescents and adults.',
    telehealthAvailable: true,
    insuranceAccepted: ['Delta Dental', 'MetLife', 'Cigna', 'Aetna', 'CareCredit'],
  },
];

export interface HomeRemedy {
  id: string;
  title: string;
  tag: string;
  iconName: string;
  color: string;
  howToUse: string;
  whyItHelps: string;
  contraindications?: string;
  severityLevel: 'mild' | 'moderate' | 'all';
}

export const SAFE_HOME_REMEDIES: HomeRemedy[] = [
  {
    id: 'saltwater_rinse',
    title: 'Warm Saltwater Mouth Bath',
    tag: 'Natural Cleanser & Osmotic Reliever',
    iconName: 'Droplet',
    color: '#0284c7',
    howToUse: 'Dissolve 1/2 level teaspoon of salt in 8 oz (a standard glass) of comfortably warm water. Gently hold and swish around the painful tooth for 30 seconds, then spit it out. Repeat 3 to 4 times daily, especially after eating.',
    whyItHelps: 'Salt creates a gentle osmotic gradient that pulls excess fluid out of swollen tissues, soothing gum inflammation and flushing away microscopic food debris and acid-producing bacteria.',
    severityLevel: 'all',
  },
  {
    id: 'cold_compress',
    title: 'External Cold Ice Compress',
    tag: 'Anti-Swelling & Nerve Numbing',
    iconName: 'Snowflake',
    color: '#0891b2',
    howToUse: 'Wrap an ice pack or bag of frozen vegetables in a soft clean tea towel. Hold it gently against the outside of your cheek next to the sore area for 15 minutes, then remove it for 15 minutes. Never apply ice directly onto bare skin or inside your mouth.',
    whyItHelps: 'The cold temperature constricts local capillaries (vasoconstriction), substantially slowing blood leakage into tissue spaces and numbing hypersensitive nerve signals.',
    severityLevel: 'moderate',
  },
  {
    id: 'clove_oil',
    title: 'Natural Clove Oil (Eugenol)',
    tag: 'Targeted Tooth Anesthetic',
    iconName: 'Sparkles',
    color: '#d97706',
    howToUse: 'Dip a clean cotton swab in 1-2 drops of pure dental clove oil (mix with a drop of cooking olive oil if strong). Lightly dab directly onto the surface of the aching tooth for 3-5 minutes. Avoid rubbing it across open gums or swallowing.',
    whyItHelps: 'Clove oil naturally contains eugenol, an active botanical compound that dentists have used for over 150 years for its direct neuro-anesthetic and antimicrobial action.',
    contraindications: 'Do not use excessively on bare bleeding gum tissue as pure eugenol can cause mild surface stinging.',
    severityLevel: 'moderate',
  },
  {
    id: 'head_elevation',
    title: 'Sleep With Head Elevated',
    tag: 'Night-Time Throbbing Prevention',
    iconName: 'Moon',
    color: '#6366f1',
    howToUse: 'When resting on a couch or going to sleep, prop your head and upper chest up with 2 or 3 pillows so your head stays elevated roughly 30° to 45° above your heart level.',
    whyItHelps: 'Lying flat causes cranial blood pressure to rise in your jaw and head, magnifying that agonizing rhythmic throbbing sensation inside an inflamed tooth nerve.',
    severityLevel: 'all',
  },
  {
    id: 'otc_pain_protocol',
    title: 'Safe Over-The-Counter Pain Relief',
    tag: 'Oral Analgesic Guidelines',
    iconName: 'Pill',
    color: '#16a34a',
    howToUse: 'Follow package dosage instructions for Ibuprofen (Advil/Motrin 200-400mg) or Paracetamol/Acetaminophen (500mg). If you take prescription blood thinners or have stomach ulcers, choose Paracetamol.',
    whyItHelps: 'Inhibits prostaglandin synthesis to bring down inflammatory pain until your dentist can complete targeted treatment.',
    contraindications: 'CRITICAL SAFETY WARNING: NEVER place an aspirin tablet directly on your tooth or gum! Aspirin is acetylsalicylic acid and will cause a severe chemical acid burn.',
    severityLevel: 'all',
  },
  {
    id: 'soft_diet',
    title: 'Soft Lukewarm Food & Chewing Protection',
    tag: 'Mechanical Tissue Rest',
    iconName: 'Utensils',
    color: '#0d9488',
    howToUse: 'Stick to soft foods like yogurt, lukewarm broth, scrambled eggs, mashed sweet potatoes, and oatmeal. Strictly chew on the opposite side of your mouth. Avoid ice drinks, hot coffee, hard nuts, crusty bread, and seeds.',
    whyItHelps: 'Prevents mechanical bite trauma to cracked enamel and spares tender pulp nerves from extreme temperature shocks.',
    severityLevel: 'all',
  },
];
