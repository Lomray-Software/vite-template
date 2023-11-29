import { Manager as MetaManager } from '@lomray/react-head-manager';
import { Manager } from '@lomray/react-mobx-manager';
import MobxLocalStorage from '@lomray/react-mobx-manager/storages/local-storage';
import entryClient from '@lomray/vite-ssr-boost/browser/entry';
import getServerState from '@lomray/vite-ssr-boost/helpers/get-server-state';
import { IS_PROD } from '@constants/index';
import StateKey from '@constants/state-key';
import routes from '@routes/index';
import { initLocalization } from '@services/localization';
import App from './app';

const initState = getServerState(StateKey.storeManager, IS_PROD);
const metaState = getServerState(StateKey.metaManager, IS_PROD);

const metaManager = new MetaManager(metaState);
const storeManager = new Manager({
  initState,
  storage: new MobxLocalStorage(),
});

void initLocalization({
  url: location.pathname,
});

/**
 * Configure client
 */
void entryClient(App, routes, {
  init: async () => {
    await storeManager.init();

    return {
      storeManager,
      metaManager,
    };
  },
});
