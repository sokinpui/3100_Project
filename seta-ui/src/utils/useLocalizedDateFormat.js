// src/utils/useLocalizedDateFormat.js
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format as formatFns } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale'; // Import necessary locales

const locales = {
    english: enUS,
    zh: zhCN,
    // Add other locales as needed
};

export function useLocalizedDateFormat() {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.language.split('-')[0] || 'english'; // Get base language

    const locale = useMemo(() => {
        return locales[currentLanguage] || locales.english; // Fallback to English
    }, [currentLanguage]);

    const format = (date, formatString) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            // Handle null, undefined, or invalid Date objects gracefully
            return 'N/A'; // Or return an empty string, or the original value
        }
        try {
            return formatFns(date, formatString, { locale });
        } catch (error) {
            console.error("Date formatting error:", error);
            // Fallback to a basic format if the desired one fails
            return formatFns(date, 'P', { locale }); // 'P' is localized short date
        }
    };

    return { format, locale }; // Return locale object as well if needed elsewhere
}
