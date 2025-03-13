import { useLanguage } from '../contexts/LanguageContext'; // Use the exported hook
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

const locales = {
  'en': enUS,
  'zh': zhCN,
};

export function useLocalizedDateFormat() {
  const { language } = useLanguage(); // Use the hook to get the language
  // Extract the base language (e.g., 'zh' from 'zh-CN' or 'en' from 'en-US')
  const lang = language.split('-')[0];
  // Map to date-fns locale, default to English if language not supported
  const locale = locales[lang] || enUS;

  // Return a formatting function that applies the correct locale
  return (date, formatStr) => {
    // Use the locale-specific format for Chinese or English
    return format(date, formatStr, { locale });
  };
}
