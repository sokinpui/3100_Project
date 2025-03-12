import { createTheme } from '@mui/material/styles';

// Common palette settings
const commonPalette = {
  primary: {
    main: '#007bff',
    light: '#429dff',
    dark: '#0055b3',
    contrastText: '#fff',
  },
  secondary: {
    main: '#6c757d',
    light: '#868e96',
    dark: '#495057',
    contrastText: '#fff',
  },
  error: {
    main: '#dc3545',
    light: '#e35d6a',
    dark: '#b02a37',
  },
  warning: {
    main: '#ffc107',
    light: '#ffca2c',
    dark: '#d39e00',
  },
  info: {
    main: '#0dcaf0',
    light: '#3dd5f3',
    dark: '#0aa2c0',
  },
  success: {
    main: '#198754',
    light: '#28a745',
    dark: '#157347',
  },
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...commonPalette,
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#007bff',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...commonPalette,
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#f0f0f0',
      secondary: '#adb5bd',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#429dff',
            },
          },
          '& .MuiInputBase-input': {
            color: '#f0f0f0',
          },
          '& .MuiInputLabel-root': {
            color: '#adb5bd',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#495057',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
  },
});
