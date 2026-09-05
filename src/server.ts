import type { IncomingMessage } from 'node:http';
import { Manager as MetaManager } from '@lomray/react-head-manager';
import MetaServer from '@lomray/react-head-manager/server';
import entryServer from '@lomray/vite-ssr-boost/adapters/express/entry';
import { isbot } from 'isbot';
import resources from '@assets/locales/namespaces';
import StateKey from '@constants/state-key';
import routes from '@routes/index';
import { detectLanguage, initLocalization } from '@services/localization';
import App from './app';

export default entryServer(App, routes, {
  init: () => ({
    onRequest: async (req: IncomingMessage) => ({
      appProps: {
        metaManager: new MetaManager(),
        localization: await initLocalization({
          language: detectLanguage(req.headers.cookie, req.headers['accept-language']),
          resources,
        }),
      },
    }),
    onRouterReady: ({ context: { request } }) => ({
      isStream:
        !isbot(request.headers.get('user-agent') ?? '') &&
        !/(?:^|;\s*)isCrawler=1(?:;|$)/.test(request.headers.get('cookie') ?? ''),
    }),
    onShellReady: ({ context: { appProps, html } }) => ({
      header: MetaServer.inject(
        html.header.replace('<html lang="en">', `<html lang="${appProps.localization.language}">`),
        appProps.metaManager,
      ),
    }),
    getState: ({ context: { appProps } }) => ({
      [StateKey.metaManager]: MetaServer.getState(appProps.metaManager),
      [StateKey.localization]: {
        language: appProps.localization.language,
      },
    }),
  }),
});
