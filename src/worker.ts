import { Manager as MetaManager } from '@lomray/react-head-manager';
import MetaServer from '@lomray/react-head-manager/server';
import { createWorkerHandler, getHtmlFromAssets } from '@lomray/vite-ssr-boost/cloudflare';
import { isbot } from 'isbot';
import StateKey from '@constants/state-key';
import readMessage from '@data/message';
import type IWorkerEnv from '@interfaces/worker-env';
import routes from '@routes/index';
// eslint-disable-next-line import-x/extensions -- Wrangler needs the generated JSON file extension.
import manifest from '../build/client/assets-manifest.json';
import App from './app';

export default {
  fetch: createWorkerHandler<IWorkerEnv, { metaManager: MetaManager }>({
    App,
    routes,
    manifest,
    getHtml: async (_request, env) => (await getHtmlFromAssets(env, '/index.html'))(),
    onRequest: async ({ request, executionContext }) => {
      if (new URL(request.url).pathname === '/api/message') {
        if (!['GET', 'HEAD'].includes(request.method)) {
          return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
        }

        return Response.json(await readMessage(executionContext.platform.env), {
          headers: { 'Cache-Control': 'no-store' },
        });
      }

      return { appProps: { metaManager: new MetaManager() } };
    },
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
} satisfies ExportedHandler<IWorkerEnv>;
