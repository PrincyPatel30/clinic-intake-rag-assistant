import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d9488', // Teal 600
      light: '#14b8a6',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4338ca', // Indigo 700
      light: '#6366f1',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626', // Red 600
      light: '#ef4444',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706', // Amber 600
      light: '#f59e0b',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0284c7', // Sky 600
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a', // Green 600
      light: '#22c55e',
      dark: '#15803d',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          transition: 'all 0.15s ease-in-out',
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 44,
          borderRadius: 8,
        },
      },
    },
  },
});
