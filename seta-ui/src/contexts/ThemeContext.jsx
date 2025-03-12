import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Add this import
import { lightTheme, darkTheme } from '../assets/styles/theme';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Get theme preference from localStorage or default to 'light'
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        // Make sure it's valid JSON before parsing
        const settings = JSON.parse(savedSettings);
        if (settings.theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return settings.theme || 'light';
      }
    } catch (error) {
      console.error("Error parsing theme settings:", error);
    }
    return 'light';
  });

  // Listen for changes to system preferences if theme is set to 'system'
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const { theme } = JSON.parse(savedSettings);
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
          setThemeMode(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, []);

  // Apply theme changes when settings are updated
  useEffect(() => {
    const handleStorageChange = () => {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const { theme } = JSON.parse(savedSettings);
        if (theme === 'system') {
          setThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } else {
          setThemeMode(theme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

// Add this effect to update the body class
  useEffect(() => {
    // Add/remove dark class to body for non-MUI elements
    if (themeMode === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [themeMode]);

  // Function to update theme mode
  const updateTheme = (newTheme) => {
    setThemeMode(newTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : newTheme
    );
  };

  // Get the appropriate theme object based on the mode
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

 return (
    <ThemeContext.Provider value={{ themeMode, updateTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
