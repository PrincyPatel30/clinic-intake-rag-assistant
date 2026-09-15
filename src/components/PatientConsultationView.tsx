import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Slider from '@mui/material/Slider';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HealingIcon from '@mui/icons-material/Healing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

// Lucide Icons
import {
  Zap,
  Snowflake,
  Droplets,
  ShieldAlert,
  AlertCircle,
  Compass,
  Activity,
  Sparkles,
  Utensils,
  Moon,
  Droplet,
  Move,
  Smile,
  CheckCircle2,
  HelpCircle,
  MoonStar,
  Coffee,
  Cigarette,
  Brain,
  Hand,
  Pill,
  HeartPulse,
  Baby,
  FileText,
  ShieldCheck,
  Eye,
  CircleDot,
  Target,
  Scissors,
  AlertOctagon,
  Search,
  Stethoscope,
  HeartHandshake,
  Store,
  Check,
} from 'lucide-react';

import {
  FEELING_TODAY_OPTIONS,
  SYMPTOM_NATURE_OPTIONS,
  HABIT_OPTIONS,
  ALLERGY_HISTORY_OPTIONS,
  VISUAL_APPEARANCE_OPTIONS,
  REAL_WORLD_DOCTORS,
  SAFE_HOME_REMEDIES,
  TRUST_CERTIFICATION_CHIPS,
  WHITELISTED_PHARMACEUTICALS,
  FeelingQuickOption,
  RealWorldDoctor,
  WhitelistedPharmaceutical,
} from '../data/patientConsultationData';
import { routePatientUtterance, RoutingDecision } from '../lib/careRouter';
import { AppointmentBookingModal } from './AppointmentBookingModal';
import { DoctorChatbotFloating } from './DoctorChatbotFloating';
import { PatientCareHubChatbot } from './PatientCareHubChatbot';

interface PatientConsultationViewProps {
  onSelectReferralView: () => void;
  onUpdateDecision: (decision: RoutingDecision, utterance: string) => void;
}

