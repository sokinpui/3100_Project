// src/contexts/LanguageContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import i18n from '../locales/i18n';

const LanguageContext = createContext({
  language: 'english',
  updateLanguage: () => {}
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return settings.language || 'english';
      }
    } catch (error) {
      console.error("Error parsing language settings:", error);
    }
    return 'english';
  });

  useEffect(() => {
    i18n.changeLanguage(language).catch((error) => {
      console.error("Error changing language:", error);
    });
  }, [language]);

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    try {
      const savedSettings = localStorage.getItem('userSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.language = newLanguage;
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Error updating language settings:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
