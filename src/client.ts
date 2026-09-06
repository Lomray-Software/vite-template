import { Manager as MetaManager } from '@lomray/react-head-manager';
import entryClient from '@lomray/vite-ssr-boost/browser/entry';
import getServerState from '@lomray/vite-ssr-boost/helpers/get-server-state';
import StateKey from '@constants/state-key';
import createQueryClient, { setBrowserQueryClient } from '@helpers/query-client';
import routes from '@routes/index';
import App from './app';

void entryClient(App, routes, {
  init: () => {
    const queryClient = createQueryClient();

    // SPA loaders may already be waiting for this instance when init runs.
    setBrowserQueryClient(queryClient);

    if (import.meta.env.DEV) {
      window.__queryFnCalls = {};
    }

    return Promise.resolve({
      queryClient,
      metaManager: new MetaManager(getServerState(StateKey.metaManager, import.meta.env.PROD)),
    });
  },
});
