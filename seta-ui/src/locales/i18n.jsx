import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './en.json';
import zhTranslation from './zh.json';

const getUserLanguage = () => {
  try {
    const userSettings = localStorage.getItem('userSettings');
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      return settings.language || 'english';
    }
  } catch (e) {
    console.error('Error reading language from settings:', e);
  }
  return 'english';
};

try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        english: { translation: enTranslation },
        zh: { translation: zhTranslation },
      },
      lng: getUserLanguage(),
      fallbackLng: 'english',
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
        ns: ['translation'], // Default namespace
        defaultNS: 'translation'
    });
} catch (error) {
  console.error('i18n initialization failed:', error);
}

export const changeLanguage = (language) => {
  i18n.changeLanguage(language);
};

export default i18n;
