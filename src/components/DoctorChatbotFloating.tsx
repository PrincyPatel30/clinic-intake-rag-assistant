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
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Zoom from '@mui/material/Zoom';
import Slider from '@mui/material/Slider';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SendIcon from '@mui/icons-material/Send';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
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
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

import {
  UNIVERSAL_FEELING_OPTIONS,
  BodySystemOption,
  evaluateUniversalTriage,
  TriageResult,
  MULTI_SPECIALTY_DOCTORS,
  SpecialistDoctor,
} from '../data/universalPatientData';

export interface FloatingChatMessage {
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

interface DoctorChatbotFloatingProps {
  initialOpen?: boolean;
  currentSymptomSummary?: string;
  onBookAppointmentClick?: (doctor?: any) => void;
}

export const DoctorChatbotFloating: React.FC<DoctorChatbotFloatingProps> = ({
  initialOpen = false,
  currentSymptomSummary,
  onBookAppointmentClick,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [inputText, setInputText] = useState<string>('');
  const [hasUnread, setHasUnread] = useState<boolean>(true);

  // Active intake state
  const [selectedSystem, setSelectedSystem] = useState<BodySystemOption | null>(null);
  const [selectedCustomIssues, setSelectedCustomIssues] = useState<string[]>([]);
  const [painScore, setPainScore] = useState<number>(5);

  const [messages, setMessages] = useState<FloatingChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHasUnread((prev) => (prev ? false : prev));
      const timer = setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  const initChat = () => {
    setSelectedSystem(null);
    setSelectedCustomIssues([]);
    setPainScore(5);

    setMessages([
      {
        id: 'm1',
        sender: 'doctor',
        text: "Hello! I am Dr. Butterfly, your Clinical Intake Navigator. I'm here to understand your real health concerns and connect you to the right doctor.",
        timestamp: 'Just now',
      },
      {
        id: 'm2',
        sender: 'doctor',
        text: "What are you feeling today? Tap the visual icon that best matches your discomfort to begin:",
        timestamp: 'Just now',
        type: 'initial_selector',
      },
    ]);
  };

  const renderIcon = (iconName: string, size = 18, color = 'inherit') => {
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

  const handleSelectSystem = (system: BodySystemOption) => {
    setSelectedSystem(system);
    setSelectedCustomIssues([]);

    const patientMsg: FloatingChatMessage = {
      id: `p_${Date.now()}`,
      sender: 'patient',
      text: `I'm feeling discomfort related to my ${system.label} (${system.sublabel}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const doctorFollowUp: FloatingChatMessage = {
      id: `d_${Date.now() + 1}`,
      sender: 'doctor',
      text: `I hear you. To understand your exact situation and rule out urgent complications, please select what applies:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'custom_issues',
      systemOption: system,
    };

    setMessages((prev) => [...prev, patientMsg, doctorFollowUp]);
  };

  const handleToggleIssue = (issueId: string) => {
    setSelectedCustomIssues((prev) =>
      prev.includes(issueId) ? prev.filter((x) => x !== issueId) : [...prev, issueId]
    );
  };

  const handleGenerateTriage = (options: string[], score: number, userText = '') => {
    if (!selectedSystem) return;

    if (options.length === 0 && userText.trim().length < 5) {
      const reminder: FloatingChatMessage = {
        id: `rem_${Date.now()}`,
        sender: 'doctor',
        text: 'Please select at least 1 symptom card or write a brief note so I can determine your urgency level and the right doctor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reminder]);
      return;
    }

    const patientMsg: FloatingChatMessage = {
      id: `p_done_${Date.now()}`,
      sender: 'patient',
      text: userText || `Symptoms: ${options.join(', ')} • Discomfort Level: ${score}/10`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const triage = evaluateUniversalTriage(selectedSystem.id, options, score, userText);
    const docKey = selectedSystem.category;
    const matchedDoc = MULTI_SPECIALTY_DOCTORS[docKey] || MULTI_SPECIALTY_DOCTORS.general;

    const triageMsg: FloatingChatMessage = {
      id: `d_triage_${Date.now() + 1}`,
      sender: 'doctor',
      text: `Based on your clinical responses, here is your personalized Triage & Doctor Recommendation:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'triage_result',
      triageResult: triage,
      matchedDoctor: matchedDoc,
    };

    setMessages((prev) => [...prev, patientMsg, triageMsg]);
  };

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const patientMsg: FloatingChatMessage = {
      id: `p_${Date.now()}`,
      sender: 'patient',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const lower = text.toLowerCase();
    let detected = selectedSystem;

    if (!detected) {
      if (lower.includes('chest') || lower.includes('heart')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'chest_heart') || null;
      } else if (lower.includes('head') || lower.includes('migraine')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'head_neuro') || null;
      } else if (lower.includes('stomach') || lower.includes('cramp') || lower.includes('nausea')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'stomach_digestive') || null;
      } else if (lower.includes('tooth') || lower.includes('dental') || lower.includes('teeth')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'dental_oral') || null;
      } else if (lower.includes('cough') || lower.includes('breath') || lower.includes('wheez')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'respiratory_flu') || null;
      } else if (lower.includes('back') || lower.includes('joint') || lower.includes('bone')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'bones_joints_back') || null;
      } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('hives')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'skin_allergies') || null;
      } else if (lower.includes('eye') || lower.includes('ear') || lower.includes('sinus')) {
        detected = UNIVERSAL_FEELING_OPTIONS.find((s) => s.id === 'eyes_ears_ent') || null;
      }
    }

    if (detected) {
      setSelectedSystem(detected);
      if (text.length > 20) {
        const triage = evaluateUniversalTriage(detected.id, [], painScore, text);
        const docKey = detected.category;
        const matchedDoc = MULTI_SPECIALTY_DOCTORS[docKey] || MULTI_SPECIALTY_DOCTORS.general;

        const triageMsg: FloatingChatMessage = {
          id: `d_res_${Date.now() + 1}`,
          sender: 'doctor',
          text: `Thank you for the detailed information. Here is your medical triage evaluation:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'triage_result',
          triageResult: triage,
          matchedDoctor: matchedDoc,
        };

        setMessages((prev) => [...prev, patientMsg, triageMsg]);
        setInputText('');
        return;
      } else {
        const followUp: FloatingChatMessage = {
          id: `d_fol_${Date.now() + 1}`,
          sender: 'doctor',
          text: `Regarding your ${detected.label}, please select any specific sensations you have:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'custom_issues',
          systemOption: detected,
        };
        setMessages((prev) => [...prev, patientMsg, followUp]);
        setInputText('');
        return;
      }
    }

    // Default general response
    const generalReply: FloatingChatMessage = {
      id: `d_gen_${Date.now() + 1}`,
      sender: 'doctor',
      text: "Please select the area of discomfort below to get tailored clinical guidance:",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'initial_selector',
    };
    setMessages((prev) => [...prev, patientMsg, generalReply]);
    setInputText('');
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      {/* 1. MINIMIZED FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <Zoom in={!isOpen}>
          <Box
            onClick={() => setIsOpen(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: '#0f766e',
              color: 'white',
              px: 2.2,
              py: 1.3,
              borderRadius: 999,
              cursor: 'pointer',
              boxShadow: '0 10px 25px -3px rgba(15, 118, 110, 0.4), 0 4px 10px -2px rgba(0,0,0,0.1)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(255,255,255,0.2)',
              '&:hover': {
                bgcolor: '#0d9488',
                transform: 'scale(1.05) translateY(-2px)',
                boxShadow: '0 15px 30px -3px rgba(15, 118, 110, 0.5)',
              },
            }}
          >
            <Badge
              color="error"
              variant="dot"
              invisible={!hasUnread}
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Avatar
                sx={{
                  bgcolor: '#ffffff',
                  color: '#0d9488',
                  width: 38,
                  height: 38,
                  fontWeight: 900,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                🩺
              </Avatar>
            </Badge>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Clinical Intake Bot
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.725rem' }}>
                All symptoms • Online now
              </Typography>
            </Box>
          </Box>
        </Zoom>
      )}

      {/* 2. EXPANDED POPUP CHAT DIALOG */}
      {isOpen && (
        <Paper
          elevation={12}
          sx={{
            width: { xs: 'calc(100vw - 32px)', sm: 460 },
            maxWidth: '100vw',
            height: { xs: 'calc(100vh - 100px)', sm: 620 },
            maxHeight: 700,
            borderRadius: 3.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1.5px solid #ccfbf1',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.25)',
            bgcolor: '#ffffff',
          }}
        >
          {/* Header */}
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
              <Avatar sx={{ bgcolor: '#ffffff', color: '#0f766e', width: 36, height: 36, fontWeight: 900 }}>
                🩺
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Dr. Butterfly Clinical Triage
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                  Patient-Friendly Multi-Specialty Care
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Reset Intake">
                <IconButton size="small" onClick={initChat} sx={{ color: 'white' }}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Minimize">
                <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                  <MinimizeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
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
                  {msg.text && (
                    <Box
                      sx={{
                        maxWidth: '85%',
                        p: 1.75,
                        borderRadius: 2.5,
                        bgcolor: isPatient ? '#0f766e' : '#ffffff',
                        color: isPatient ? '#ffffff' : '#1e293b',
                        border: isPatient ? 'none' : '1px solid #e2e8f0',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.text}
                    </Box>
                  )}

                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.675rem', mt: 0.4 }}>
                    {msg.timestamp}
                  </Typography>

                  {/* Visual Feeling Selector Cards */}
                  {msg.type === 'initial_selector' && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e', mb: 1, display: 'block' }}>
                        CHOOSE YOUR SENSATION:
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 1,
                        }}
                      >
                        {UNIVERSAL_FEELING_OPTIONS.slice(0, 8).map((item) => (
                          <Paper
                            key={item.id}
                            elevation={0}
                            onClick={() => handleSelectSystem(item)}
                            sx={{
                              p: 1.25,
                              borderRadius: 2.5,
                              cursor: 'pointer',
                              bgcolor: '#ffffff',
                              border: '1.5px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                borderColor: item.accentColor,
                                bgcolor: item.bgPastel,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: item.bgPastel,
                                color: item.accentColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {renderIcon(item.iconName, 18, item.accentColor)}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block' }}>
                                {item.label}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Customized Issue Cards */}
                  {msg.type === 'custom_issues' && msg.systemOption && (
                    <Paper
                      elevation={0}
                      sx={{
                        width: '100%',
                        p: 2,
                        mt: 1,
                        borderRadius: 2.5,
                        bgcolor: '#ffffff',
                        border: '1.5px solid #0d9488',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                        Specific Checks for {msg.systemOption.label}:
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 1.5 }}>
                        {msg.systemOption.customIssues[0]?.options.map((opt) => {
                          const isSelected = selectedCustomIssues.includes(opt.id);
                          return (
                            <Box
                              key={opt.id}
                              onClick={() => handleToggleIssue(opt.id)}
                              sx={{
                                p: 1,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: isSelected ? '#0d9488' : '#e2e8f0',
                                bgcolor: isSelected ? '#f0fdfa' : '#ffffff',
                                color: isSelected ? '#0f766e' : '#334155',
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor: isSelected ? '#0d9488' : '#cbd5e1',
                                  bgcolor: isSelected ? '#0d9488' : 'transparent',
                                }}
                              />
                              {opt.label}
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Pain scale */}
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                        Discomfort severity (1-10): <strong>{painScore}/10</strong>
                      </Typography>
                      <Slider
                        size="small"
                        value={painScore}
                        min={1}
                        max={10}
                        onChange={(_, v) => setPainScore(v as number)}
                        sx={{ color: '#0f766e', mb: 1.5 }}
                      />

                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleGenerateTriage(selectedCustomIssues, painScore)}
                        sx={{ bgcolor: '#0f766e', fontWeight: 800, textTransform: 'none' }}
                      >
                        Submit & View Doctor Match
                      </Button>
                    </Paper>
                  )}

                  {/* Triage & Doctor Result Card */}
                  {msg.type === 'triage_result' && msg.triageResult && msg.matchedDoctor && (
                    <Paper
                      elevation={0}
                      sx={{
                        width: '100%',
                        p: 2,
                        mt: 1,
                        borderRadius: 2.5,
                        border: '2px solid',
                        borderColor: msg.triageResult.urgencyColor,
                        bgcolor: '#ffffff',
                      }}
                    >
                      <Chip
                        label={msg.triageResult.urgencyLabel}
                        size="small"
                        sx={{
                          bgcolor: `${msg.triageResult.urgencyColor}15`,
                          color: msg.triageResult.urgencyColor,
                          fontWeight: 900,
                          fontSize: '0.7rem',
                          mb: 1,
                          height: 24,
                        }}
                      />

                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {msg.triageResult.summaryTitle}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#334155', display: 'block', my: 1, lineHeight: 1.4 }}>
                        {msg.triageResult.plainEnglishExplanation}
                      </Typography>

                      <Box sx={{ p: 1.25, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', my: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e', display: 'block' }}>
                          RECOMMENDED CLINICIAN:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {msg.matchedDoctor.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          {msg.matchedDoctor.title} • {msg.matchedDoctor.clinicName}
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        startIcon={<CalendarMonthIcon />}
                        onClick={() => {
                          if (onBookAppointmentClick) {
                            onBookAppointmentClick(msg.matchedDoctor);
                          }
                        }}
                        sx={{ bgcolor: '#0f766e', fontWeight: 800, textTransform: 'none', mb: 0.5 }}
                      >
                        Book Visit ({msg.matchedDoctor.nextSlot})
                      </Button>
                    </Paper>
                  )}
                </Box>
              );
            })}
            <div ref={chatEndRef} />
          </Box>

          {/* Input Bar */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask Dr. Butterfly or describe your issue..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: '0.85rem' } }}
            />
            <IconButton
              onClick={handleSendMessage}
              sx={{ bgcolor: '#0f766e', color: 'white', '&:hover': { bgcolor: '#0d9488' } }}
              size="small"
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
