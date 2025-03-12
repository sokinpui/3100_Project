import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../assets/styles/theme';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return settings.theme || 'light';
      }
      // Default to 'system' if no settings are saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
      console.error("Error parsing theme settings:", error);
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  });

  // Track system theme changes when theme is 'system'
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { theme: 'system' }; // Default to 'system'
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setThemeMode(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Sync with localStorage changes across tabs
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
      } else {
        // If no settings, default to system
        setThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Apply dark-theme class to body
  useEffect(() => {
    if (themeMode === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [themeMode]);

  const updateTheme = (newTheme) => {
    setThemeMode(newTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : newTheme
    );
    localStorage.setItem('userSettings', JSON.stringify({ theme: newTheme }));
  };

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
