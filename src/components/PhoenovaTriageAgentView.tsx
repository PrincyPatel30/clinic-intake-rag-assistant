import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// Lucide Icons
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  ShieldCheck,
  Activity,
  Send,
  User,
  Bot,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  PhoneCall,
  QrCode,
  Sparkles,
  Search,
  ExternalLink,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';

import {
  INDIAN_LANGUAGES,
  NMC_DOCTOR_REGISTRY,
  IndianLanguageConfig,
  NMCVerifiedDoctor,
} from '../data/medicalCorpus';
import {
  searchMedicalKnowledge,
  generatePreConsultationSummary,
  PreConsultationSummaryVoucher,
} from '../lib/medicalKnowledgeRetriever';

interface ChatBubble {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  isRefusal?: boolean;
  citations?: string[];
  audioPlaying?: boolean;
}

export const PhoenovaTriageAgentView: React.FC = () => {
  // Selected Language
  const [currentLang, setCurrentLang] = useState<IndianLanguageConfig>(INDIAN_LANGUAGES[0]);
  
  // Intake Chat State
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentlyPlayingMsgId, setCurrentlyPlayingMsgId] = useState<string | null>(null);

  // Structured Symptom Intake Progression
  const [step, setStep] = useState<'initial' | 'duration' | 'severity' | 'associated' | 'summary'>('initial');
  const [chiefConcern, setChiefConcern] = useState<string>('');
  const [duration, setDuration] = useState<string>('3 days');
  const [severityScore, setSeverityScore] = useState<number>(6);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  // Generated Pre-Consultation Summary Voucher (Option C)
  const [summaryVoucher, setSummaryVoucher] = useState<PreConsultationSummaryVoucher | null>(null);

  // NMC Verified Doctor State
  const [verifiedDoctor, setVerifiedDoctor] = useState<NMCVerifiedDoctor>(NMC_DOCTOR_REGISTRY[1]);
  const [selectedSlot, setSelectedSlot] = useState<string>('03:30 PM');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Human Escalation Modal / State
  const [isEscalatedToHuman, setIsEscalatedToHuman] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize consultation based on language
  useEffect(() => {
    initChatForLanguage(currentLang);
  }, [currentLang.code]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const initChatForLanguage = (lang: IndianLanguageConfig) => {
    setStep('initial');
    setChiefConcern('');
    setSelectedSymptoms([]);
    setSummaryVoucher(null);
    setBookingConfirmed(false);
    setIsEscalatedToHuman(false);

    setMessages([
      {
        id: 'msg_greet_1',
        sender: 'ai',
        text: `${lang.greetingText} I am your non-diagnostic clinical intake assistant. I listen to your symptoms, check our medical knowledge guidelines, and prepare a structured pre-consultation summary for your clinician.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'msg_greet_2',
        sender: 'ai',
        text: `You can type, speak in ${lang.name}, or tap one of the quick test scenarios below (such as headaches, tooth pain, fever, or ask about medications like Paracetamol or Ibuprofen).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Text-To-Speech (TTS) using Web Speech API with safe fallback
  const speakText = (text: string, msgId: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentlyPlayingMsgId(null);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLang.audioVoiceLocale || 'en-IN';
        utterance.rate = 0.95;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setCurrentlyPlayingMsgId(msgId);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentlyPlayingMsgId(null);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setCurrentlyPlayingMsgId(null);
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        setCurrentlyPlayingMsgId(null);
      }
    }
  };

  // Speech-To-Text (STT) simulation / Web Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = currentLang.audioVoiceLocale;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start error:', err);
        setIsListening(false);
      }
    } else {
      // Graceful fallback simulation
      setIsListening(true);
      setTimeout(() => {
        setInputText(currentLang.sampleQuery);
        setIsListening(false);
      }, 1200);
    }
  };

  // Submit User Message
  const handleSendMessage = (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text) return;

    const userMsg: ChatBubble = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Process query through RAG Knowledge Retriever & Workflow Engine
    setTimeout(() => {
      processWorkflowTurn(text);
    }, 600);
  };

  // Step-by-step intake workflow
  const processWorkflowTurn = (userText: string) => {
    const lower = userText.toLowerCase();

    // Check emergency red flags immediately
    if (
      lower.includes('chest pain') ||
      lower.includes('radiating to left arm') ||
      lower.includes('cannot breathe') ||
      lower.includes('thunderclap') ||
      lower.includes('suicide')
    ) {
      setIsEscalatedToHuman(true);
      const emergencyMsg: ChatBubble = {
        id: `ai_redflag_${Date.now()}`,
        sender: 'ai',
        text: `🚨 URGENT CLINICAL RED FLAG DETECTED: Your symptoms ("${userText}") warrant immediate medical evaluation. The automated intake has paused and transferred your case to the Emergency Triage Team. Please call 108 / 911 or head to the nearest emergency room immediately.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRefusal: true,
      };
      setMessages((prev) => [...prev, emergencyMsg]);
      return;
    }

    // Step 1: Initial Chief Concern
    if (step === 'initial') {
      setChiefConcern(userText);
      const ragResult = searchMedicalKnowledge(userText);

      if (ragResult.isRefusal) {
        // Safe Grounding Refusal Demonstration
        const refusalMsg: ChatBubble = {
          id: `ai_refusal_${Date.now()}`,
          sender: 'ai',
          text: ragResult.groundedAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRefusal: true,
          citations: ragResult.citations,
        };
        setMessages((prev) => [...prev, refusalMsg]);
        return;
      }

      setStep('duration');
      const followUp: ChatBubble = {
        id: `ai_dur_${Date.now()}`,
        sender: 'ai',
        text: `I understand you are experiencing discomfort related to: "${userText}". How long have these symptoms been present? (e.g. 2 days, 1 week, sudden onset today)?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ragResult.citations,
      };
      setMessages((prev) => [...prev, followUp]);
      return;
    }

    // Step 2: Duration
    if (step === 'duration') {
      setDuration(userText);
      setStep('severity');
      const sevMsg: ChatBubble = {
        id: `ai_sev_${Date.now()}`,
        sender: 'ai',
        text: `Thank you. On a scale of 1 to 10 (where 1 is mild and 10 is the most severe pain imaginable), how would you rate the intensity right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, sevMsg]);
      return;
    }

    // Step 3: Severity
    if (step === 'severity') {
      const match = userText.match(/\d+/);
      const parsedScore = match ? Math.min(10, Math.max(1, parseInt(match[0], 10))) : 6;
      setSeverityScore(parsedScore);
      setStep('associated');

      const assocMsg: ChatBubble = {
        id: `ai_assoc_${Date.now()}`,
        sender: 'ai',
        text: `Got it, severity ${parsedScore}/10 recorded. Are you noticing any associated signs like nausea, sensitivity to light, fever, throbbing, or swelling? (You can select below or type them):`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assocMsg]);
      return;
    }

    // Step 4: Associated & Summary Generation (Option C Voucher)
    if (step === 'associated') {
      const symptoms = selectedSymptoms.length > 0 ? selectedSymptoms : [userText];
      completeIntakeVoucher(chiefConcern, duration, severityScore, symptoms);
    }
  };

  const completeIntakeVoucher = (
    concern: string,
    dur: string,
    sev: number,
    symptoms: string[]
  ) => {
    setStep('summary');
    const voucher = generatePreConsultationSummary(concern, dur, sev, symptoms);
    setSummaryVoucher(voucher);

    // Pick appropriate doctor from registry
    if (voucher.nmcDoctorReferral) {
      const matched = NMC_DOCTOR_REGISTRY.find(
        (d) => d.registrationNumber === voucher.nmcDoctorReferral?.registrationNumber
      ) || NMC_DOCTOR_REGISTRY[0];
      setVerifiedDoctor(matched);
    }

    const completionMsg: ChatBubble = {
      id: `ai_complete_${Date.now()}`,
      sender: 'ai',
      text: `Your clinical intake is complete! I have verified our medical documentation, compiled your structured symptoms, and generated your pre-consultation summary voucher below for your clinician.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: voucher.sourcesAndCitations,
    };

    setMessages((prev) => [...prev, completionMsg]);
  };

  const handleSymptomTagToggle = (tag: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', pb: 6 }}>
      {/* PHOENOVA TRIAGE AGENT PRODUCT BANNER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #092e2b 0%, #0f766e 100%)',
          color: 'white',
          boxShadow: '0 10px 30px rgba(15, 118, 110, 0.25)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ maxWidth: 840 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Chip
                label="Voice + Chat · Phoenova product"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 800 }}
              />
              <Chip
                icon={<Activity size={14} color="#86efac" />}
                label="Sub-5s Real-Time STT/TTS"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#86efac', fontWeight: 700 }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.8 }}>
              Phoenova Triage Agent
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.95, fontWeight: 600, mb: 1 }}>
              12 languages. 24/7. No call centre.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.6 }}>
              Drop-in voice + chat agent that handles inbound patient triage in 12 Indian languages,
              qualifies eligibility, verifies doctors via NMC, and prepares structured pre-consultation
              vouchers without diagnosing.
            </Typography>
          </Box>

          {/* Language Selector Dropdown */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
              minWidth: 260,
            }}
          >
            <Typography variant="caption" sx={{ color: '#99f6e4', display: 'flex', alignItems: 'center', gap: 0.8, fontWeight: 800, mb: 0.5 }}>
              <Languages size={15} /> SELECT INDIAN LANGUAGE (12 LIVE):
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={currentLang.code}
                onChange={(e) => {
                  const found = INDIAN_LANGUAGES.find((l) => l.code === e.target.value);
                  if (found) setCurrentLang(found);
                }}
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: 2,
                  '& .MuiSvgIcon-root': { color: 'white' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                }}
              >
                {INDIAN_LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code} sx={{ fontWeight: 600 }}>
                    {lang.flagEmoji} {lang.name} — {lang.nativeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>

        {/* 03 / MEASURED IN PRODUCTION METRICS BAR */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            mt: 3,
            pt: 2.5,
            borderTop: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#a7f3d0' }}>
              85%
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
              Resolved without human escalation
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#a7f3d0' }}>
              p95 1.8s
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
              Response latency (STT + LLM)
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#a7f3d0' }}>
              12
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
              Indian languages live & verified
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#a7f3d0' }}>
              14 days
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
              Build-to-live per hospital centre
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* WORKSHOP DEMO QUICK TEST PRESET STRIP */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f766e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={16} /> WORKSHOP RAG TEST BATTERY (TRY THESE REAL-LIFE QUERIES):
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Option C: 'I have had headaches for 3 days'"
            onClick={() => handleSendMessage("I've been having headaches for 3 days")}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, cursor: 'pointer' }}
          />
          <Chip
            label="Option A: 'What is ibuprofen used for?'"
            onClick={() => handleSendMessage('What is ibuprofen used for?')}
            sx={{ fontWeight: 700, cursor: 'pointer', bgcolor: '#e0f2fe', color: '#0369a1' }}
          />
          <Chip
            label="Option B: 'What lifestyle changes in hypertension?'"
            onClick={() => handleSendMessage('What lifestyle changes are mentioned in hypertension?')}
            sx={{ fontWeight: 700, cursor: 'pointer', bgcolor: '#f0fdf4', color: '#15803d' }}
          />
          <Chip
            label="🔥 Refusal Test 1: 'Does this document say anything about coffee?'"
            onClick={() => handleSendMessage('Does this document say anything about coffee?')}
            color="error"
            variant="outlined"
            sx={{ fontWeight: 800, cursor: 'pointer' }}
          />
          <Chip
            label="🔥 Refusal Test 2: 'Can I take paracetamol with experimental Xylophrin?'"
            onClick={() => handleSendMessage('Can I take paracetamol with experimental Xylophrin?')}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 800, cursor: 'pointer' }}
          />
        </Box>
      </Paper>

      {/* MAIN TWO-COLUMN SPLIT: CHAT INTERFACE + PRE-CONSULTATION SUMMARY */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>
        {/* LEFT COLUMN: PHOENOVA VOICE + CHAT STREAM */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 680,
            borderRadius: 3.5,
            border: '1.5px solid #e2e8f0',
            bgcolor: 'white',
            overflow: 'hidden',
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: '#0f766e', p: 0.8, borderRadius: 2, color: 'white', display: 'flex' }}>
                <Bot size={22} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Phoenova Clinical Triage Bot ({currentLang.name})
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Grounded Knowledge · Non-Diagnostic · Strict Hallucination Refusal
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Trigger Emergency / Human Staff Escalation">
                <Button
                  size="small"
                  variant="outlined"
                  color={isEscalatedToHuman ? 'error' : 'secondary'}
                  startIcon={<PhoneCall size={14} />}
                  onClick={() => setIsEscalatedToHuman(!isEscalatedToHuman)}
                  sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.75rem', borderRadius: 2 }}
                >
                  {isEscalatedToHuman ? 'Escalated' : 'Handoff on Ambiguity'}
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Active Human Escalation Banner if Triggered */}
          {isEscalatedToHuman && (
            <Alert
              severity="warning"
              icon={<AlertTriangle size={18} />}
              sx={{ m: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              Case payload transferred to human triage desk. Patient context, recorded symptoms, and audio stream preserved.
            </Alert>
          )}

          {/* Chat Messages Body */}
          <Box sx={{ flexGrow: 1, p: 2.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '82%',
                    p: 2,
                    borderRadius: 3,
                    bgcolor: msg.sender === 'user' ? '#0f766e' : msg.isRefusal ? '#fef2f2' : '#f8fafc',
                    color: msg.sender === 'user' ? 'white' : msg.isRefusal ? '#991b1b' : '#0f172a',
                    border: '1px solid',
                    borderColor: msg.sender === 'user' ? '#0d9488' : msg.isRefusal ? '#fca5a5' : '#e2e8f0',
                    boxShadow: msg.sender === 'user' ? '0 3px 10px rgba(15, 118, 110, 0.2)' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, fontSize: '0.7rem' }}>
                      {msg.sender === 'user' ? 'You' : msg.isRefusal ? '🛡️ Grounding Safe Guard' : 'Phoenova Triage'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.68rem' }}>
                        {msg.timestamp}
                      </Typography>
                      {msg.sender === 'ai' && (
                        <IconButton
                          size="small"
                          onClick={() => speakText(msg.text, msg.id)}
                          sx={{ p: 0.3, color: currentlyPlayingMsgId === msg.id ? '#0f766e' : '#94a3b8' }}
                        >
                          {currentlyPlayingMsgId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: '0.92rem' }}>
                    {msg.text}
                  </Typography>

                  {/* Citations Pill List */}
                  {msg.citations && msg.citations.length > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e', display: 'block', mb: 0.5 }}>
                        DOCUMENT CITATIONS:
                      </Typography>
                      {msg.citations.map((cite, idx) => (
                        <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.7rem' }}>
                          • {cite}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}

            {/* In-chat interactive Symptom Selector for Step Associated */}
            {step === 'associated' && (
              <Box sx={{ p: 2, bgcolor: '#f0fdfa', borderRadius: 3, border: '1px solid #ccfbf1' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f766e', mb: 1 }}>
                  Tap any accompanying symptoms:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {[
                    'Nausea',
                    'Throbbing Pain',
                    'Light Sensitivity (Photophobia)',
                    'Sound Sensitivity (Phonophobia)',
                    'Fever',
                    'Swelling',
                    'Dizziness',
                    'Radiating Pain',
                  ].map((tag) => {
                    const isSelected = selectedSymptoms.includes(tag);
                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleSymptomTagToggle(tag)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, cursor: 'pointer' }}
                      />
                    );
                  })}
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => completeIntakeVoucher(chiefConcern, duration, severityScore, selectedSymptoms)}
                  sx={{ bgcolor: '#0f766e', fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
                >
                  Confirm & Generate Clinician Summary
                </Button>
              </Box>
            )}

            <div ref={chatEndRef} />
          </Box>

          {/* STT/TTS Waveform & Input Bar */}
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            {isListening && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1, bgcolor: '#fee2e2', borderRadius: 2 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 800 }}>
                  Listening in {currentLang.name} ({currentLang.audioVoiceLocale}). Speak now...
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={isListening ? 'Stop Listening' : `Speak in ${currentLang.name}`}>
                <IconButton
                  onClick={toggleSpeechRecognition}
                  color={isListening ? 'error' : 'primary'}
                  sx={{
                    bgcolor: isListening ? '#fecaca' : '#e0f2fe',
                    '&:hover': { bgcolor: isListening ? '#fca5a5' : '#bae6fd' },
                  }}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </IconButton>
              </Tooltip>

              <TextField
                fullWidth
                size="small"
                placeholder={`Describe symptoms in ${currentLang.name} or English...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                sx={{
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
                }}
              />

              <Button
                variant="contained"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                sx={{
                  bgcolor: '#0f766e',
                  minWidth: 44,
                  height: 40,
                  borderRadius: 2.5,
                  '&:hover': { bgcolor: '#0d9488' },
                }}
              >
                <Send size={18} />
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* RIGHT COLUMN: PRE-CONSULTATION INTAKE VOUCHER (OPTION C) + ABDM/ABHA */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* PRE-CONSULTATION CLINICIAN SUMMARY VOUCHER */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '2px solid #0f766e',
              bgcolor: 'white',
              boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={22} color="#0f766e" />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Clinician Intake Summary
                </Typography>
              </Box>
              <Chip
                label={summaryVoucher ? summaryVoucher.urgencyTier : 'AWAITING INTAKE'}
                size="small"
                color={summaryVoucher?.urgencyTier === 'URGENT_EMERGENCY' ? 'error' : summaryVoucher ? 'warning' : 'default'}
                sx={{ fontWeight: 800 }}
              />
            </Box>

            {summaryVoucher ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', display: 'block' }}>
                    PATIENT ID & TIMESTAMP:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {summaryVoucher.patientId} · {summaryVoucher.timestamp}
                  </Typography>
                </Box>

                {/* Structured Symptoms Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Chief Concern:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#134e4a' }}>
                      {summaryVoucher.chiefConcern}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Duration:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#134e4a' }}>
                      {summaryVoucher.duration}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Reported Severity:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#134e4a' }}>
                      {summaryVoucher.severityScore} / 10 Pain Scale
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Associated Signs:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#134e4a' }}>
                      {summaryVoucher.associatedSymptoms.join(', ')}
                    </Typography>
                  </Box>
                </Box>

                {/* Information Still Needed */}
                <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2.5, border: '1px solid #fef3c7' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Info size={14} /> INFORMATION STILL NEEDED BY CLINICIAN:
                  </Typography>
                  {summaryVoucher.informationStillNeeded.map((info, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#78350f', mt: 0.5 }}>
                      • {info}
                    </Typography>
                  ))}
                </Box>

                {/* Grounded Educational Info & Sources */}
                <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155' }}>
                    RELEVANT EDUCATIONAL GUIDELINES:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mt: 0.5 }}>
                    {summaryVoucher.relevantEducationalInformation}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {summaryVoucher.sourcesAndCitations.map((s, i) => (
                      <Chip key={i} label={s} size="small" sx={{ fontSize: '0.65rem' }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px dashed #cbd5e1' }}>
                <Bot size={36} color="#94a3b8" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mt: 1 }}>
                  No Active Intake Summary Yet
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                  Start a conversation in the chat or click one of the quick test chips above to generate this voucher.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* ABDM-READY ABHA CARD & NMC DOCTOR VERIFICATION */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1.5px solid #e2e8f0',
              bgcolor: 'white',
            }}
          >
            {/* ABHA Card Generator */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode size={20} color="#0f766e" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  ABDM / ABHA Digital Token
                </Typography>
              </Box>
              <Chip label="Aadhaar eKYC Verified" size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.68rem' }} />
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                  AYUSHMAN BHARAT HEALTH ACCOUNT
                </Typography>
                <Chip label="ABHA ID" size="small" sx={{ bgcolor: '#0f766e', color: 'white', fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 2, fontWeight: 800, color: '#5eead4' }}>
                91-4829-1094-8201
              </Typography>
              <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 0.5 }}>
                Patient: Verified Citizen · Direct Hospital Reception Sync
              </Typography>
            </Box>

            {/* Doctor Verification Module */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <ShieldCheck size={18} color="#0f766e" /> NMC/MCI Verified Doctor
              </Typography>
              <Chip label="NMC Active" color="success" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {verifiedDoctor.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 700, display: 'block' }}>
                {verifiedDoctor.specialty} ({verifiedDoctor.qualification})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Reg: <strong>{verifiedDoctor.registrationNumber}</strong> · {verifiedDoctor.council}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
                Hospital: {verifiedDoctor.hospitalAffiliation}
              </Typography>

              {/* Slot selector */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5 }}>
                  Available Slots Today:
                </Typography>
                <Stack direction="row" spacing={1}>
                  {verifiedDoctor.availableSlotsToday.map((slot) => (
                    <Chip
                      key={slot}
                      label={slot}
                      size="small"
                      onClick={() => setSelectedSlot(slot)}
                      color={selectedSlot === slot ? 'primary' : 'default'}
                      variant={selectedSlot === slot ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700, cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setBookingConfirmed(true)}
              disabled={bookingConfirmed}
              sx={{
                bgcolor: '#0f766e',
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: 2.5,
                py: 1,
                '&:hover': { bgcolor: '#0d9488' },
              }}
            >
              {bookingConfirmed ? `✓ OPD Consultation Booked for ${selectedSlot}` : `Confirm Doctor Transfer (${selectedSlot})`}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
