import { Manager as MetaManager } from '@lomray/react-head-manager';
import MetaServer from '@lomray/react-head-manager/server';
import entryServer from '@lomray/vite-ssr-boost/adapters/express/entry';
import createHandler from '@lomray/vite-ssr-boost/core/handler';
import type { ICreateHandlerOptions } from '@lomray/vite-ssr-boost/core/handler';
import type { ISsrRequestContext } from '@lomray/vite-ssr-boost/core/render';
import renderToStream from '@lomray/vite-ssr-boost/node/render-to-stream';
import { isbot } from 'isbot';
import { createElement } from 'react';
import { createStaticHandler } from 'react-router';
import StateKey from '@constants/state-key';
import routes from '@routes/index';
import App from './app';

type TServerOptions = ICreateHandlerOptions<{ metaManager: MetaManager }>;
type THookParams = {
  context: Pick<ISsrRequestContext<{ metaManager: MetaManager }>, 'request' | 'appProps' | 'html'>;
};

const hooks = {
  onRouterReady: ({ context: { request } }: THookParams) => ({
    isStream:
      !isbot(request.headers.get('user-agent') ?? '') &&
      !/(?:^|;\s*)isCrawler=1(?:;|$)/.test(request.headers.get('cookie') ?? ''),
  }),
  onShellReady: ({ context: { appProps, html } }: THookParams) => ({
    header: MetaServer.inject(html.header, appProps.metaManager),
  }),
  getState: ({ context: { appProps } }: THookParams) => ({
    [StateKey.metaManager]: MetaServer.getState(appProps.metaManager),
  }),
};
const onRequest = () => ({ appProps: { metaManager: new MetaManager() } });
let production: Pick<TServerOptions, 'getHtml' | 'prepare'>;

// The production launcher supplies build assets once, before accepting requests.
export const configureHandler = (options: NonNullable<typeof production>): void => {
  production = options;
};

export const handler = createHandler(
  {
    createApp: (children, { appProps }) => createElement(App, { server: appProps }, children),
    handler: createStaticHandler(routes),
    renderToStream,
  },
  {
    ...hooks,
    onRequest,
    getHtml: (request) => {
      if (!production) {
        throw new Error('Call configureHandler before serving the Fetch handler.');
      }

      return production.getHtml(request);
    },
    prepare: (params) => production.prepare?.(params),
  },
);

export default entryServer(App, routes, {
  init: () => ({ ...hooks, onRequest }),
});
