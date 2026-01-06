import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderTop: '2px solid rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});
