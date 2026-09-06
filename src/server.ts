import { Manager as MetaManager } from '@lomray/react-head-manager';
import MetaServer from '@lomray/react-head-manager/server';
import entryServer from '@lomray/vite-ssr-boost/adapters/express/entry';
import { isbot } from 'isbot';
import StateKey from '@constants/state-key';
import createQueryClient from '@helpers/query-client';
import routes from '@routes/index';
import App from './app';

export default entryServer(App, routes, {
  init: () => ({
    onRequest: () => ({
      appProps: { metaManager: new MetaManager(), queryClient: createQueryClient() },
    }),
    onRouterReady: ({ context: { request } }) => ({
      isStream:
        !isbot(request.headers.get('user-agent') ?? '') &&
        !/(?:^|;\s*)isCrawler=1(?:;|$)/.test(request.headers.get('cookie') ?? ''),
    }),
    onShellReady: ({ context: { appProps, html } }) => ({
      header: MetaServer.inject(html.header, appProps.metaManager),
    }),
    getState: ({ context: { appProps } }) => ({
      [StateKey.metaManager]: MetaServer.getState(appProps.metaManager),
    }),
  }),
});
