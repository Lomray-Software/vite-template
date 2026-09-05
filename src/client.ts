import { Manager as MetaManager } from '@lomray/react-head-manager';
import entryClient from '@lomray/vite-ssr-boost/browser/entry';
import getServerState from '@lomray/vite-ssr-boost/helpers/get-server-state';
import resources from '@assets/locales/namespaces';
import StateKey from '@constants/state-key';
import routes from '@routes/index';
import type { ILocalizationState } from '@services/localization';
import { detectLanguage, initLocalization } from '@services/localization';
import App from './app';

void entryClient(App, routes, {
  init: async ({ isSSRMode }) => {
    const state = isSSRMode
      ? getServerState<ILocalizationState>(StateKey.localization, import.meta.env.PROD)
      : { language: detectLanguage(document.cookie, navigator.languages.join(',')) };
    const localization = await initLocalization({ language: state.language, resources });

    document.documentElement.lang = localization.language;

    return {
      metaManager: new MetaManager(getServerState(StateKey.metaManager, import.meta.env.PROD)),
      localization,
    };
  },
});
