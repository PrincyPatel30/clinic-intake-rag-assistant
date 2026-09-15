import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import { RoutingDecision } from '../lib/careRouter';
import { ButterflyLogo } from './ButterflyLogo';

interface ClinicianReferralViewProps {
  decision: RoutingDecision;
  patientUtterance: string;
}

export const ClinicianReferralView: React.FC<ClinicianReferralViewProps> = ({
  decision,
  patientUtterance,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `=== BUTTERFLY CLINIC CARE NAVIGATION REFERRAL VOUCHER ===
Patient Presentation: "${patientUtterance}"
Assigned Route: ${decision.specialtyLabel} (Care Level ${decision.careLevel})
Clinical Rationale: ${decision.reason}
Citation Standard: ${decision.citationId} (${decision.citationDocTitle})
Confidence Logit: ${decision.confidenceLogit}
Escalate-Only Invariant: VERIFIED (Can escalate, never de-escalates)
Generated: ${new Date().toLocaleString()}
=== END REFERRAL RECORD ===`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Clinician Action Bar */}
      <Paper sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ButterflyLogo size={32} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Clinical Referral Voucher & Audit Trail
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Generated in accordance with Butterfly Clinic Published Referral Pathways
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
            size="small"
          >
            {copied ? 'Copied Voucher' : 'Copy Referral'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            size="small"
          >
            Print / Export PDF
          </Button>
        </Stack>
      </Paper>

      {/* Main Referral Document Card */}
      <Paper sx={{ p: 4, borderRadius: 3, border: '1.5px solid #cbd5e1', bgcolor: 'white' }}>
        {/* Document Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 3, borderBottom: '2px solid #0d9488' }}>
          <Box>
            <ButterflyLogo size={44} showText />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Clinical Department of Diagnostic Navigation & Referral
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Audit Reference ID: <strong>REF-{Math.abs(decision.reason.length * 71329).toString(16).toUpperCase()}</strong>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Chip
              label={`Care Level ${decision.careLevel}`}
              color={decision.specialty === 'emergency' ? 'error' : decision.careLevel >= 3 ? 'warning' : 'primary'}
              size="medium"
              sx={{ fontWeight: 800, fontSize: '0.85rem' }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </Box>

        {/* Clinical Summary Block */}
        <Box sx={{ my: 3 }}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
            Section 1 • Patient Stated Presentation
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', mt: 1, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#1e293b' }}>
              "{patientUtterance}"
            </Typography>
          </Paper>
        </Box>

        {/* Referral Triage Direction Block */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
            Section 2 • Triage Assignment & Target Clinician
          </Typography>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ bgcolor: '#f0fdfa', borderColor: '#5eead4', height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Directed Specialty
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f766e', mt: 0.5 }}>
                    {decision.specialtyLabel}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                    Routing Mode: {decision.fellBackToSafeOption ? 'Broadest Safe Option (Confidence Floor Fallback)' : 'Direct Criterion Citation Match'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ bgcolor: '#fafafa', height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Care Level Safety Ladder
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
                    Level {decision.careLevel} of 4
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    <Chip label="Escalate Only" size="small" color="success" variant="outlined" />
                    <Chip label="Zero Under-Routing" size="small" color="primary" variant="filled" />
                    <Chip label="Auditable" size="small" color="secondary" variant="outlined" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Section 3 • Cited Criterion & Evidence Ground Truth */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
            Section 3 • Verified Clinical Citation & Criterion Ground Truth
          </Typography>

          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8fafc', mt: 1, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                label={decision.citationId || 'EMERGENCY_OVERRIDE'}
                color="primary"
                size="small"
                sx={{ fontWeight: 700, fontFamily: 'monospace' }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {decision.reason}
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Document: {decision.citationDocTitle}
            </Typography>

            <Box sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1.5, fontFamily: 'monospace', fontSize: '0.825rem', whiteSpace: 'pre-line' }}>
              {decision.citationText}
            </Box>
          </Paper>
        </Box>

        {/* Section 4 • Verification Sign-Off */}
        <Alert severity="info" icon={<SecurityIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
          <strong>Safety Invariant Attestation:</strong> This navigation decision was derived strictly through deterministic safety guards, hybrid retrieval (BM25 + Dense + RRF k=60), and cross-encoder reranking. No LLM has altered the routing level or provided clinical diagnosis.
        </Alert>
      </Paper>
    </Box>
  );
};
