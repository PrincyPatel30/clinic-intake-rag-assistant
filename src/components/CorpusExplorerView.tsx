import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { REFERRAL_CRITERIA } from '../data/dental_referral_corpus';

export const CorpusExplorerView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const specialties: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Specialties', count: REFERRAL_CRITERIA.length },
    { id: 'general_dentist', label: 'General Dentist (Level 1)', count: REFERRAL_CRITERIA.filter(c => c.specialty === 'general_dentist').length },
    { id: 'endodontist', label: 'Endodontist (Level 2)', count: REFERRAL_CRITERIA.filter(c => c.specialty === 'endodontist').length },
    { id: 'periodontist', label: 'Periodontist (Level 2)', count: REFERRAL_CRITERIA.filter(c => c.specialty === 'periodontist').length },
    { id: 'orthodontist', label: 'Orthodontist (Level 2)', count: REFERRAL_CRITERIA.filter(c => c.specialty === 'orthodontist').length },
    { id: 'oral_surgeon', label: 'Oral Surgeon (Level 3)', count: REFERRAL_CRITERIA.filter(c => c.specialty === 'oral_surgeon').length },
  ];

  const filtered = REFERRAL_CRITERIA.filter((c) => {
    const matchesSpec = selectedSpecialty === 'all' || c.specialty === selectedSpecialty;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.text.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q);
    return matchesSpec && matchesQuery;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <MenuBookIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Butterfly Clinic Referral Criteria Corpus
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Stage 2 & Stage 4: Structure-aware chunking where one chunk = one referral criterion with care level metadata.
            </Typography>
          </Box>
          <Chip
            label={`${REFERRAL_CRITERIA.length} Indexed Referral Criteria`}
            color="primary"
            variant="filled"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Filter Chips & Search Bar */}
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {specialties.map((spec) => (
                <Chip
                  key={spec.id}
                  label={`${spec.label} (${spec.count})`}
                  clickable
                  color={selectedSpecialty === spec.id ? 'primary' : 'default'}
                  variant={selectedSpecialty === spec.id ? 'filled' : 'outlined'}
                  onClick={() => setSelectedSpecialty(spec.id)}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search criteria, conditions, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Criteria Cards / Accordions */}
      <Stack spacing={2}>
        {filtered.map((criterion) => (
          <Accordion key={criterion.id} defaultExpanded sx={{ borderRadius: '12px !important', overflow: 'hidden', border: '1px solid #e2e8f0', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', px: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, width: '100%', pr: 2, gap: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Chip
                    label={`L${criterion.careLevel}`}
                    color={criterion.careLevel >= 3 ? 'warning' : criterion.careLevel === 2 ? 'info' : 'success'}
                    size="small"
                    sx={{ fontWeight: 800, minWidth: 36 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {criterion.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                      {criterion.id} • {criterion.specialtyLabel}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {criterion.keywords.slice(0, 3).map((kw, idx) => (
                    <Chip key={idx} label={kw} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                  ))}
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2.5, bgcolor: 'white' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Published Referral Text:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2, fontFamily: 'monospace', fontSize: '0.825rem', whiteSpace: 'pre-line' }}>
                {criterion.text}
              </Paper>

              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0fdfa', borderRadius: 1.5, border: '1px solid #ccfbf1' }}>
                <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 700, display: 'block' }}>
                  Contextual Situating Sentence (Stage 5):
                </Typography>
                <Typography variant="body2" sx={{ color: '#115e59', fontStyle: 'italic', fontSize: '0.85rem', mt: 0.5 }}>
                  "{criterion.contextSentence}"
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Indexed Keywords ({criterion.keywords.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {criterion.keywords.map((kw, i) => (
                    <Chip key={i} label={kw} size="small" variant="filled" sx={{ bgcolor: '#f1f5f9', fontSize: '0.725rem' }} />
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {filtered.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              No referral criteria matched your search filter.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};
