# Cloudflare Workers SSR example

The `example/cloudflare` branch of [vite-template](https://github.com/Lomray-Software/vite-template) adds a Cloudflare Worker to [example/minimal](https://github.com/Lomray-Software/vite-template/tree/example/minimal). It uses React 19, React Router 8 Data mode, Vite 8, and vite-ssr-boost **8.4.0**.

- The Worker uses `@lomray/vite-ssr-boost/cloudflare` to render the shared app and serve its built assets.
- `/kv` reads a greeting from the `MESSAGES` KV binding in its loader, with a fallback for an empty namespace. Client navigation uses a small Worker HTTP endpoint for the same value.
- The existing users, lazy `/about` stylesheet, deferred data, redirect, client-only route, and 404s remain available. Pages retain the “Minimal SSR example” titles.
- Development stays on **`ssr-boost dev`**. The Express entry still supports `npm run build` and `npm run start:ssr`.

The setup follows the library's [Cloudflare guide](https://lomray-software.github.io/vite-ssr-boost/guide/cloudflare) ([guide source](https://github.com/Lomray-Software/vite-ssr-boost/blob/prod/docs/guide/cloudflare.md)).

## Wiring diff versus `example/minimal`

The shared app, browser entry, and Express metadata lifecycle stay in place. The additions below select a second production runtime.

### `src/worker.ts`

Before: no Worker entry. After: [src/worker.ts](src/worker.ts), complete file.

```ts
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
```

`build/client/assets-manifest.json` is the SSR Boost route asset manifest. The CLI builds the client and Express entry, writes this JSON, then builds the Worker. The JSON is bundled; HTML comes from `ASSETS` during a request. [types/assets-manifest.d.ts](types/assets-manifest.d.ts) lets types pass before the first build.

Each HTML request gets its own meta manager. The hooks preserve metadata, Googlebot buffering, and the `isCrawler=1` cookie policy from the Express entry. Bindings stay in the request context; only the greeting is returned as loader data.

### `vite.config.ts`

Before: `plugins: [devtoolsJson(), SsrBoost(), react()]`.

After: [vite.config.ts](vite.config.ts), complete file.

```ts
import SsrBoost from '@lomray/vite-ssr-boost/plugin';
import devtoolsJson from 'vite-plugin-devtools-json';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  envDir: '../',
  build: {
    outDir: '../build',
  },
  plugins: [
    devtoolsJson(),
    SsrBoost({
      entrypoint: [{ name: 'worker', type: 'ssr', serverFile: 'worker.ts' }],
    }),
    react(),
  ],
});
```

The default build emits `build/client` and `build/server`. `--focus-only all` also emits `build/worker/worker.js`.

### `wrangler.jsonc`

Before: no Wrangler configuration. After: [wrangler.jsonc](wrangler.jsonc), complete file.

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "vite-template-cloudflare",
  "main": "build/worker/worker.js",
  "compatibility_date": "2026-09-05",
  "assets": {
    "directory": "build/client",
    "binding": "ASSETS",
    "run_worker_first": true,
    "html_handling": "none",
    "not_found_handling": "none"
  },
  "kv_namespaces": [
    {
      "binding": "MESSAGES",
      // Local preview works with this placeholder. Replace it before deploying.
      "id": "00000000000000000000000000000000"
    }
  ]
}
```

`run_worker_first` allows SSR at `/` and cache headers on hashed assets. Disabling HTML handling lets the shell helper fetch `/index.html` without a redirect. Disabling the asset 404 fallback lets React Router return real 404 responses. See [Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).

The head manager's server entry (`@lomray/react-head-manager` 2.2.1 and later) parses head markup without a DOM, so the Worker bundle needs no parser alias and no Node compatibility flag.

### `package.json` and types

[package.json](package.json) adds these scripts:

```json
{
  "build:worker": "ssr-boost build --focus-only all",
  "preview:worker": "wrangler dev --local",
  "deploy": "wrangler deploy",
  "smoke:worker": "node scripts/smoke.mjs --worker-only",
  "test:browser": "playwright test"
}
```

Wrangler, `@cloudflare/workers-types`, and Playwright are development dependencies. [tsconfig.worker.json](tsconfig.worker.json) checks the Worker against Workers globals with no DOM library; the main tsconfig checks the browser and Express application. `npm run ts:check` runs both. The Worker default export satisfies `ExportedHandler<IWorkerEnv>`. The browser-only page reads `navigator.language` directly so the shared route graph also type-checks under Workers globals.

## Run and verify

Use Node **22.23.2** (`.nvmrc`) and npm.

```sh
npm ci
npm run develop
```

| Command | Result |
| --- | --- |
| `npm run build` / `npm run start:ssr` | Build / serve the Express SSR app. |
| `npm run build:worker` | Build client, Express, route manifest, and Worker. |
| `npm run preview:worker` | Serve the built Worker and local bindings in workerd. |
| `npx wrangler deploy --dry-run` | Bundle the Worker without publishing or requiring an account. |
| `npm run deploy` | Publish the Worker and its static assets after configuring a real KV namespace. |
| `npm run build:spa` / `npm run start:spa` | Build / serve the browser-only app. |
| `npm run lint:check` / `npm run ts:check` / `npm run style:check` | Check lint, both type environments, and styles. |
| `npm run build -- --throw-warnings` | Fail the Express/client build on warnings. |
| `npm run size:check` | Check gzip client JavaScript against the measured baseline plus 5%, rounded up to KB. |
| `npm run smoke` | Build and verify Express, Worker, then SPA, stopping each server. |
| `npm run smoke:worker` | Build all entries and run only the local Wrangler checks. |

Smoke uses free ports and temporary KV storage, so existing local greetings do not affect it. It checks the shared routes, HEAD, lazy CSS, empty and seeded KV, the browser JSON endpoint, immutable hashed assets, deferred resolve frames, an early pending shell, and Googlebot buffering. It finishes with a SPA build; run `npm run build:worker` again before previewing or deploying the Worker. Rebuild all entries after changing routes or assets.

The [example workflow](.github/workflows/example-check.yml) runs smoke and adds Wrangler preview, bundle, size, and browser checks only for `example/cloudflare`.

Browser checks start a built Worker on port **8787** with their own `.wrangler/browser-tests` KV store. Stop any server on that port, then run:

```sh
npx playwright install chromium
npm run test:browser
```

The tests cover KV hydration and client navigation, deferred interactivity, lazy CSS, user routes, redirects, client-only content, and 404s. [PR_DESCRIPTION.md](PR_DESCRIPTION.md) records which checks were executed.

## Bindings

[The loader](src/pages/kv/index.tsx) reads `context.executionContext.platform.env.MESSAGES` on the Worker. An absent `greeting` key displays **“No greeting in KV yet.”** Express development and SPA mode also display that fallback.

Seed the default local preview store from the repository root, then open `/kv`:

```sh
npx wrangler kv key put --local --binding MESSAGES greeting 'Hello from KV'
npm run build:worker
npm run preview:worker
```

Data-mode loaders run in the browser during navigation. They fetch `/api/message`, whose Worker request hook reads the same binding and returns JSON with `Cache-Control: no-store`. The initial SSR visit reads KV directly and hydrates the returned message. See [Wrangler KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/).

For deployment, authenticate with Cloudflare, create a namespace, and replace the all-zero `id` in `wrangler.jsonc` with the returned ID:

```sh
npx wrangler login
npx wrangler kv namespace create MESSAGES
# Update wrangler.jsonc with the returned namespace ID before continuing.
npx wrangler kv key put --remote --binding MESSAGES greeting 'Hello from deployed KV'
npm run build:worker
npm run deploy
```

Local KV data is separate from remote KV. The placeholder is sufficient for local preview and dry runs.

## Runtime limits

- This handler has no Early Hints transport. Route styles and preload links are still included in the HTML.
- React rendering consumes CPU. Choose appropriate rendering and loader deadlines and check the plan's [Workers CPU, memory, and duration limits](https://developers.cloudflare.com/workers/platform/limits/); awaiting I/O and CPU time are different measures.
- `nodejs_compat` is not needed for this example. Keep Express and filesystem imports out of the Worker entry.
- Streaming HTML uses the library's `Content-Encoding: identity` and `Cache-Control: no-transform` defaults so the pending shell can arrive before deferred data. Googlebot and the crawler cookie receive buffered content. Hydration retains the minimal example's footer mode.
- `ssr-boost dev` provides Express, Vite, and HMR. Use a complete build and local Wrangler preview to exercise Worker bindings and streaming.
