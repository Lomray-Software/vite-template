import i18nNext from 'i18next';
import type { TFunction, InitOptions, Namespace } from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { APP_LANGUAGE, APP_LANGUAGES } from '@constants/index';
import RouteManager from '@services/route-manager.ts';

interface ICustomI18n extends Omit<typeof i18nNext, 't'> {
  t: TFunction<Namespace>;
}

const i18n = i18nNext.use(initReactI18next).use(Backend) as ICustomI18n;

/**
 * Preload namespaces and return t function outside components
 */
const getTranslation = async (ns: Namespace): Promise<ICustomI18n['t']> => {
  await i18n.loadNamespaces(ns);

  return i18n.t;
};

/**
 * Set prefix for router manager
 */
i18n.on('languageChanged', (lng) => {
  try {
    languageCheck(lng);
    RouteManager.setPrefix(lng);
  } catch (e) {
    RouteManager.setPrefix(undefined);
  }
});

interface ILocalizationInitParams {
  url?: string;
}

/**
 * Initialize localization
 */
const initLocalization = (
  params: ILocalizationInitParams = {},
  options: InitOptions = {},
): Promise<TFunction> => {
  const lng = languageDetect(params.url);

  return i18n.init({
    lng,
    fallbackLng: 'en',
    debug: false,
    keySeparator: '.',
    load: 'languageOnly',
    defaultNS: 'translation',
    supportedLngs: APP_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    ...options,
  });
};

/**
 * Check allowed language
 */
const languageCheck = (lang?: string): null => {
  // only allowed languages, except default language (default language hasn't prefix)
  if (lang && (!APP_LANGUAGES.includes(lang) || lang === APP_LANGUAGE)) {
    throw new Response('', {
      status: 404,
    });
  }

  return null;
};

/**
 * Detect language from path
 */
const languageDetect = (url?: string): string => {
  const [lngPrefix] = (url || '').toLowerCase().split('/').filter(Boolean);

  if (lngPrefix && APP_LANGUAGES.includes(lngPrefix)) {
    return lngPrefix;
  }

  return APP_LANGUAGE;
};

export { languageCheck, initLocalization, getTranslation };
