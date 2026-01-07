import { createTheme } from '@mui/material/styles';

import { useThemeStore } from '../stores/themeStore';

// Extend MUI palette with custom status colors
declare module '@mui/material/styles' {
  interface Palette {
    pending: Palette['primary'];
  }
  interface PaletteOptions {
    pending?: PaletteOptions['primary'];
  }
}

// Extend Chip color prop to support custom colors
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    pending: true;
  }
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
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
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    pending: {
      main: '#9e9e9e',
      light: '#e0e0e0',
      dark: '#616161',
      contrastText: '#424242',
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

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    pending: {
      main: '#8d8d72',
      light: '#a9a98a',
      dark: '#6b6b56',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderTop: '2px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
});

export const useAppTheme = () => {
  const themeMode = useThemeStore((state) => state.themeMode);

  const effectiveTheme =
    themeMode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : themeMode;

  return effectiveTheme === 'dark' ? darkTheme : lightTheme;
};
