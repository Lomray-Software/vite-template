/* eslint-disable import-x/extensions -- JSON resources need explicit extensions for Vite. */
import forms from './en/forms.json';
import translation from './en/translation.json';
import formsES from './es/forms.json';
import translationES from './es/translation.json';

export default {
  en: { translation, forms },
  es: { translation: translationES, forms: formsES },
};
