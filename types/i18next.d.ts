import 'i18next';
import type namespaces from '../src/assets/locales/namespaces';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof namespaces)['en'];
  }
}
