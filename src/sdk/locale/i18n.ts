import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en/index.json';
import translationAR from './ar/index.json';

const resources = {
    ar: {
        translation: translationAR,
    },
    en: {
        translation: translationEN,
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'ar', // default language
    fallbackLng: 'ar',
    interpolation: {
        escapeValue: false, // react already safes from xss
    },
});

export default i18n;