export const PatientConsultationView: React.FC<PatientConsultationViewProps> = ({
  onSelectReferralView,
  onUpdateDecision,
}) => {
  // Navigation view mode: Chatbot (default) vs Form
  const [activeInterface, setActiveInterface] = useState<'chatbot' | 'form'>('chatbot');

  // Primary selection states
  const [selectedFeeling, setSelectedFeeling] = useState<string>('wisdom_tooth');
  const [selectedSymptomPills, setSelectedSymptomPills] = useState<string[]>([
    'constant_ache',
    'night_throbbing',
  ]);
  const [painLevel, setPainLevel] = useState<number>(6);
  const [selectedLocation, setSelectedLocation] = useState<string>('lower_right');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(['brush_2x', 'grind_teeth']);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['penicillin']);
  const [selectedAppearance, setSelectedAppearance] = useState<string>('red_puffy_gum');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  // Filter for Whitelisted Pharmaceuticals
  const [pharmaFilter, setPharmaFilter] = useState<string>('all');

  // Routing and Outcome
  const [activeDecision, setActiveDecision] = useState<RoutingDecision>(() =>
    routePatientUtterance('my back tooth is coming through sideways and keeps getting infected')
  );

  // Booking Modal
  const [bookingDoctor, setBookingDoctor] = useState<RealWorldDoctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // Ref to scroll to pharmacy section
  const pharmacySectionRef = useRef<HTMLDivElement>(null);

  // State to notify floating chatbot
  const [currentSymptomSummary, setCurrentSymptomSummary] = useState<string>('');

  const onUpdateDecisionRef = useRef(onUpdateDecision);
  useEffect(() => {
    onUpdateDecisionRef.current = onUpdateDecision;
  }, [onUpdateDecision]);

  const lastProcessedQueryRef = useRef<string>('');

  const pillsKey = selectedSymptomPills.join(',');
  const habitsKey = selectedHabits.join(',');
  const allergiesKey = selectedAllergies.join(',');

  // Re-run clinical care routing when patient selections change
  useEffect(() => {
    const feelingObj = FEELING_TODAY_OPTIONS.find((f) => f.id === selectedFeeling);
    const natureLabels = SYMPTOM_NATURE_OPTIONS.filter((o) => selectedSymptomPills.includes(o.id)).map((o) => o.label);
    const habitLabels = HABIT_OPTIONS.filter((o) => selectedHabits.includes(o.id)).map((o) => o.label);
    const allergyLabels = ALLERGY_HISTORY_OPTIONS.filter((o) => selectedAllergies.includes(o.id)).map((o) => o.label);

    let queryText = feelingObj?.defaultUtterance || 'Dental pain';
    if (natureLabels.length > 0) {
      queryText += `. Sensations: ${natureLabels.join(', ')}.`;
    }
    if (selectedLocation) {
      queryText += ` Location: ${selectedLocation.replace('_', ' ')}.`;
    }
    if (painLevel >= 7) {
      queryText += ` Severe pain rated ${painLevel}/10.`;
    }
    if (allergyLabels.length > 0 && !allergyLabels.includes('healthy_no_allergies')) {
      queryText += ` Allergies & History: ${allergyLabels.join(', ')}.`;
    }

    if (lastProcessedQueryRef.current !== queryText) {
      lastProcessedQueryRef.current = queryText;
      const decision = routePatientUtterance(queryText);
      setActiveDecision(decision);
      setCurrentSymptomSummary(queryText);
      onUpdateDecisionRef.current?.(decision, queryText);
    }
  }, [
    selectedFeeling,
    pillsKey,
    painLevel,
    selectedLocation,
    habitsKey,
    allergiesKey,
    selectedAppearance,
  ]);

  const handleFeelingSelect = (feeling: FeelingQuickOption) => {
    setSelectedFeeling(feeling.id);
    setPainLevel(feeling.suggestedPainScore);

    // Map feeling to sensible default sensations
    if (feeling.id === 'toothache') {
      setSelectedSymptomPills(['constant_ache', 'chewing_pain']);
    } else if (feeling.id === 'sensitivity') {
      setSelectedSymptomPills(['lingering_cold_hot']);
    } else if (feeling.id === 'bleeding_gums') {
      setSelectedSymptomPills(['tender_puffy']);
      setSelectedAppearance('red_puffy_gum');
    } else if (feeling.id === 'broken_tooth') {
      setSelectedSymptomPills(['chewing_pain']);
      setSelectedAppearance('broken_edge');
    } else if (feeling.id === 'swelling') {
      setSelectedSymptomPills(['constant_ache', 'tender_puffy']);
      setSelectedAppearance('white_pimple');
    } else if (feeling.id === 'wisdom_tooth') {
      setSelectedSymptomPills(['constant_ache', 'night_throbbing']);
      setSelectedLocation('lower_right');
    } else if (feeling.id === 'jaw_pain') {
      setSelectedSymptomPills(['constant_ache']);
      setSelectedHabits((prev) => Array.from(new Set([...prev, 'grind_teeth'])));
    }
  };

  const handleTogglePill = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    id: string
  ) => {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
    }
  };

  const renderIcon = (iconName: string, size = 18, color = 'inherit') => {
    const props = { size, color };
    switch (iconName) {
      case 'Zap': return <Zap {...props} />;
      case 'Snowflake': return <Snowflake {...props} />;
      case 'Droplets': return <Droplets {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'AlertCircle': return <AlertCircle {...props} />;
      case 'Compass': return <Compass {...props} />;
      case 'Activity': return <Activity {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'Moon': return <Moon {...props} />;
      case 'Droplet': return <Droplet {...props} />;
      case 'Move': return <Move {...props} />;
      case 'Smile': return <Smile {...props} />;
      case 'CheckCircle2': return <CheckCircle2 {...props} />;
      case 'HelpCircle': return <HelpCircle {...props} />;
      case 'MoonStar': return <MoonStar {...props} />;
      case 'Coffee': return <Coffee {...props} />;
      case 'Cigarette': return <Cigarette {...props} />;
      case 'Brain': return <Brain {...props} />;
      case 'Hand': return <Hand {...props} />;
      case 'Pill': return <Pill {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      case 'Baby': return <Baby {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Eye': return <Eye {...props} />;
      case 'CircleDot': return <CircleDot {...props} />;
      case 'Target': return <Target {...props} />;
      case 'Scissors': return <Scissors {...props} />;
      case 'AlertOctagon': return <AlertOctagon {...props} />;
      case 'Stethoscope': return <Stethoscope {...props} />;
      case 'HeartHandshake': return <HeartHandshake {...props} />;
      case 'Store': return <Store {...props} />;
      default: return <Search {...props} />;
    }
  };

  // Matched Doctor based on active decision specialty
  const matchedDoctor =
    REAL_WORLD_DOCTORS.find((d) => d.specialtyType === activeDecision.specialty) ||
    REAL_WORLD_DOCTORS[0];

  const otherDoctors = REAL_WORLD_DOCTORS.filter((d) => d.id !== matchedDoctor.id);

  // Filtered pharmaceuticals
  const filteredPharmaceuticals = WHITELISTED_PHARMACEUTICALS.filter((item) => {
    if (pharmaFilter === 'all') return true;
    return item.category === pharmaFilter;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      
      {/* 1. DOCTOR TRUST & CERTIFICATION BADGES (STANDARDIZED HEADER CHIPS) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3.5,
          bgcolor: '#f0fdfa',
          border: '1.5px solid #ccfbf1',
          boxShadow: '0 2px 10px rgba(13, 148, 136, 0.06)',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#0f766e', color: 'white', width: 36, height: 36, fontWeight: 900 }}>
              🩺
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 1 }}>
                Certified Clinical Care Navigation
                <Chip
                  label="100% Doctor Curated"
                  size="small"
                  sx={{ bgcolor: '#0d9488', color: 'white', fontWeight: 800, height: 20, fontSize: '0.675rem' }}
                />
              </Typography>
              <Typography variant="caption" sx={{ color: '#134e4a' }}>
                All guidance is verified by licensed Dental Surgeons • Whitelisted Pharmaceuticals • Zero Untested Formulas
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
            onClick={() => pharmacySectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            sx={{ bgcolor: '#0f766e', fontWeight: 700, borderRadius: 999, textTransform: 'none', px: 2 }}
          >
            Order Whitelisted Medicines (PharmEasy / 1mg)
          </Button>
        </Box>

        {/* Dynamic Trust Certification Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {TRUST_CERTIFICATION_CHIPS.map((chip) => (
            <React.Fragment key={chip.id}>
            <Tooltip title={chip.tooltip} arrow>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 999,
                  bgcolor: '#ffffff',
                  border: '1px solid #99f6e4',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  cursor: 'help',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#ccfbf1',
                    borderColor: '#0d9488',
                  },
                }}
              >
                {renderIcon(chip.iconName, 15, '#0d9488')}
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f766e', fontSize: '0.75rem' }}>
                  {chip.label}
                </Typography>
              </Box>
            </Tooltip>
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      {/* Interface Mode Switcher: Conversational Clinical Chatbot (Default) vs Detailed Form */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 0.6,
            borderRadius: 999,
            bgcolor: '#f1f5f9',
            border: '1.5px solid #e2e8f0',
            display: 'inline-flex',
            gap: 1,
          }}
        >
          <Button
            variant={activeInterface === 'chatbot' ? 'contained' : 'text'}
            onClick={() => setActiveInterface('chatbot')}
            sx={{
              borderRadius: 999,
              px: { xs: 2, sm: 3 },
              py: 0.8,
              fontWeight: 800,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              textTransform: 'none',
              bgcolor: activeInterface === 'chatbot' ? '#0f766e' : 'transparent',
              color: activeInterface === 'chatbot' ? '#ffffff' : '#64748b',
              boxShadow: activeInterface === 'chatbot' ? '0 4px 12px rgba(15, 118, 110, 0.25)' : 'none',
              '&:hover': {
                bgcolor: activeInterface === 'chatbot' ? '#0d9488' : '#e2e8f0',
              },
            }}
          >
            💬 Interactive Clinical Chatbot (All Symptoms)
          </Button>
          <Button
            variant={activeInterface === 'form' ? 'contained' : 'text'}
            onClick={() => setActiveInterface('form')}
            sx={{
              borderRadius: 999,
              px: { xs: 2, sm: 3 },
              py: 0.8,
              fontWeight: 800,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              textTransform: 'none',
              bgcolor: activeInterface === 'form' ? '#0f766e' : 'transparent',
              color: activeInterface === 'form' ? '#ffffff' : '#64748b',
              boxShadow: activeInterface === 'form' ? '0 4px 12px rgba(15, 118, 110, 0.25)' : 'none',
              '&:hover': {
                bgcolor: activeInterface === 'form' ? '#0d9488' : '#e2e8f0',
              },
            }}
          >
            📋 Dental Body Map & Detailed Form
          </Button>
        </Paper>
      </Box>

      {/* CHATBOT MODE (DEFAULT) */}
      {activeInterface === 'chatbot' ? (
        <PatientCareHubChatbot
          onSelectReferralView={onSelectReferralView}
          onUpdateDecision={onUpdateDecision}
        />
      ) : (
        <>
      {/* 2. "WHAT ARE YOU FEELING TODAY?" VISUAL ICON CARDS */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3.5,
          bgcolor: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={16} color="#0d9488" />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1.2 }}>
              Patient Care Hub • Step 1
            </Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            What are you feeling today?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Tap the visual icon that best matches your discomfort to begin your gentle guided consultation.
          </Typography>
        </Box>

        {/* Carousel / Grid of Circular Icon Buttons */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(4, 1fr)',
              md: 'repeat(8, 1fr)',
            },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {FEELING_TODAY_OPTIONS.map((item) => {
            const isSelected = selectedFeeling === item.id;
            return (
              <Box
                key={item.id}
                onClick={() => handleFeelingSelect(item)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  bgcolor: isSelected ? `${item.bgPastel}` : '#f8fafc',
                  border: '2px solid',
                  borderColor: isSelected ? item.accentColor : 'transparent',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: item.bgPastel,
                    transform: 'scale(1.04)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 48, sm: 54 },
                    height: { xs: 48, sm: 54 },
                    borderRadius: '50%',
                    bgcolor: isSelected ? item.accentColor + '22' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 0 3px ${item.accentColor}33` : 'none',
                  }}
                >
                  {renderIcon(item.iconName, 26, item.accentColor)}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? item.accentColor : '#1e293b',
                    fontSize: { xs: '0.75rem', sm: '0.825rem' },
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    textAlign: 'center',
                    mt: 0.3,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {item.sublabel}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* 3. CLINICAL INTAKE QUESTIONNAIRE (EXPANDED BALANCED 2-COLUMN LAYOUT) */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN: Symptom Sensation, Pain Slider, Mouth Location, Habits */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={2.5}>
            {/* Category 1: Pain Sensation & Character */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                1. How does it feel? (Symptom Nature)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                Select all sensations that describe your discomfort:
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SYMPTOM_NATURE_OPTIONS.map((opt) => {
                  const active = selectedSymptomPills.includes(opt.id);
                  return (
                    <Box
                      key={opt.id}
                      onClick={() => handleTogglePill(selectedSymptomPills, setSelectedSymptomPills, opt.id)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.75,
                        py: 0.9,
                        borderRadius: 999,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: '1.5px solid',
                        borderColor: active ? '#0d9488' : '#e2e8f0',
                        bgcolor: active ? '#f0fdfa' : '#ffffff',
                        color: active ? '#0f766e' : '#334155',
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.825rem',
                        '&:hover': {
                          borderColor: '#0d9488',
                          bgcolor: '#f0fdfa',
                        },
                      }}
                    >
                      {renderIcon(opt.iconName, 16, active ? '#0d9488' : '#64748b')}
                      {opt.label}
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* Category 2: Pain Intensity Slider & Mouth Location */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  2. Pain Intensity & Location
                </Typography>
                <Chip
                  label={
                    painLevel === 0
                      ? 'No Pain'
                      : painLevel <= 3
                      ? `Mild (${painLevel}/10)`
                      : painLevel <= 6
                      ? `Moderate (${painLevel}/10)`
                      : `Severe (${painLevel}/10)`
                  }
                  color={painLevel >= 7 ? 'error' : painLevel >= 4 ? 'warning' : 'primary'}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              <Box sx={{ px: 2, pt: 1 }}>
                <Slider
                  value={painLevel}
                  min={1}
                  max={10}
                  step={1}
                  marks={[
                    { value: 1, label: '🙂 1' },
                    { value: 3, label: '😐 3' },
                    { value: 5, label: '🙁 5' },
                    { value: 7, label: '😣 7' },
                    { value: 10, label: '😫 10' },
                  ]}
                  onChange={(_, val) => setPainLevel(val as number)}
                  valueLabelDisplay="auto"
                  sx={{
                    color: painLevel >= 7 ? '#ef4444' : painLevel >= 4 ? '#f59e0b' : '#0d9488',
                    '& .MuiSlider-thumb': {
                      width: 22,
                      height: 22,
                    },
                  }}
                />
              </Box>

              {/* Mouth Quadrant Selector */}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2, mb: 1 }}>
                Where is the pain located in your mouth?
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {[
                  { id: 'upper_left', label: 'Upper Left' },
                  { id: 'upper_front', label: 'Upper Front' },
                  { id: 'upper_right', label: 'Upper Right' },
                  { id: 'lower_left', label: 'Lower Left' },
                  { id: 'lower_front', label: 'Lower Front' },
                  { id: 'lower_right', label: 'Lower Right' },
                ].map((quad) => {
                  const active = selectedLocation === quad.id;
                  return (
                    <Box
                      key={quad.id}
                      onClick={() => setSelectedLocation(quad.id)}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: active ? '#0d9488' : '#e2e8f0',
                        bgcolor: active ? '#f0fdfa' : '#f8fafc',
                        color: active ? '#0f766e' : '#475569',
                        fontWeight: active ? 800 : 500,
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {quad.label}
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* Category 3: Daily Habits & Oral Routine */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                3. Habits & Lifestyle
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                Select factors that apply to your daily routine:
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {HABIT_OPTIONS.map((opt) => {
                  const active = selectedHabits.includes(opt.id);
                  return (
                    <Box
                      key={opt.id}
                      onClick={() => handleTogglePill(selectedHabits, setSelectedHabits, opt.id)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 999,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: '1.5px solid',
                        borderColor: active ? '#0d9488' : '#e2e8f0',
                        bgcolor: active ? '#f0fdfa' : '#ffffff',
                        color: active ? '#0f766e' : '#475569',
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.8rem',
                        '&:hover': {
                          borderColor: '#0d9488',
                        },
                      }}
                    >
                      {renderIcon(opt.iconName, 15, active ? '#0d9488' : '#64748b')}
                      {opt.label}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: Allergies, Appearance, Photo & Live Matched Doctor */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={2.5}>
            {/* Category 4: Medical History & Drug Allergies */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                4. Medical History & Allergies
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                Critical for recommending safe, non-allergenic pain relief:
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ALLERGY_HISTORY_OPTIONS.map((opt) => {
                  const active = selectedAllergies.includes(opt.id);
                  const isHealthy = opt.id === 'healthy_no_allergies';
                  return (
                    <Box
                      key={opt.id}
                      onClick={() => {
                        if (isHealthy) {
                          setSelectedAllergies(['healthy_no_allergies']);
                        } else {
                          const withoutHealthy = selectedAllergies.filter((x) => x !== 'healthy_no_allergies');
                          handleTogglePill(withoutHealthy, setSelectedAllergies, opt.id);
                        }
                      }}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 999,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: '1.5px solid',
                        borderColor: active ? (isHealthy ? '#16a34a' : '#d97706') : '#e2e8f0',
                        bgcolor: active ? (isHealthy ? '#f0fdf4' : '#fffbeb') : '#ffffff',
                        color: active ? (isHealthy ? '#15803d' : '#b45309') : '#475569',
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.8rem',
                      }}
                    >
                      {renderIcon(opt.iconName, 15, active ? (isHealthy ? '#16a34a' : '#d97706') : '#64748b')}
                      {opt.label}
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* Category 5: Visual Mirror Check & Photo Upload */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                5. Visual Mirror Check & Photo
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                What do you notice when looking in a mirror?
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1, mb: 2 }}>
                {VISUAL_APPEARANCE_OPTIONS.map((opt) => {
                  const active = selectedAppearance === opt.id;
                  return (
                    <Box
                      key={opt.id}
                      onClick={() => setSelectedAppearance(opt.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: active ? '#0d9488' : '#e2e8f0',
                        bgcolor: active ? '#f0fdfa' : '#f8fafc',
                        color: active ? '#0f766e' : '#334155',
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {renderIcon(opt.iconName, 16, active ? '#0d9488' : '#64748b')}
                      {opt.label}
                    </Box>
                  );
                })}
              </Box>

              {/* Photo Upload Area */}
              <Box
                component="label"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  border: '2px dashed #0d9488',
                  borderRadius: 2.5,
                  bgcolor: '#f0fdfa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#ccfbf1',
                  },
                }}
              >
                <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                <CameraAltIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {uploadedPhotoUrl ? 'Photo Uploaded (Click to replace)' : 'Take or Upload a Photo of Your Tooth / Gum'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Optional • Attached securely to your doctor intake voucher
                  </Typography>
                </Box>
                {uploadedPhotoUrl && (
                  <Chip label="Ready" size="small" color="success" icon={<CheckCircleIcon />} />
                )}
              </Box>

              {uploadedPhotoUrl && (
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <img
                    src={uploadedPhotoUrl}
                    alt="Patient tooth check"
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '2px solid #0d9488' }}
                  />
                  <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 700 }}>
                    Image securely formatted for doctor clinical triage review.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Quick Live Doctor Consultation Card */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '2px solid #0d9488',
                bgcolor: '#ffffff',
                boxShadow: '0 4px 16px -2px rgba(13, 148, 136, 0.12)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label="⭐ Recommended Specialist"
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label={matchedDoctor.nextSlot}
                  size="small"
                  sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 700 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                <Avatar
                  src={matchedDoctor.avatarUrl}
                  alt={matchedDoctor.name}
                  sx={{ width: 58, height: 58, border: '2px solid #0d9488' }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {matchedDoctor.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.85rem' }}>
                    {matchedDoctor.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    <LocationOnIcon sx={{ fontSize: 13, verticalAlign: 'middle' }} /> {matchedDoctor.clinicName} • {matchedDoctor.distance}
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<CalendarTodayIcon />}
                  onClick={() => {
                    setBookingDoctor(matchedDoctor);
                    setIsBookingOpen(true);
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  Book Visit
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<PhoneIcon />}
                  component="a"
                  href={`tel:${matchedDoctor.phone.replace(/[^0-9]/g, '')}`}
                  sx={{ fontWeight: 700 }}
                >
                  Call Clinic
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* 4. STANDARDIZED WHITELISTED PHARMACEUTICALS & TRUSTED CHEMISTS (PHARMEASY, 1MG, APOLLO) */}
      <Box ref={pharmacySectionRef} sx={{ scrollMarginTop: '80px' }}>
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3.5,
            border: '2px solid #0d9488',
            bgcolor: '#ffffff',
            boxShadow: '0 8px 30px -4px rgba(13, 148, 136, 0.1)',
          }}
        >
          {/* Section Header */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Pill size={22} color="#0d9488" />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Whitelisted Dental Pharmaceuticals
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Curated by dental surgeons. We strictly recommend evidence-based, whitelisted formulations. Order genuine stock directly from licensed chemist portals (PharmEasy, Tata 1mg, Apollo Pharmacy).
              </Typography>
            </Box>

            <Chip
              icon={<VerifiedUserIcon />}
              label="FDA / CDSCO Whitelisted Formulations"
              color="primary"
              sx={{ fontWeight: 800 }}
            />
          </Box>

          {/* Category Filter Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {[
              { id: 'all', label: 'All Whitelisted Formulations' },
              { id: 'analgesic', label: 'Pain Relief (Analgesic)' },
              { id: 'anti_inflammatory', label: 'Anti-Inflammatory (Pulpitis / Bone)' },
              { id: 'oral_rinse', label: 'Antiseptic Oral Rinses' },
              { id: 'desensitizing', label: 'Tooth Sensitivity Pastes' },
              { id: 'topical_anesthetic', label: 'Topical Numbing Drops / Gels' },
            ].map((cat) => {
              const active = pharmaFilter === cat.id;
              return (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  clickable
                  onClick={() => setPharmaFilter(cat.id)}
                  sx={{
                    bgcolor: active ? '#0f766e' : '#f1f5f9',
                    color: active ? '#ffffff' : '#334155',
                    fontWeight: active ? 800 : 600,
                    borderRadius: 999,
                    '&:hover': {
                      bgcolor: active ? '#0f766e' : '#e2e8f0',
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* Whitelisted Pharmaceuticals Grid */}
          <Grid container spacing={2.5}>
            {filteredPharmaceuticals.map((pharma) => (
              <Grid size={{ xs: 12, md: 6 }} key={pharma.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: '#e2e8f0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: pharma.color,
                      boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Top Drug Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          bgcolor: `${pharma.color}15`,
                          color: pharma.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {renderIcon(pharma.iconName, 22, pharma.color)}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                            {pharma.genericName}
                          </Typography>
                          <Chip
                            label={pharma.regulatoryStandard}
                            size="small"
                            sx={{
                              bgcolor: '#ecfdf5',
                              color: '#065f46',
                              fontWeight: 700,
                              fontSize: '0.675rem',
                              height: 20,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: pharma.color, fontWeight: 700, display: 'block', mt: 0.3 }}>
                          {pharma.categoryLabel} • Brands: {pharma.brandExamples}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Standard Dosage & Usage */}
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, mb: 1.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', display: 'block' }}>
                        📋 Standard Clinical Dosage:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.825rem', mb: 0.5 }}>
                        {pharma.standardDosage}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        <strong>How to take:</strong> {pharma.howToTake}
                      </Typography>
                    </Box>

                    {/* Doctor Curated Tip */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 800, display: 'block' }}>
                        🩺 Doctor Curated Note:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem', lineHeight: 1.45 }}>
                        {pharma.doctorCuratedTip}
                      </Typography>
                    </Box>

                    {/* Safety Alert & Contraindications */}
                    <Box sx={{ p: 1.2, bgcolor: '#fff1f2', borderRadius: 2, border: '1px solid #fecdd3', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#be123c', fontWeight: 800, display: 'block' }}>
                        ⚠️ Safety Warning:
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9f1239', display: 'block', fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {pharma.safetyWarning}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#be123c', display: 'block', mt: 0.4, fontSize: '0.7rem' }}>
                        <strong>Contraindications:</strong> {pharma.contraindications.join(', ')}
                      </Typography>
                    </Box>

                    {/* Direct Chemist Store Order Links */}
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1 }}>
                        Order from Licensed Medical Stores:
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        {pharma.chemistLinks.map((store, i) => (
                          <Button
                            key={i}
                            variant="outlined"
                            size="small"
                            component="a"
                            href={store.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                            sx={{
                              flex: 1,
                              borderRadius: 2,
                              borderColor: '#cbd5e1',
                              color: '#1e293b',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              py: 0.75,
                              '&:hover': {
                                bgcolor: '#f0fdfa',
                                borderColor: store.color,
                                color: store.color,
                              },
                            }}
                          >
                            {store.storeName}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* 5. SAFE HOME REMEDIES ACCORDION / GRID */}
      <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <HealingIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Safe Home Comfort Measures
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
          Dentist-approved natural comfort measures you can safely use at home while awaiting your consultation:
        </Typography>

        <Grid container spacing={2}>
          {SAFE_HOME_REMEDIES.map((remedy) => (
            <Grid size={{ xs: 12, sm: 6 }} key={remedy.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  height: '100%',
                  borderColor: '#e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: remedy.color, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: `${remedy.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {renderIcon(remedy.iconName, 18, remedy.color)}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {remedy.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: remedy.color, fontWeight: 700 }}>
                        {remedy.tag}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.825rem', lineHeight: 1.5, mb: 1 }}>
                    <strong>How to use:</strong> {remedy.howToUse}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    <strong>Why it helps:</strong> {remedy.whyItHelps}
                  </Typography>

                  {remedy.contraindications && (
                    <Box sx={{ mt: 1.5, p: 1, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                      <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700, display: 'block' }}>
                        ⚠️ {remedy.contraindications}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 6. VERIFIED DENTAL SPECIALISTS IN BUTTERFLY NETWORK */}
      <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Verified Dental Specialists Near You
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Connect directly with credentialed dental specialists ready to evaluate your intake:
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AssignmentIcon />}
            onClick={onSelectReferralView}
            sx={{ fontWeight: 700 }}
          >
            View Doctor Referral Voucher
          </Button>
        </Box>

        <Grid container spacing={2}>
          {otherDoctors.map((doc) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                  <Avatar src={doc.avatarUrl} alt={doc.name} sx={{ width: 48, height: 48 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {doc.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block' }}>
                      {doc.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ★ {doc.rating} ({doc.reviewCount}) • {doc.distance}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ color: '#64748b', flexGrow: 1, mb: 1.5, display: 'block' }}>
                  {doc.clinicName} • Earliest: <strong>{doc.nextSlot}</strong>
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => {
                    setBookingDoctor(doc);
                    setIsBookingOpen(true);
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  Book Appointment
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
        </>
      )}

      {/* Booking Dialog */}
      <AppointmentBookingModal
        open={isBookingOpen}
        doctor={bookingDoctor}
        onClose={() => setIsBookingOpen(false)}
        patientSymptomSummary={activeDecision.reason}
      />

      {/* 7. FLOATING LOWER-RIGHT INTERACTIVE CHATBOT (DR. BUTTERFLY) */}
      <DoctorChatbotFloating
        initialOpen={false}
        currentSymptomSummary={currentSymptomSummary}
        onBookAppointmentClick={(doc) => {
          setBookingDoctor(doc || matchedDoctor);
          setIsBookingOpen(true);
        }}
      />
    </Box>
  );
};
