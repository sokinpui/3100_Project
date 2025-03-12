import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './locales/i18n';
import LayoutContainer from './components/Dashboard/LayoutContainer.jsx';
import { ModuleProvider } from './contexts/ModuleContext';
import ApiProvider from './services/ApiProvider';
import AuthGuard from './login/AuthGuard';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './assets/styles/global.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('loginTime');
    setIsLoggedIn(!!session);
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (!savedSettings) {
        // Initialize with system theme as default
        localStorage.setItem('userSettings', JSON.stringify({
          language: 'english',
          theme: 'system' // Default to system theme
        }));
      }
    } catch (error) {
      console.error("Error initializing settings:", error);
    }
  }, []);

  if (!i18n) {
    return <div>Error: Language system failed to initialize</div>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <LanguageProvider>
          <ApiProvider>
            <Router>
              <ModuleProvider>
                <AuthGuard setIsLoggedIn={setIsLoggedIn} />
                <LayoutContainer />
              </ModuleProvider>
            </Router>
          </ApiProvider>
        </LanguageProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
