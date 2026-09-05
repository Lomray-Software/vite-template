# Custom Fastify server example

This is the `example/custom-server` branch of vite-template.
It extends [example/minimal](https://github.com/Lomray-Software/vite-template/tree/example/minimal) with a production server owned by the application.
It uses React 19, React Router 8 [Data mode](https://reactrouter.com/start/modes#data), Vite 8, and vite-ssr-boost 8 beta.

- A named Fetch handler and a default managed CLI entry share the same app, routes, and metadata hooks.
- Development uses the managed CLI and its Vite integration.
- Production uses a plain JavaScript Fastify launcher, with static files, streaming compression, and Early Hints.
- The lazy `/about` route receives its stylesheet in the server response.
- The smoke script verifies the managed SSR server, Fastify SSR, and a managed SPA build.

The routes are unchanged: `/`, `/users`, `/users/:id`, `/about`, `/redirect`, `/client-only`, and a catch-all 404.
The pages retain the “Minimal SSR example” title so the two server paths render the same application.
Loaders return resolved first-paint data. Nested loader promises serialize as `{}` in hydration data; use the [prod example](https://github.com/Lomray-Software/vite-template/tree/prod) for component-level Suspense with request-scoped state ([serializer](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/src/helpers/build-router-state.ts)).

## Commands

Use Node 22.23.2 (`.nvmrc`) and run `npm ci` from the repository root.
[package.json](package.json) has eight direct runtime dependencies: the six from the minimal example plus `fastify` and `@fastify/static`.
Fastify runs the HTTP server; its static plugin serves the browser build.
The library range is `^8.0.0-beta.5`.

These commands use the scripts in [package.json](package.json):

| Command | Result |
| --- | --- |
| `npm run develop` | Start the managed development server. |
| `npm run build` | Build `build/client` and `build/server`. |
| `npm run start:fastify` | Run `node server/index.mjs` against the SSR build. |
| `npm run start:ssr` | Run the managed production server for comparison. |
| `npm run build:spa` | Build the browser-only application. |
| `npm run start:spa` | Serve the SPA build through the managed CLI. |
| `npm run smoke` | Build and check both SSR servers, then build and check SPA. |

Build SSR before starting Fastify. Set `PORT` to change its default port of 3000.
The launcher binds all interfaces and handles `SIGINT` and `SIGTERM` by closing Fastify.
For a development port override, put the same `VITE_PORT` value in `.env.development.local` and pass `-- --port` with that value to `npm run develop`.
Rebuild SSR after running smoke, which finishes with a SPA build.

## Dual-export pattern

The default export is an `entryServer` pipeline consumed by the managed CLI.
The named `handler` is a Fetch request handler created with `createHandler`, `createStaticHandler`, and the Node stream renderer.
Neither export starts an HTTP listener.
Both paths use the same `App`, route objects, crawler policy, and metadata lifecycle.
A new meta manager is created per request, and its state is restored by [src/client.ts](src/client.ts).

The additional `configureHandler` export is application bootstrap glue.
[server/index.mjs](server/index.mjs) supplies production `getHtml` and `prepare` hooks before accepting requests.
The managed CLI provides its own HTML and asset preparation and does not call this function.
The shared hooks use only the request, app props, and HTML fields present in both context types.

Source: [src/server.ts](src/server.ts), complete file.

```ts
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
```

## Development and production

Development runs `ssr-boost dev` through the default entry.
The managed CLI owns Vite transforms, development assets, and HMR ([server lifecycle](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/docs/guide/server-lifecycle.md)).
The custom launcher runs only after a build and has no build step of its own.
It imports the named handler from `build/server/server.js`.

Production reads `build/client/index.html` once and splits it on `<!--ssr-outlet-->`.
Each request gets a fresh HTML shell so route assets and metadata do not accumulate across requests.
The `prepare` hook injects matched route assets through the library manifest service and forwards any Early Hints.

Source: [server/index.mjs](server/index.mjs), production hook setup.

```js
configureHandler({
  getHtml: () => ({ header, footer }),
  prepare: async ({ context, executionContext }) => {
    const hints = manifest.injectAssets(context);

    if (hints.has('Link')) {
      await executionContext?.onEarlyHints?.(hints);
    }
  },
});
```

Static files come from `build/client`, with `index: false` to keep `/` on the SSR path.
`wildcard: false` registers the built files individually, leaving the wildcard route to the SSR adapter.
Files in `/assets/` receive a one-year `maxAge` and `immutable`; other static files receive `max-age=0` ([static plugin options](https://github.com/fastify/fastify-static#options)).
The wildcard uses `adapterFastify` with compression enabled.
The adapter streams through the raw response, bypassing Fastify serialization and `onSend` hooks ([adapter behavior](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/docs/guide/runtime-adapters.md#adapters)).

## Swap the transport

For Hono, keep the built `handler` and its production configuration.
Replace the Fastify listener with a Hono app and use the default export from `@lomray/vite-ssr-boost/adapters/hono` on its catch-all route.
Supply static-file serving and the runtime listener through [Hono's Node integration](https://hono.dev/docs/getting-started/nodejs), or your chosen runtime.
See the [library adapters guide](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/docs/guide/runtime-adapters.md#adapters) and [Hono adapter test](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/__tests__/adapters/hono.ts).

For native Node, keep the same production configuration and import the default adapter from `@lomray/vite-ssr-boost/adapters/node`.
Wrap the Fetch handler with that adapter and pass the resulting listener to Node's HTTP server, with explicit error handling and compression enabled.
Serve static files before SSR, or put asset delivery in a reverse proxy.
See the [library adapters guide](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/docs/guide/runtime-adapters.md#adapters), [Node adapter test](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/__tests__/adapters/node.ts), and [Node HTTP server API](https://nodejs.org/docs/latest-v22.x/api/http.html#httpcreateserveroptions-requestlistener).

## Smoke configuration

[scripts/smoke.config.json](scripts/smoke.config.json) selects both `ssr-boost` and `fastify` in its `servers` array.
[scripts/smoke.mjs](scripts/smoke.mjs) builds SSR once, checks the same routes, HEAD response, HTML chunks, and crawler output against each server, and stops each process.
Fastify starts as `node server/index.mjs` with `PORT` set to a free port.
The script then builds SPA and checks it with the managed server.
Omitting `servers` preserves the managed SSR and SPA behavior used by other branches.

## Known limitations

The spike uses `@lomray/vite-ssr-boost@8.0.0-beta.5`. No library files were changed.

- Route assets require the deep imports `@lomray/vite-ssr-boost/services/server-config` and `@lomray/vite-ssr-boost/services/ssr-manifest`. `ServerConfig.init({ isProd: true, isOnlyClient: false })` and `SsrManifest.get(config).injectAssets(context)` work from plain `server/index.mjs`. Injection adds the lazy `/about` stylesheet and returns `Link` headers, forwarded through `executionContext.onEarlyHints`. No manual manifest parsing or tag generation was needed.
- These services couple the launcher to managed-server configuration. Build discovery uses the working directory, so start this example from the repository root. `SsrManifest.get` is a process-wide singleton that retains the first configuration; this example serves one build per process. Proposed public helper: `createRouteAssetPreparer<TAppProps>(options: { buildDir: string; modulePreload?: boolean }): NonNullable<ICreateHandlerOptions<TAppProps>['prepare']>`, exported from `@lomray/vite-ssr-boost/node/production`. It would load an independent manifest for the explicit build directory, inject matched route assets, and forward Early Hints without importing `services/*`.
- HTML bootstrap is manual. The launcher reads `build/client/index.html` once, validates exactly one `<!--ssr-outlet-->`, and supplies a fresh `{ header, footer }` object for every request. The example's `configureHandler` installs `getHtml` and `prepare` before listening; it is application glue, not a library API. Proposed public helper: `loadHtmlShell(options: { indexFile: string; outlet?: string }): Promise<() => IHtmlShell>`, also exported from `@lomray/vite-ssr-boost/node/production`. It would perform that read, validation, split, and per-request copy.
- Fastify owns static-file caching, listening, and shutdown. Its adapter owns streamed response compression. Development and HMR still use the managed CLI. Rebuild and restart production after changing the app or its assets.

The proposed signatures describe missing public helpers. They are not implemented or importable in this beta.

## Need more?

| Branch | What it shows |
| --- | --- |
| [prod](https://github.com/Lomray-Software/vite-template/tree/prod) | Streamed data, MobX, consistent Suspense, and deployment examples. |
| [example/minimal](https://github.com/Lomray-Software/vite-template/tree/example/minimal) | Six runtime dependencies and the complete SPA-to-SSR diff. |
| [example/localization](https://github.com/Lomray-Software/vite-template/tree/example/localization) | Planned: locale selection and matching server/browser state. |
