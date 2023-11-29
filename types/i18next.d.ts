/* eslint-disable @typescript-eslint/naming-convention */
import type namespaces from '../src/assets/locales/namespaces';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: (typeof namespaces)['en']['translation'];
    resources: (typeof namespaces)['en'];
  }
}
