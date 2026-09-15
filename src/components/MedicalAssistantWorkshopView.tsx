import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// Lucide Icons
import {
  Pill,
  BookOpen,
  ClipboardList,
  Cpu,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  ChevronDown,
  Shield,
  ArrowRight,
  Database,
  BrainCircuit,
  CornerDownRight,
  Terminal,
} from 'lucide-react';

import { REALISTIC_MEDICAL_DOCS, MedicalKnowledgeDoc } from '../data/medicalCorpus';
import {
  searchMedicalKnowledge,
  generatePreConsultationSummary,
  MedicalRetrievalResult,
  PreConsultationSummaryVoucher,
} from '../lib/medicalKnowledgeRetriever';

export const MedicalAssistantWorkshopView: React.FC = () => {
  // Workshop sub-tab: Option A, Option B, Option C, or RAG Flow Architecture
  const [activeTab, setActiveTab] = useState<number>(0);

  // Option A (Medication Assistant) State
  const [medQuery, setMedQuery] = useState<string>('What is ibuprofen used for?');
  const [medResult, setMedResult] = useState<MedicalRetrievalResult | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('MED-IBUPROFEN');

  // Option B (Patient Education) State
  const [eduQuery, setEduQuery] = useState<string>('What lifestyle changes are in hypertension?');
  const [eduResult, setEduResult] = useState<MedicalRetrievalResult | null>(null);

  // Option C (Pre-Consultation Intake) State
  const [chiefConcern, setChiefConcern] = useState<string>("I've had headaches for 3 days on the right side");
  const [duration, setDuration] = useState<string>('3 days');
  const [severity, setSeverity] = useState<number>(7);
  const [symptomsInput, setSymptomsInput] = useState<string>('Nausea, Sensitivity to light, Throbbing');
  const [intakeVoucher, setIntakeVoucher] = useState<PreConsultationSummaryVoucher | null>(null);

  // Architecture Simulation & Temperature
  const [archQuery, setArchQuery] = useState<string>('Can I take paracetamol for mild headache with fever?');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [archResult, setArchResult] = useState<MedicalRetrievalResult | null>(null);

  // Run Option A Query
  const handleRunMedQuery = (queryToRun?: string) => {
    const q = queryToRun || medQuery;
    const res = searchMedicalKnowledge(q);
    setMedResult(res);
  };

  // Run Option B Query
  const handleRunEduQuery = (queryToRun?: string) => {
    const q = queryToRun || eduQuery;
    const res = searchMedicalKnowledge(q);
    setEduResult(res);
  };

  // Run Option C Intake Summary
  const handleGenerateIntake = () => {
    const syms = symptomsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const voucher = generatePreConsultationSummary(chiefConcern, duration, severity, syms);
    setIntakeVoucher(voucher);
  };

  // Run Architecture Trace
  const handleRunArchQuery = () => {
    const res = searchMedicalKnowledge(archQuery);
    setArchResult(res);
  };

  // Filter docs for inspection
  const medicationDocs = REALISTIC_MEDICAL_DOCS.filter((d) => d.category === 'medication');
  const patientEduDocs = REALISTIC_MEDICAL_DOCS.filter((d) => d.category === 'patient_education');

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', pb: 6 }}>
      {/* WORKSHOP HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 3,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: 'white',
          boxShadow: '0 10px 30px rgba(49, 46, 129, 0.25)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Chip
            icon={<BrainCircuit size={15} color="#c7d2fe" />}
            label="Workshop RAG Stack Architecture"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 800 }}
          />
          <Chip
            label="Strict Grounding · Non-Diagnostic"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#a5b4fc', fontWeight: 700 }}
          />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1 }}>
          Medical Patient Education & Intake Assistant
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 960, lineHeight: 1.6 }}>
          A small, impressive medical AI system demonstrating the complete pipeline:
          <strong> LLM → chat → memory → embeddings → vector DB → retrieval → RAG → working application</strong>.
          It does NOT diagnose. It explains documented facts, collects structured symptoms, surfaces urgent flags,
          and prepares clinician summaries.
        </Typography>

        {/* WORKSHOP PIPELINE FLOW DIAGRAM */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
            mt: 3,
            p: 1.5,
            bgcolor: 'rgba(0,0,0,0.25)',
            borderRadius: 2.5,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {['Patient Utterance', 'Chat Memory', 'Dense + BM25', 'Vector Retriever', 'Grounding Guard', 'Gemini Flash', 'Structured Summary'].map(
            (stepLabel, i) => (
              <React.Fragment key={i}>
                <Box
                  sx={{
                    px: 1.8,
                    py: 0.6,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#e0e7ff',
                  }}
                >
                  {i + 1}. {stepLabel}
                </Box>
                {i < 6 && <ArrowRight size={14} color="#818cf8" />}
              </React.Fragment>
            )
          )}
        </Box>
      </Paper>

      {/* WORKSHOP TABS: OPTION A, OPTION B, OPTION C, FULL RAG STACK */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid #f1f5f9',
            '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', minHeight: 56, fontSize: '0.95rem' },
          }}
        >
          <Tab icon={<Pill size={18} />} iconPosition="start" label="Option A: Medication Assistant" />
          <Tab icon={<BookOpen size={18} />} iconPosition="start" label="Option B: Patient Education" />
          <Tab icon={<ClipboardList size={18} />} iconPosition="start" label="Option C: Pre-Consultation Intake" />
          <Tab icon={<Layers size={18} />} iconPosition="start" label="Interactive RAG Flow & Refusal Testing" />
        </Tabs>
      </Paper>

      {/* ================= TAB 0: OPTION A (MEDICATION ASSISTANT) ================= */}
      {activeTab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>
          {/* Left Column: Interactive Query & Retrieval */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pill size={20} color="#3b82f6" /> Option A: Medication Assistant Testing
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
                Verified monographs for <strong>Paracetamol, Ibuprofen, Amoxicillin, Metformin, and Cetirizine</strong>.
                Test indications, standard dosing, contraindications, and red flags.
              </Typography>

              {/* Sample Queries */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                <Chip
                  label="What is ibuprofen used for?"
                  onClick={() => {
                    setMedQuery('What is ibuprofen used for?');
                    handleRunMedQuery('What is ibuprofen used for?');
                  }}
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label="Can I take amoxicillin for cold & flu?"
                  onClick={() => {
                    setMedQuery('Can I take amoxicillin for cold & flu?');
                    handleRunMedQuery('Can I take amoxicillin for cold & flu?');
                  }}
                  variant="outlined"
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label="Maximum daily dose of paracetamol?"
                  onClick={() => {
                    setMedQuery('Maximum daily dose of paracetamol?');
                    handleRunMedQuery('Maximum daily dose of paracetamol?');
                  }}
                  variant="outlined"
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label="🔥 Refusal Test: 'Can I take paracetamol with experimental Xylophrin?'"
                  onClick={() => {
                    setMedQuery('Can I take paracetamol with experimental Xylophrin?');
                    handleRunMedQuery('Can I take paracetamol with experimental Xylophrin?');
                  }}
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 800, cursor: 'pointer' }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={medQuery}
                  onChange={(e) => setMedQuery(e.target.value)}
                  placeholder="Ask about paracetamol, ibuprofen, amoxicillin, metformin, cetirizine..."
                  onKeyDown={(e) => e.key === 'Enter' && handleRunMedQuery()}
                />
                <Button
                  variant="contained"
                  onClick={() => handleRunMedQuery()}
                  sx={{ bgcolor: '#3b82f6', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: 2 }}
                >
                  Retrieve & Answer
                </Button>
              </Box>
            </Paper>

            {/* Retrieval Result Card */}
            {medResult && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1.5px solid',
                  borderColor: medResult.isRefusal ? '#fca5a5' : '#bfdbfe',
                  bgcolor: medResult.isRefusal ? '#fff5f5' : '#f8faff',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: medResult.isRefusal ? '#b91c1c' : '#1e40af' }}>
                    {medResult.isRefusal ? '🛡️ Strict Grounding Safe Guard Triggered' : '✓ Grounded Non-Diagnostic Answer'}
                  </Typography>
                  <Chip
                    label={medResult.isRefusal ? 'REFUSAL DEMO' : `${medResult.matchedDocs.length} Chunks Matched`}
                    size="small"
                    color={medResult.isRefusal ? 'error' : 'primary'}
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <Typography variant="body1" sx={{ color: '#0f172a', lineHeight: 1.7, whiteSpace: 'pre-line', mb: 2 }}>
                  {medResult.groundedAnswer}
                </Typography>

                {medResult.urgentRedFlags.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontWeight: 700 }}>
                    URGENT RED FLAGS TO NOTE:
                    {medResult.urgentRedFlags.map((flag, idx) => (
                      <div key={idx}>• {flag}</div>
                    ))}
                  </Alert>
                )}

                {medResult.citations.length > 0 && (
                  <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', display: 'block', mb: 0.5 }}>
                      VERIFIED MONOGRAPH CITATIONS:
                    </Typography>
                    {medResult.citations.map((c, i) => (
                      <Typography key={i} variant="caption" sx={{ display: 'block', color: '#475569' }}>
                        • {c}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          {/* Right Column: Verified Document Inspector */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Documented Medication Monographs
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
              Inspect the raw medical facts ingested in the vector corpus:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {medicationDocs.map((doc) => (
                <Accordion key={doc.id} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {doc.genericName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Brands: {doc.brandExamples?.join(', ')}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem', mb: 1.5, whiteSpace: 'pre-line' }}>
                      {doc.documentedContent}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#b91c1c', display: 'block', mb: 0.5 }}>
                      Documented Red Flags:
                    </Typography>
                    {doc.urgentRedFlags.map((flag, idx) => (
                      <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#991b1b' }}>
                        • {flag}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* ================= TAB 1: OPTION B (PATIENT EDUCATION) ================= */}
      {activeTab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookOpen size={20} color="#10b981" /> Option B: Patient Education Assistant
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
                Documented guidelines for <strong>Hypertension, Type 2 Diabetes, Asthma, Migraine, Dehydration</strong>.
                Explains lifestyle, thresholds, and red flags without diagnosing.
              </Typography>

              {/* Sample Queries */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                <Chip
                  label="What lifestyle changes are mentioned in hypertension?"
                  onClick={() => {
                    setEduQuery('What lifestyle changes are mentioned in hypertension?');
                    handleRunEduQuery('What lifestyle changes are mentioned in hypertension?');
                  }}
                  variant="outlined"
                  color="success"
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label="What is the Rule of 15 for low blood sugar?"
                  onClick={() => {
                    setEduQuery('What is the Rule of 15 for low blood sugar?');
                    handleRunEduQuery('What is the Rule of 15 for low blood sugar?');
                  }}
                  variant="outlined"
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label="Emergency signs of an asthma attack?"
                  onClick={() => {
                    setEduQuery('Emergency signs of an asthma attack?');
                    handleRunEduQuery('Emergency signs of an asthma attack?');
                  }}
                  variant="outlined"
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label="🔥 Refusal Test: 'Does this document say anything about coffee?'"
                  onClick={() => {
                    setEduQuery('Does this document say anything about coffee?');
                    handleRunEduQuery('Does this document say anything about coffee?');
                  }}
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 800, cursor: 'pointer' }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={eduQuery}
                  onChange={(e) => setEduQuery(e.target.value)}
                  placeholder="Ask about hypertension, diabetes, asthma, dehydration, migraines..."
                  onKeyDown={(e) => e.key === 'Enter' && handleRunEduQuery()}
                />
                <Button
                  variant="contained"
                  onClick={() => handleRunEduQuery()}
                  sx={{ bgcolor: '#10b981', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: 2 }}
                >
                  Retrieve Guidance
                </Button>
              </Box>
            </Paper>

            {eduResult && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1.5px solid',
                  borderColor: eduResult.isRefusal ? '#fca5a5' : '#a7f3d0',
                  bgcolor: eduResult.isRefusal ? '#fff5f5' : '#f0fdf4',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: eduResult.isRefusal ? '#b91c1c' : '#065f46' }}>
                    {eduResult.isRefusal ? '🛡️ Strict Grounding Safe Guard Refusal' : '✓ Grounded Patient Education'}
                  </Typography>
                  <Chip
                    label={eduResult.isRefusal ? 'REFUSAL VERIFIED' : `${eduResult.matchedDocs.length} Chunks Matched`}
                    size="small"
                    color={eduResult.isRefusal ? 'error' : 'success'}
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <Typography variant="body1" sx={{ color: '#0f172a', lineHeight: 1.7, whiteSpace: 'pre-line', mb: 2 }}>
                  {eduResult.groundedAnswer}
                </Typography>

                {eduResult.urgentRedFlags.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontWeight: 700 }}>
                    URGENT RED FLAGS:
                    {eduResult.urgentRedFlags.map((flag, idx) => (
                      <div key={idx}>• {flag}</div>
                    ))}
                  </Alert>
                )}

                {eduResult.citations.length > 0 && (
                  <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#065f46', display: 'block', mb: 0.5 }}>
                      CLINICAL GUIDELINE CITATIONS:
                    </Typography>
                    {eduResult.citations.map((c, i) => (
                      <Typography key={i} variant="caption" sx={{ display: 'block', color: '#047857' }}>
                        • {c}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Documented Patient Education Protocols
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
              Inspect the clinical definitions and red flags:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {patientEduDocs.map((doc) => (
                <Accordion key={doc.id} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {doc.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem', mb: 1.5, whiteSpace: 'pre-line' }}>
                      {doc.documentedContent}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#b91c1c', display: 'block', mb: 0.5 }}>
                      Documented Red Flags:
                    </Typography>
                    {doc.urgentRedFlags.map((flag, idx) => (
                      <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#991b1b' }}>
                        • {flag}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* ================= TAB 2: OPTION C (PRE-CONSULTATION INTAKE) ================= */}
      {activeTab === 2 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '6fr 6fr' }, gap: 3 }}>
          {/* Intake Input Form */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClipboardList size={20} color="#0f766e" /> Option C: Pre-Consultation Intake Generator
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Collects symptoms and prepares a comprehensive <strong>Structured Intake Voucher</strong> for the clinician.
              Includes missing information analysis, matched educational guidelines, and NMC doctor dispatch.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', mb: 0.5, display: 'block' }}>
                  CHIEF CONCERN / PATIENT UTTERANCE:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={chiefConcern}
                  onChange={(e) => setChiefConcern(e.target.value)}
                  placeholder="e.g. I've been having headaches for 3 days on the right side"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', mb: 0.5, display: 'block' }}>
                    DURATION:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 days"
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', mb: 0.5, display: 'block' }}>
                    SEVERITY PAIN SCORE (1-10): {severity}/10
                  </Typography>
                  <Slider
                    value={severity}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(_, v) => setSeverity(v as number)}
                    valueLabelDisplay="auto"
                    sx={{ color: '#0f766e' }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', mb: 0.5, display: 'block' }}>
                  ASSOCIATED SYMPTOMS (COMMA SEPARATED):
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="Nausea, Sensitivity to light, Throbbing pain"
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleGenerateIntake}
                sx={{
                  bgcolor: '#0f766e',
                  fontWeight: 800,
                  textTransform: 'none',
                  py: 1.2,
                  borderRadius: 2.5,
                  '&:hover': { bgcolor: '#0d9488' },
                }}
              >
                Generate Structured Clinician Summary
              </Button>
            </Box>
          </Paper>

          {/* Generated Clinician Summary Output */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 3,
              border: '2px solid #0f766e',
              bgcolor: 'white',
              boxShadow: '0 10px 25px rgba(15, 118, 110, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Structured Pre-Consultation Summary
              </Typography>
              <Chip
                label={intakeVoucher ? intakeVoucher.urgencyTier : 'READY TO GENERATE'}
                size="small"
                color={intakeVoucher?.urgencyTier === 'URGENT_EMERGENCY' ? 'error' : 'primary'}
                sx={{ fontWeight: 800 }}
              />
            </Box>

            {intakeVoucher ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>
                    PATIENT INTAKE RECORD
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {intakeVoucher.patientId} · {intakeVoucher.timestamp}
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Chief Concern:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#134e4a' }}>
                      {intakeVoucher.chiefConcern}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Duration:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#134e4a' }}>
                      {intakeVoucher.duration}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Severity Score:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#134e4a' }}>
                      {intakeVoucher.severityScore} / 10
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                      Associated Signs:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#134e4a' }}>
                      {intakeVoucher.associatedSymptoms.join(', ')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fef3c7' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#b45309', display: 'block', mb: 0.5 }}>
                    MISSING CLINICAL INFORMATION TO CLARIFY:
                  </Typography>
                  {intakeVoucher.informationStillNeeded.map((item, i) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block', color: '#78350f' }}>
                      • {item}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155' }}>
                    RELEVANT EDUCATIONAL GUIDELINE SUMMARY:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mt: 0.5 }}>
                    {intakeVoucher.relevantEducationalInformation}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
                    Citations: {intakeVoucher.sourcesAndCitations.join(', ')}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                <ClipboardList size={40} color="#94a3b8" />
                <Typography variant="subtitle2" sx={{ color: '#64748b', mt: 1 }}>
                  Click "Generate Structured Clinician Summary" to view
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* ================= TAB 3: INTERACTIVE RAG FLOW & REFUSAL TESTING ================= */}
      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Layers size={20} color="#6366f1" /> Interactive RAG Pipeline & Hallucination Resistance
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Trace each stage of the pipeline: <strong>Input → Memory → Embeddings → Hybrid Retrieval → Safe Refusal Guard → Non-Diagnostic Output</strong>.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' }, gap: 2.5, mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Test Query / Patient Utterance"
                value={archQuery}
                onChange={(e) => setArchQuery(e.target.value)}
                placeholder="Type query to trace through RAG pipeline..."
              />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Generation Temperature:</span>
                  <span>{temperature.toFixed(2)}</span>
                </Typography>
                <Slider
                  value={temperature}
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  onChange={(_, v) => setTemperature(v as number)}
                  valueLabelDisplay="auto"
                  sx={{ color: '#6366f1' }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={handleRunArchQuery}
                sx={{ bgcolor: '#6366f1', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: 2 }}
              >
                Execute Pipeline Trace
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setArchQuery('Does this document say anything about coffee?');
                  const res = searchMedicalKnowledge('Does this document say anything about coffee?');
                  setArchResult(res);
                }}
                sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
              >
                🔥 Run Coffee Refusal Test
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {
                  setArchQuery('Can I take paracetamol with experimental Xylophrin?');
                  const res = searchMedicalKnowledge('Can I take paracetamol with experimental Xylophrin?');
                  setArchResult(res);
                }}
                sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
              >
                🔥 Run Unknown Drug Refusal Test
              </Button>
            </Box>
          </Paper>

          {/* RAG Telemetry Flow Steps */}
          {archResult && (
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Live Pipeline Execution Telemetry
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Step 1 */}
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#6366f1' }}>
                    1. USER UTTERANCE:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    "{archResult.query}"
                  </Typography>
                </Box>

                {/* Step 2 */}
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#6366f1' }}>
                    2. HYBRID RETRIEVAL & VECTOR SEARCH:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155' }}>
                    Matched Chunks: <strong>{archResult.matchedDocs.length}</strong> · Top Candidate Score: {archResult.matchedDocs[0]?.score || 0}
                  </Typography>
                  {archResult.matchedDocs.map((chunk, i) => (
                    <Box key={i} sx={{ mt: 1, p: 1, bgcolor: '#f1f5f9', borderRadius: 1.5, fontSize: '0.8rem' }}>
                      <strong>[{chunk.docTitle} - {chunk.sectionTitle}]:</strong> {chunk.snippet}
                    </Box>
                  ))}
                </Box>

                {/* Step 3: Refusal / Safety Guard */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: archResult.isRefusal ? '#fff5f5' : '#f0fdf4',
                    borderRadius: 2,
                    border: '1.5px solid',
                    borderColor: archResult.isRefusal ? '#fca5a5' : '#86efac',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: archResult.isRefusal ? '#b91c1c' : '#15803d' }}>
                    3. GROUNDING SAFE GUARD & HALLUCINATION REFUSAL:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: archResult.isRefusal ? '#991b1b' : '#14532d' }}>
                    {archResult.isRefusal ? `Refusal Triggered: ${archResult.refusalReason}` : 'Passed: Query fully supported by verified medical documents.'}
                  </Typography>
                </Box>

                {/* Step 4: Final Output */}
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1.5px solid #6366f1' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#4338ca' }}>
                    4. FINAL NON-DIAGNOSTIC SYSTEM OUTPUT (Temp={temperature.toFixed(2)}):
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#0f172a', lineHeight: 1.7, mt: 0.5, whiteSpace: 'pre-line' }}>
                    {archResult.groundedAnswer}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};
