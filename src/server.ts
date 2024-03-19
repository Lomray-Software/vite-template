import { StreamSuspense } from '@lomray/consistent-suspense/server';
import { Manager as MetaManager } from '@lomray/react-head-manager';
import MetaServer from '@lomray/react-head-manager/server';
import { Manager } from '@lomray/react-mobx-manager';
import ManagerStream from '@lomray/react-mobx-manager/manager-stream';
import entryServer from '@lomray/vite-ssr-boost/node/entry';
import CookieParser from 'cookie-parser';
import { createIsbotFromList, list, isbotPatterns } from 'isbot';
import { enableStaticRendering } from 'mobx-react-lite';
import StateKey from '@constants/state-key';
import type { ICookies } from '@interfaces/cookies';
import routes from '@routes/index';
import App from './app';

/**
 * Exclude AWS Amplify user agent
 */
const patternsToRemove = new Set(['Amazon CloudFront'].map(isbotPatterns).flat());
const isBot = createIsbotFromList(list.filter((record) => !patternsToRemove.has(record)));

// noinspection JSUnusedGlobalSymbols
/**
 * Configure server
 */
export default entryServer(App, routes, {
  abortDelay: 20000,
  init: () => ({
    /**
     * Once after create server
     */
    onServerCreated: (app) => {
      enableStaticRendering(true);

      app.use(CookieParser());
    },
    /**
     * For each request:
     * 1. Create mobx manager
     * 2. Create meta manager
     * 3. Listen stream to add mobx suspense stores to output
     */
    onRequest: async () => {
      const storeManager = new Manager({
        options: { shouldDisablePersist: true },
      });
      const storeManageStream = new ManagerStream(storeManager);
      const metaManager = new MetaManager();

      await storeManager.init();

      const streamSuspense = StreamSuspense.create((suspenseId) =>
        storeManageStream.take(suspenseId),
      );

      return {
        appProps: {
          storeManager,
          metaManager,
          streamSuspense,
        },
        // disable 103 early hints for AWS ALB
        hasEarlyHints: false,
      };
    },
    /**
     * We can control stream mode here
     */
    onRouterReady: ({ context: { req } }) => {
      const isStream =
        !isBot(req.get('user-agent') || '') && (req.cookies as ICookies)?.isCrawler !== '1';

      return {
        isStream,
      };
    },
    /**
     * Inject header meta tags
     */
    onShellReady: ({
      context: {
        appProps: { metaManager },
        html: { header },
      },
    }) => {
      const newHead = MetaServer.inject(header, metaManager);

      return {
        header: newHead,
      };
    },
    /**
     * Analyze react stream output and return additional html from callback `onRequest` in StreamSuspense
     */
    onResponse: ({
      context: {
        appProps: { streamSuspense },
        isStream,
      },
      html,
    }) => {
      if (!isStream) {
        return;
      }

      return streamSuspense.analyze(html);
    },
    /**
     * Return server state to client (once when app she'll ready) for:
     * 1. Mobx manager (stores)
     * 2. Meta manager
     */
    getState: ({
      context: {
        appProps: { storeManager, metaManager },
      },
    }) => {
      const storeState = storeManager.toJSON();
      const metaState = MetaServer.getState(metaManager);

      return {
        [StateKey.storeManager]: storeState,
        [StateKey.metaManager]: metaState,
      };
    },
  }),
});
