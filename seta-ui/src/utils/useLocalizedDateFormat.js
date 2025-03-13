import { useLanguage } from '../contexts/LanguageContext';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

const locales = {
  'en': enUS,
  'zh': zhCN,
};

export function useLocalizedDateFormat() {
  const { language } = useLanguage();
  // Extract the base language (e.g., 'zh' from 'zh-CN' or 'en' from 'en-US')
  const lang = language.split('-')[0];
  // Map to date-fns locale, default to English if language not supported
  const locale = locales[lang] || enUS;

  // Return an object with both format and formatDistanceToNow functions
  return {
    format: (date, formatStr) => {
      return format(date, formatStr, { locale });
    },
    formatDistanceToNow: (date) => {
      return formatDistanceToNow(date, { addSuffix: true, locale });
    },
  };
}
