import { Manager as MetaManager } from '@lomray/react-head-manager';
import entryClient from '@lomray/vite-ssr-boost/browser/entry';
import getServerState from '@lomray/vite-ssr-boost/helpers/get-server-state';
import StateKey from '@constants/state-key';
import routes from '@routes/index';
import App from './app';

void entryClient(App, routes, {
  init: () =>
    Promise.resolve({
      metaManager: new MetaManager(getServerState(StateKey.metaManager, import.meta.env.PROD)),
    }),
});
