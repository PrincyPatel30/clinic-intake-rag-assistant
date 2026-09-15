import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Lucide Icons
import {
  HeartPulse,
  Brain,
  Wind,
  Activity,
  Zap,
  Bone,
  ShieldAlert,
  Eye,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  HelpCircle,
  Flame,
  Sliders,
} from 'lucide-react';

import {
  UNIVERSAL_FEELING_OPTIONS,
  BodySystemOption,
  evaluateUniversalTriage,
  TriageResult,
  MULTI_SPECIALTY_DOCTORS,
  SpecialistDoctor,
} from '../data/universalPatientData';
import { AppointmentBookingModal } from './AppointmentBookingModal';
import { routePatientUtterance, RoutingDecision } from '../lib/careRouter';
import { REAL_WORLD_DOCTORS } from '../data/patientConsultationData';

export interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  type?: 'text' | 'initial_selector' | 'custom_issues' | 'triage_result';
  systemOption?: BodySystemOption;
  triageResult?: TriageResult;
  matchedDoctor?: SpecialistDoctor;
  suggestedPills?: string[];
}

interface PatientCareHubChatbotProps {
  onSelectReferralView: () => void;
  onUpdateDecision: (decision: RoutingDecision, utterance: string) => void;
}

export const PatientCareHubChatbot: React.FC<PatientCareHubChatbotProps> = ({
  onSelectReferralView,
  onUpdateDecision,
}) => {
  // Clinical state
  const [selectedSystem, setSelectedSystem] = useState<BodySystemOption | null>(null);
  const [selectedCustomIssues, setSelectedCustomIssues] = useState<string[]>([]);
  const [painScore, setPainScore] = useState<number>(5);
  const [hasEnoughResponses, setHasEnoughResponses] = useState<boolean>(false);
  const [completedTriage, setCompletedTriage] = useState<TriageResult | null>(null);

  // Booking Modal
  const [bookingDoctor, setBookingDoctor] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // Chat message stream
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [botTemperature, setBotTemperature] = useState<number>(0.2);
  const [tempAnchorEl, setTempAnchorEl] = useState<HTMLElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize consultation on mount
  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const initChat = () => {
    setSelectedSystem(null);
    setSelectedCustomIssues([]);
    setPainScore(5);
    setHasEnoughResponses(false);
    setCompletedTriage(null);

    setMessages([
      {
        id: 'msg_welcome_1',
        sender: 'doctor',
        text: "Hello, and welcome to Butterfly Patient Care Hub. I am your Clinical Intake Navigator. Whatever you are feeling today, my goal is to listen, identify your real medical needs, and connect you with the right doctor.",
        timestamp: 'Just now',
      },
      {
        id: 'msg_welcome_2',
        sender: 'doctor',
        text: "What are you feeling today? Tap the visual icon that best matches your discomfort to begin:",
        timestamp: 'Just now',
        type: 'initial_selector',
      },
    ]);
  };

  const renderIcon = (iconName: string, size = 20, color = 'inherit') => {
    const props = { size, color };
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse {...props} />;
      case 'Brain': return <Brain {...props} />;
      case 'Wind': return <Wind {...props} />;
      case 'Activity': return <Activity {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Bone': return <Bone {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'Eye': return <Eye {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      default: return <Stethoscope {...props} />;
    }
  };

  // Step 1: User selects a body system card
  const handleSelectSystem = (system: BodySystemOption) => {
    setSelectedSystem(system);
    setSelectedCustomIssues([]);

    const patientMsg: ChatMessage = {
      id: `p_${Date.now()}`,
      sender: 'patient',
      text: `I'm having an issue with my ${system.label} (${system.sublabel}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const doctorFollowUp: ChatMessage = {
      id: `d_${Date.now() + 1}`,
      sender: 'doctor',
      text: `Thank you for sharing. To identify exactly what you need and rule out any urgent complications, please review these customized checks for ${system.label}:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'custom_issues',
      systemOption: system,
    };

    setMessages((prev) => [...prev, patientMsg, doctorFollowUp]);
  };

  // Step 2: Toggle custom issue checkboxes
  const handleToggleIssue = (issueId: string) => {
    setSelectedCustomIssues((prev) => {
      const next = prev.includes(issueId) ? prev.filter((x) => x !== issueId) : [...prev, issueId];
      return next;
    });
  };

  // Step 3: Confirm and Generate Clinical Triage (Only after enough response)
  const handleGenerateTriage = (customOptions: string[], score: number, userNote = '') => {
    if (!selectedSystem) return;

    // Check completeness: needs at least 1 symptom card or user note
    if (customOptions.length === 0 && userNote.trim().length < 5) {
      // Prompt user for more details
      const reminderMsg: ChatMessage = {
        id: `remind_${Date.now()}`,
        sender: 'doctor',
        text: "Please select at least one symptom sensation above or type a brief description in the chat below so we can accurately assess your urgency level and find the right specialist.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reminderMsg]);
      return;
    }

    setHasEnoughResponses(true);

    const patientSummaryText = userNote || customOptions.join(', ');
    const patientMsg: ChatMessage = {
      id: `p_summary_${Date.now()}`,
      sender: 'patient',
      text: `Symptom details: ${patientSummaryText}. Pain score: ${score}/10.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Evaluate universal triage
    const triage = evaluateUniversalTriage(selectedSystem.id, customOptions, score, userNote);
    setCompletedTriage(triage);

    // Get matched doctor
    const docKey = selectedSystem.category;
    const matchedDoc = MULTI_SPECIALTY_DOCTORS[docKey] || MULTI_SPECIALTY_DOCTORS.general;

    const triageMsg: ChatMessage = {
      id: `d_triage_${Date.now() + 1}`,
      sender: 'doctor',
      text: `I have analyzed your clinical presentation across published referral and safety standards. Here is your personalized Clinical Triage & Care Navigation Plan:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'triage_result',
      triageResult: triage,
      matchedDoctor: matchedDoc,
    };

    setMessages((prev) => [...prev, patientMsg, triageMsg]);

    // Synchronize with global care routing engine
    const realDecision = routePatientUtterance(`${selectedSystem.label}: ${patientSummaryText}`);
    onUpdateDecision(realDecision, `${selectedSystem.label}: ${patientSummaryText}`);
  };

  // Free-text chat submit
  const handleSendFreeText = () => {
    const text = inputText.trim();
    if (!text) return;

    const patientMsg: ChatMessage = {
      id: `p_text_${Date.now()}`,
      sender: 'patient',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Check if user input matches a body system
    const lower = text.toLowerCase();
    let detectedSystem = selectedSystem;

    if (!detectedSystem) {
      if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitation')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'chest_heart') || null;
      } else if (lower.includes('head') || lower.includes('migraine') || lower.includes('dizzy')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'head_neuro') || null;
      } else if (lower.includes('stomach') || lower.includes('belly') || lower.includes('nausea') || lower.includes('cramp')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'stomach_digestive') || null;
      } else if (lower.includes('tooth') || lower.includes('teeth') || lower.includes('gum') || lower.includes('dental')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'dental_oral') || null;
      } else if (lower.includes('cough') || lower.includes('breath') || lower.includes('wheez') || lower.includes('lung')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'respiratory_flu') || null;
      } else if (lower.includes('back') || lower.includes('joint') || lower.includes('knee') || lower.includes('bone')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'bones_joints_back') || null;
      } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('hives') || lower.includes('itch')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'skin_allergies') || null;
      } else if (lower.includes('eye') || lower.includes('ear') || lower.includes('sinus') || lower.includes('throat')) {
        detectedSystem = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'eyes_ears_ent') || null;
      }
    }

    if (detectedSystem) {
      setSelectedSystem(detectedSystem);

      // If user typed a rich sentence (> 20 chars), we have enough to generate triage immediately!
      if (text.length > 25) {
        const triage = evaluateUniversalTriage(detectedSystem.id, [], painScore, text);
        setCompletedTriage(triage);
        setHasEnoughResponses(true);
        const docKey = detectedSystem.category;
        const matchedDoc = MULTI_SPECIALTY_DOCTORS[docKey] || MULTI_SPECIALTY_DOCTORS.general;

        const triageMsg: ChatMessage = {
          id: `d_triage_${Date.now() + 1}`,
          sender: 'doctor',
          text: `Thank you for describing your issue in detail. I have evaluated your presentation across clinical guidelines:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'triage_result',
          triageResult: triage,
          matchedDoctor: matchedDoc,
        };

        setMessages((prev) => [...prev, patientMsg, triageMsg]);
        setInputText('');
        return;
      } else {
        // Short text: show customized issue cards
        const followUp: ChatMessage = {
          id: `d_follow_${Date.now() + 1}`,
          sender: 'doctor',
          text: `I understand you are experiencing discomfort related to your ${detectedSystem.label}. To give you an exact clinical recommendation, please select which of these apply:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'custom_issues',
          systemOption: detectedSystem,
        };
        setMessages((prev) => [...prev, patientMsg, followUp]);
        setInputText('');
        return;
      }
    }

    // Default general response
    const generalReply: ChatMessage = {
      id: `d_gen_${Date.now() + 1}`,
      sender: 'doctor',
      text: `I hear you. To make sure we match you with the right medical specialist, please choose the body system or discomfort area below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'initial_selector',
    };
    setMessages((prev) => [...prev, patientMsg, generalReply]);
    setInputText('');
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top Clinical Trust Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: '#f0fdfa',
          border: '1.5px solid #ccfbf1',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#0f766e', color: 'white', width: 38, height: 38, fontWeight: 900 }}>
            🩺
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f766e' }}>
                Butterfly Clinical Care Navigator
              </Typography>
              <Chip
                label="Doctor-Curated Care"
                size="small"
                sx={{ bgcolor: '#0d9488', color: 'white', fontWeight: 800, height: 20, fontSize: '0.675rem' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#134e4a' }}>
              Multi-specialty patient care • Zero under-routing safety ladder • Compassionate guidance
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={initChat}
          sx={{ borderColor: '#99f6e4', color: '#0f766e', fontWeight: 700 }}
        >
          New Consultation
        </Button>
      </Paper>

      {/* Main Interactive Chatbot Window */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3.5,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 650,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          bgcolor: '#ffffff',
          boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.06)',
        }}
      >
        {/* Chatbot Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#0f766e',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ bgcolor: '#ffffff', color: '#0f766e', width: 42, height: 42, fontWeight: 900 }}>
                🩺
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#4ade80',
                  border: '2px solid #0f766e',
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Dr. Butterfly
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Patient Care & Clinical Triage Companion
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Configure LLM Generation Temperature">
              <Chip
                icon={<Flame size={14} color="#fde047" />}
                label={`Temp: ${botTemperature.toFixed(2)}`}
                size="small"
                onClick={(e) => setTempAnchorEl(e.currentTarget)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.22)',
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                }}
              />
            </Tooltip>

            <Chip
              icon={<ShieldCheck size={14} color="#ffffff" />}
              label="Doctor-Curated"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
            />
          </Box>
        </Box>

        {/* Temperature Tuning Popover */}
        <Popover
          open={Boolean(tempAnchorEl)}
          anchorEl={tempAnchorEl}
          onClose={() => setTempAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { p: 2.5, width: 280, borderRadius: 3, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' } } }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f766e', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Sliders size={16} /> Pipeline Temperature
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
            Controls model determinism (0.0 strict, 0.2 medical, 0.7 conversational).
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={botTemperature}
              min={0.0}
              max={1.0}
              step={0.05}
              onChange={(_, val) => setBotTemperature(val as number)}
              valueLabelDisplay="auto"
              sx={{ color: '#0f766e' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', mt: 0.5 }}>
            <span>0.0 (Deterministic)</span>
            <span>0.2 (Ideal)</span>
            <span>1.0 (Creative)</span>
          </Box>
        </Popover>

        {/* Message Stream */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            bgcolor: '#f8fafc',
          }}
        >
          {messages.map((msg) => {
            const isPatient = msg.sender === 'patient';
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isPatient ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                {/* Standard Text Bubble */}
                {msg.text && (
                  <Box
                    sx={{
                      maxWidth: { xs: '92%', md: '80%' },
                      p: 2,
                      borderRadius: 3,
                      bgcolor: isPatient ? '#0f766e' : '#ffffff',
                      color: isPatient ? '#ffffff' : '#1e293b',
                      border: isPatient ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      fontSize: '0.925rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.text}
                  </Box>
                )}

                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.5, px: 0.5 }}>
                  {msg.timestamp}
                </Typography>

                {/* 1. EMBEDDED "WHAT ARE YOU FEELING TODAY?" CARDS */}
                {msg.type === 'initial_selector' && (
                  <Box sx={{ width: '100%', mt: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e', display: 'block', mb: 1.5, letterSpacing: 0.5 }}>
                      SELECT YOUR DISCOMFORT AREA:
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(2, 1fr)',
                          sm: 'repeat(3, 1fr)',
                          md: 'repeat(3, 1fr)',
                        },
                        gap: 1.5,
                      }}
                    >
                      {UNIVERSAL_FEELING_OPTIONS.map((item) => (
                        <Paper
                          key={item.id}
                          elevation={0}
                          onClick={() => handleSelectSystem(item)}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            cursor: 'pointer',
                            bgcolor: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            '&:hover': {
                              borderColor: item.accentColor,
                              bgcolor: item.bgPastel,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 16px -2px rgba(0,0,0,0.06)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              bgcolor: item.bgPastel,
                              color: item.accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {renderIcon(item.iconName, 22, item.accentColor)}
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem', display: 'block', mt: 0.3 }}>
                              {item.sublabel}
                            </Typography>
                          </Box>
                          <ChevronRight size={18} color="#94a3b8" />
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* 2. EMBEDDED CUSTOMIZED REAL-ISSUE DISCOVERY CARDS */}
                {msg.type === 'custom_issues' && msg.systemOption && (
                  <Paper
                    elevation={0}
                    sx={{
                      width: '100%',
                      p: { xs: 2, sm: 2.5 },
                      mt: 1.5,
                      borderRadius: 3,
                      bgcolor: '#ffffff',
                      border: '2px solid #0d9488',
                      boxShadow: '0 8px 25px -4px rgba(13, 148, 136, 0.08)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          bgcolor: msg.systemOption.bgPastel,
                          color: msg.systemOption.accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {renderIcon(msg.systemOption.iconName, 20, msg.systemOption.accentColor)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Customized Clinical Checks: {msg.systemOption.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Select all sensations that match what you feel right now:
                        </Typography>
                      </Box>
                    </Box>

                    {/* Question Options */}
                    {msg.systemOption.customIssues.map((issueQ) => (
                      <Box key={issueQ.id} sx={{ mb: 2.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                          {issueQ.question}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {issueQ.options.map((opt) => {
                            const isSelected = selectedCustomIssues.includes(opt.id);
                            return (
                              <Box
                                key={opt.id}
                                onClick={() => handleToggleIssue(opt.id)}
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  px: 1.75,
                                  py: 1,
                                  borderRadius: 2.5,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  border: '1.5px solid',
                                  borderColor: isSelected
                                    ? opt.isEmergencyAlert
                                      ? '#dc2626'
                                      : '#0d9488'
                                    : '#e2e8f0',
                                  bgcolor: isSelected
                                    ? opt.isEmergencyAlert
                                      ? '#fef2f2'
                                      : '#f0fdfa'
                                    : '#ffffff',
                                  color: isSelected
                                    ? opt.isEmergencyAlert
                                      ? '#b91c1c'
                                      : '#0f766e'
                                    : '#334155',
                                  fontWeight: isSelected ? 700 : 500,
                                  fontSize: '0.85rem',
                                  '&:hover': {
                                    borderColor: opt.isEmergencyAlert ? '#ef4444' : '#0d9488',
                                  },
                                }}
                              >
                                {opt.isEmergencyAlert && <ShieldAlert size={16} color="#dc2626" />}
                                {opt.label}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}

                    {/* Pain Intensity Slider */}
                    <Box sx={{ mb: 3, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          How severe is your discomfort? (1 to 10 Scale)
                        </Typography>
                        <Chip
                          label={painScore >= 7 ? `Severe (${painScore}/10)` : painScore >= 4 ? `Moderate (${painScore}/10)` : `Mild (${painScore}/10)`}
                          color={painScore >= 7 ? 'error' : painScore >= 4 ? 'warning' : 'primary'}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>

                      <Slider
                        value={painScore}
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
                        onChange={(_, val) => setPainScore(val as number)}
                        sx={{
                          color: painScore >= 7 ? '#dc2626' : painScore >= 4 ? '#d97706' : '#0d9488',
                          '& .MuiSlider-thumb': { width: 22, height: 22 },
                        }}
                      />
                    </Box>

                    {/* Confirm Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {selectedCustomIssues.length === 0
                          ? 'Select applicable items above to proceed'
                          : `${selectedCustomIssues.length} issue indicators selected`}
                      </Typography>

                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleGenerateTriage(selectedCustomIssues, painScore)}
                        sx={{
                          bgcolor: '#0f766e',
                          fontWeight: 800,
                          borderRadius: 2.5,
                          px: 2.5,
                          '&:hover': { bgcolor: '#0d9488' },
                        }}
                      >
                        Generate Clinical Care Plan
                      </Button>
                    </Box>
                  </Paper>
                )}

                {/* 3. EMBEDDED COMPREHENSIVE CLINICAL TRIAGE RESULT CARD */}
                {msg.type === 'triage_result' && msg.triageResult && msg.matchedDoctor && (
                  <Paper
                    elevation={0}
                    sx={{
                      width: '100%',
                      p: { xs: 2.5, sm: 3 },
                      mt: 1.5,
                      borderRadius: 3.5,
                      border: '2px solid',
                      borderColor: msg.triageResult.urgencyColor,
                      bgcolor: '#ffffff',
                      boxShadow: '0 10px 30px -4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Urgency Level Banner */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: `${msg.triageResult.urgencyColor}15`,
                        border: `1.5px solid ${msg.triageResult.urgencyColor}40`,
                        mb: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShieldAlert color={msg.triageResult.urgencyColor} size={20} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: msg.triageResult.urgencyColor }}>
                          {msg.triageResult.urgencyLabel}
                        </Typography>
                      </Box>

                      <Chip
                        label="Zero Under-Routing Verified"
                        size="small"
                        sx={{ bgcolor: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>

                    {/* Plain English Issue Description */}
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                      {msg.triageResult.summaryTitle}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 2.5 }}>
                      {msg.triageResult.plainEnglishExplanation}
                    </Typography>

                    {/* Matched Doctor Recommendation */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        mb: 2.5,
                      }}
                    >
                      <Typography variant="overline" sx={{ fontWeight: 800, color: '#0f766e', letterSpacing: 0.5 }}>
                        MATCHED CLINICAL SPECIALIST:
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 1, mb: 1.5 }}>
                        <Avatar
                          src={msg.matchedDoctor.avatarUrl}
                          alt={msg.matchedDoctor.name}
                          sx={{ width: 56, height: 56, border: '2px solid #0d9488' }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {msg.matchedDoctor.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0f766e', fontWeight: 700 }}>
                            {msg.matchedDoctor.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            <LocationOnIcon sx={{ fontSize: 13, verticalAlign: 'middle' }} /> {msg.matchedDoctor.clinicName} • {msg.matchedDoctor.distance}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic', fontSize: '0.825rem', mb: 2 }}>
                        "{msg.matchedDoctor.bio}"
                      </Typography>

                      {/* Doctor Action Buttons */}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<CalendarMonthIcon />}
                          onClick={() => {
                            setBookingDoctor(msg.matchedDoctor);
                            setIsBookingOpen(true);
                          }}
                          sx={{ bgcolor: '#0f766e', fontWeight: 800 }}
                        >
                          Book Priority Visit ({msg.matchedDoctor.nextSlot})
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          startIcon={<PhoneIcon />}
                          component="a"
                          href={`tel:${msg.matchedDoctor.phone.replace(/[^0-9]/g, '')}`}
                          sx={{ fontWeight: 700 }}
                        >
                          Call {msg.matchedDoctor.phone}
                        </Button>
                      </Stack>
                    </Box>

                    {/* Red Flags Checklist */}
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WarningAmberIcon sx={{ fontSize: 18 }} />
                        Red Flag Warning Signs to Watch For:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#475569', fontSize: '0.825rem', lineHeight: 1.6 }}>
                        {msg.triageResult.redFlagsList.map((rf, i) => (
                          <li key={i}>{rf}</li>
                        ))}
                      </Box>
                    </Box>

                    {/* Questions to Ask Your Doctor */}
                    <Box sx={{ mb: 2.5, p: 1.75, bgcolor: '#f0fdfa', borderRadius: 2.5, border: '1px solid #ccfbf1' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <HelpCircle size={18} />
                        Questions to Bring to Your Doctor:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#134e4a', fontSize: '0.825rem', lineHeight: 1.6 }}>
                        {msg.triageResult.doctorVisitQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </Box>
                    </Box>

                    {/* Bottom Navigation Shortcut to Clinician Referral */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, pt: 1, borderTop: '1px solid #e2e8f0' }}>
                      <Button
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={onSelectReferralView}
                        sx={{ fontWeight: 700, color: '#0f766e' }}
                      >
                        View Clinician Referral Audit Voucher
                      </Button>

                      <Button
                        size="small"
                        startIcon={<RestartAltIcon />}
                        onClick={initChat}
                        sx={{ fontWeight: 700, color: '#64748b' }}
                      >
                        Start Another Symptom Check
                      </Button>
                    </Box>
                  </Paper>
                )}
              </Box>
            );
          })}
          <div ref={chatEndRef} />
        </Box>

        {/* Chat Input Bar */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type your health question or symptom in your own words..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendFreeText();
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f8fafc',
                fontSize: '0.9rem',
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSendFreeText}
            sx={{
              minWidth: 48,
              height: 40,
              borderRadius: 3,
              bgcolor: '#0f766e',
              '&:hover': { bgcolor: '#0d9488' },
            }}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </Paper>

      {/* Booking Dialog */}
      <AppointmentBookingModal
        open={isBookingOpen}
        doctor={bookingDoctor}
        onClose={() => setIsBookingOpen(false)}
        patientSymptomSummary={completedTriage?.summaryTitle || 'General Clinical Consultation'}
      />
    </Box>
  );
};
