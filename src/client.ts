import { Manager as MetaManager } from '@lomray/react-head-manager';
import { Manager } from '@lomray/react-mobx-manager';
import MobxLocalStorage from '@lomray/react-mobx-manager/storages/local-storage';
import entryClient from '@lomray/vite-ssr-boost/browser/entry';
import getServerState from '@lomray/vite-ssr-boost/helpers/get-server-state';
import { IS_PROD } from '@constants/index';
import StateKey from '@constants/state-key';
import routes from '@routes/index';
import App from './app';

/**
 * Configure client
 */
void entryClient(App, routes, {
  init: async ({ isSSRMode }) => {
    // The entry waits for the streamed footer before reading transferred state.
    const initState = isSSRMode ? getServerState(StateKey.storeManager, IS_PROD) : undefined;
    const metaState = isSSRMode ? getServerState(StateKey.metaManager, IS_PROD) : undefined;
    const metaManager = new MetaManager(metaState);
    const storeManager = new Manager({
      initState,
      storage: new MobxLocalStorage(),
    });

    await storeManager.init();

    return {
      storeManager,
      metaManager,
    };
  },
});
