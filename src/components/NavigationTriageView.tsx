import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import SendIcon from '@mui/icons-material/Send';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BlockIcon from '@mui/icons-material/Block';
import { RoutingDecision, routePatientUtterance } from '../lib/careRouter';
import { Specialty } from '../data/dental_referral_corpus';

interface NavigationTriageViewProps {
  onRouteComplete?: (decision: RoutingDecision, utterance: string) => void;
}

export const NavigationTriageView: React.FC<NavigationTriageViewProps> = ({ onRouteComplete }) => {
  const [inputText, setInputText] = useState(
    'my back tooth is coming through sideways and keeps getting infected'
  );
  const [decision, setDecision] = useState<RoutingDecision>(() =>
    routePatientUtterance('my back tooth is coming through sideways and keeps getting infected')
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const sampleComplaints = [
    { label: 'Impacted Wisdom Tooth', text: 'my back tooth is coming through sideways and keeps getting infected', chipVariant: 'filled' as const, color: 'warning' as const },
    { label: 'Throbbing Night Pain', text: "throbbing pain that wakes me at night and I can't tell which tooth", chipVariant: 'outlined' as const, color: 'info' as const },
    { label: 'Failed Root Canal', text: 'my old root canal has started hurting again', chipVariant: 'filled' as const, color: 'info' as const },
    { label: 'Receding Gums', text: 'my gums have receded and the roots are showing', chipVariant: 'outlined' as const, color: 'secondary' as const },
    { label: 'Crooked Teeth Alignment', text: 'my teeth are crooked and I want them straightened', chipVariant: 'filled' as const, color: 'primary' as const },
    { label: 'Routine Checkup / Clean', text: "I'd like a routine check-up and scaling clean", chipVariant: 'outlined' as const, color: 'success' as const },
    { label: 'White Patch >3 Weeks', text: "a white patch in my mouth that hasn't gone in over a month", chipVariant: 'filled' as const, color: 'warning' as const },
    { label: '🚨 Airway / Swelling (Red Flag)', text: 'the swelling is spreading toward my eye and I have a fever', chipVariant: 'filled' as const, color: 'error' as const },
    { label: 'Vague Complaint (Fallback)', text: 'something feels a bit uncomfortable in my mouth lately', chipVariant: 'outlined' as const, color: 'default' as const },
  ];

  const handleRunRouting = (query: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = routePatientUtterance(query);
      setDecision(res);
      setIsProcessing(false);
      if (onRouteComplete) onRouteComplete(res, query);
    }, 80);
  };

  const getSpecialtyChipColor = (spec: Specialty): 'error' | 'warning' | 'info' | 'secondary' | 'primary' | 'success' | 'default' => {
    switch (spec) {
      case 'emergency':
        return 'error';
      case 'oral_surgeon':
        return 'warning';
      case 'endodontist':
        return 'info';
      case 'periodontist':
        return 'secondary';
      case 'orthodontist':
        return 'primary';
      case 'general_dentist':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Clinic Welcome & Guarantee Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #0d9488 0%, #0369a1 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Chip
                label="Care Navigation Protocol"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
              />
              <Chip
                icon={<SecurityIcon sx={{ color: '#67e8f9 !important', fontSize: 16 }} />}
                label="Escalate-Only Safe Guarantee"
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Which Clinician Handles Your Problem?
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, maxWidth: 680 }}>
              The Butterfly Clinic Navigation Engine evaluates published referral criteria to identify the exact level of care required.
              <strong> The system can escalate; it can never de-escalate or recommend no care.</strong>
            </Typography>
          </Box>

          <Box sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Active Referral Standard
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Butterfly Dental Pathways Rev 2026
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Grid: Input & Output */}
      <Grid container spacing={3}>
        {/* LEFT: Patient Symptom Input & Presets */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Describe Your Oral Complaint or Symptoms
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Enter your symptoms below or select one of the patient clinical presentations.
              </Typography>
            </Box>

            {/* Input Box */}
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleRunRouting(inputText); }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. My old root canal has started hurting again, or I have swelling spreading up my cheek..."
                variant="outlined"
                sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
              />
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 1.5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isProcessing || !inputText.trim()}
                  startIcon={<SendIcon />}
                >
                  {isProcessing ? 'Routing Query...' : 'Navigate Referral'}
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Spacious Patient Symptom Presentation Cards */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
                Quick Clinical Scenarios
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
                {sampleComplaints.slice(0, 6).map((item, idx) => (
                  <Box
                    key={idx}
                    onClick={() => {
                      setInputText(item.text);
                      handleRunRouting(item.text);
                    }}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      border: '1.5px solid',
                      borderColor: inputText === item.text ? '#0d9488' : '#e2e8f0',
                      bgcolor: inputText === item.text ? '#f0fdfa' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      '&:hover': {
                        borderColor: '#0d9488',
                        bgcolor: '#f8fafc',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: inputText === item.text ? '#0f766e' : '#1e293b', fontSize: '0.8rem' }}>
                      {item.label}
                    </Typography>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.color === 'error' ? '#ef4444' : item.color === 'warning' ? '#f59e0b' : '#0d9488',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Care Level Hierarchy Guide */}
            <Box sx={{ mt: 'auto', pt: 2, bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 1 }}>
                Care Level Ladder (Escalate-Only Safety Invariant):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.5, borderRadius: 1.5, bgcolor: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 700 }}>
                  <LocalHospitalIcon sx={{ fontSize: 14 }} /> L4: Emergency
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.5, borderRadius: 1.5, bgcolor: '#ffedd5', color: '#9a3412', fontSize: '0.75rem', fontWeight: 700 }}>
                  L3: Oral Surgeon
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.5, borderRadius: 1.5, bgcolor: '#e0f2fe', color: '#075985', fontSize: '0.75rem', fontWeight: 700 }}>
                  L2: Specialist (Endo/Perio/Ortho)
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.5, borderRadius: 1.5, bgcolor: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
                  L1: General Dentist (Safe Fallback)
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.5, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'line-through' }}>
                  <BlockIcon sx={{ fontSize: 14 }} /> L0: No Care (Forbidden)
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT: Triage Routing Decision & Citation */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Triage Routing & Citation Record
              </Typography>
              <Chip
                label={`Care Level ${decision.careLevel} of 4`}
                color={getSpecialtyChipColor(decision.specialty)}
                variant="filled"
                size="small"
              />
            </Box>

            {isProcessing && <LinearProgress color="primary" />}

            {/* Red Flag Alert (if triggered) */}
            {decision.specialty === 'emergency' && (
              <Alert
                severity="error"
                icon={<WarningAmberIcon fontSize="inherit" />}
                sx={{ borderRadius: 2 }}
              >
                <AlertTitle sx={{ fontWeight: 800 }}>EMERGENCY MEDICAL ESCALATION</AlertTitle>
                {decision.reason}
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Do not wait for a routine appointment. Visit the nearest Emergency Department or call emergency medical services.
                </Typography>
              </Alert>
            )}

            {/* Primary Referral Result Card */}
            <Card
              variant="outlined"
              sx={{
                borderColor: decision.specialty === 'emergency' ? '#fca5a5' : '#99f6e4',
                bgcolor: decision.specialty === 'emergency' ? '#fef2f2' : '#f0fdfa',
                borderRadius: 2.5,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Recommended Clinician Routing
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
                      {decision.specialtyLabel}
                    </Typography>
                  </Box>
                  <Chip
                    label={decision.fellBackToSafeOption ? 'Broadest Safe Fallback' : 'Criterion Matched'}
                    color={decision.fellBackToSafeOption ? 'default' : 'primary'}
                    variant={decision.fellBackToSafeOption ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Box>

                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Clinical Referral Rationale:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                    "{decision.reason}"
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Cited Criterion & Provenance */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                Auditable Citation & Referral Standard
              </Typography>

              {decision.citationId ? (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                      label={decision.citationId}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                    {decision.confidenceLogit !== null && (
                      <Tooltip title="Cross-Encoder relevance logit score">
                        <Chip
                          label={`Logit: ${decision.confidenceLogit.toFixed(2)}`}
                          size="small"
                          variant="filled"
                          color={decision.confidenceLogit > 0 ? 'success' : 'default'}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                    {decision.citationDocTitle}
                  </Typography>

                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px solid #e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-line', color: '#1e293b' }}>
                    {decision.citationText}
                  </Box>
                </Paper>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No direct criterion cited.
                </Typography>
              )}
            </Box>

            {/* Alternative Ranks */}
            {decision.alternatives.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Next Best Alternative Specialties (Reranker Pool)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {decision.alternatives.map((alt, i) => (
                    <Chip
                      key={i}
                      label={`${alt.label} (${alt.score > 0 ? '+' : ''}${alt.score})`}
                      size="small"
                      variant="outlined"
                      color={getSpecialtyChipColor(alt.specialty)}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Pipeline Stage Latencies */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Red Flag: <strong>{decision.stageDurationsMs.redFlagMs}ms</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Dense + BM25: <strong>{decision.stageDurationsMs.denseMs + decision.stageDurationsMs.bm25Ms}ms</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                RRF + Rerank: <strong>{decision.stageDurationsMs.rrfMs + decision.stageDurationsMs.rerankMs}ms</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                Total: {decision.stageDurationsMs.totalMs}ms
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
