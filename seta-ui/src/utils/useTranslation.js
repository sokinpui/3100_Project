import { useTranslation } from 'react-i18next';

export const useAppTranslation = (namespace) => {
  const { t, i18n } = useTranslation(namespace);

  const translate = (key, options = {}) => {
    return t(key, { defaultValue: key, ...options });
  };

  return { t: translate, i18n, currentLanguage: i18n.language };
};
