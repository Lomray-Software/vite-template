import { createInstance } from 'i18next';
import type { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from '@assets/locales/namespaces';

type Language = keyof typeof resources;

interface ILocalizationState {
  language: string;
  resources?: Resource;
}

const supportedLanguage = (value: string): Language | undefined => {
  const [language] = value.trim().toLowerCase().split('-');

  return language === 'en' || language === 'es' ? language : undefined;
};

/** Cookie first, then the first supported language in header order, then English. */
const detectLanguage = (cookie = '', acceptLanguage = ''): Language => {
  const value = cookie.split(';').find((part) => part.trim().startsWith('lang='));

  if (value) {
    try {
      const language = supportedLanguage(decodeURIComponent(value.trim().slice(5)));

      if (language) {
        return language;
      }
    } catch {
      // Ignore malformed cookie encoding and continue with Accept-Language.
    }
  }

  for (const preference of acceptLanguage.split(',')) {
    const [tag, ...parameters] = preference.split(';');
    const isExcluded = parameters.some((parameter) => /^\s*q=0(?:\.0*)?\s*$/i.test(parameter));
    const language = supportedLanguage(tag);

    if (language && !isExcluded) {
      return language;
    }
  }

  return 'en';
};

/** Create an instance for this request or browser; never share mutable language state. */
const initLocalization = async (state: ILocalizationState = { language: 'en' }) => {
  const localization = createInstance();

  await localization.use(initReactI18next).init({
    lng: state.language,
    resources: structuredClone(state.resources ?? resources),
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    load: 'languageOnly',
    ns: ['translation', 'forms'],
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
  });

  return localization;
};

export { detectLanguage, initLocalization };

export type { Language, ILocalizationState };
