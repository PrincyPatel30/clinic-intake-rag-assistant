import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SchoolIcon from '@mui/icons-material/School';
import HealingIcon from '@mui/icons-material/Healing';
import NavigationIcon from '@mui/icons-material/NearMe';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SecurityIcon from '@mui/icons-material/Security';
import { ButterflyLogo } from './ButterflyLogo';

interface ButterflyNavbarProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onReset: () => void;
}

export const ButterflyNavbar: React.FC<ButterflyNavbarProps> = ({
  currentTab,
  onTabChange,
  onReset,
}) => {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, md: 3 }, minHeight: 68 }}>
        {/* Brand & Custom Butterfly Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ButterflyLogo size={40} showText />
        </Box>

        {/* Center: MUI Tabs */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
          <Tabs
            value={currentTab}
            onChange={onTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab icon={<RecordVoiceOverIcon fontSize="small" />} iconPosition="start" label="Phoenova Triage Agent (12 Langs)" />
            <Tab icon={<SchoolIcon fontSize="small" />} iconPosition="start" label="Medical AI Workshop (A/B/C)" />
            <Tab icon={<HealingIcon fontSize="small" />} iconPosition="start" label="Patient Care & Chat" />
            <Tab icon={<NavigationIcon fontSize="small" />} iconPosition="start" label="Clinical Triage Engine" />
            <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Doctor Referral Slip" />
            <Tab icon={<IntegrationInstructionsIcon fontSize="small" />} iconPosition="start" label="RAG Pipeline & .ipynb" />
            <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="Safety Lab" />
          </Tabs>
        </Box>

        {/* Right Controls: Invariant Chip & Reset */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: 16 }} />}
            label="Zero Under-Routing"
            color="success"
            size="small"
            variant="filled"
            sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
          />

          <Tooltip title="Reset Session">
            <IconButton onClick={onReset} size="small" sx={{ border: '1px solid #e2e8f0' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Mobile & Tablet Tabs Bar */}
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, borderTop: '1px solid #f1f5f9', overflowX: 'auto' }}>
        <Tabs
          value={currentTab}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 44 }}
        >
          <Tab label="Phoenova (12 Langs)" sx={{ minHeight: 44, py: 1 }} />
          <Tab label="Workshop (A/B/C)" sx={{ minHeight: 44, py: 1 }} />
          <Tab label="Patient Care" sx={{ minHeight: 44, py: 1 }} />
          <Tab label="Triage Engine" sx={{ minHeight: 44, py: 1 }} />
          <Tab label="Doctor Slip" sx={{ minHeight: 44, py: 1 }} />
          <Tab label="Pipeline & .ipynb" sx={{ minHeight: 44, py: 1 }} />
          <Tab label="Safety Lab" sx={{ minHeight: 44, py: 1 }} />
        </Tabs>
      </Box>
    </AppBar>
  );
};
