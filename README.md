# Minimal SSR example

This is the `example/minimal` branch of vite-template, using React 19, React Router 8, Vite 8, and vite-ssr-boost 8.3.0-beta.1.
The app uses React Router [Data mode](https://reactrouter.com/start/modes#data).

- Server-rendered pages with a title and description from a request-scoped meta manager.
- Resolved loader data on `/users`, a user page on `/users/:id`, and a loader error boundary for unknown IDs.
- `/deferred` (Deferred data) streams a static user list after 1.5 seconds from a loader promise through React Router `<Await>`, with a title and counter in the shell.
- A lazy `/about` route with its own CSS module injected into the server response.
- A server-aware 301 redirect, a browser-only route with a fallback, and a 404 page.
- Development reloads and SSR or SPA builds from the same application.

## From a plain Vite SPA to this project

Use Node 22.23.2 (`.nvmrc`) and npm.
The six direct runtime dependencies and their versions are listed in [package.json](package.json).
They are `react`, `react-dom`, `react-router`, `@lomray/vite-ssr-boost`, `@lomray/react-head-manager`, and `isbot`.
Keep vite-ssr-boost on the `^8.3.0-beta.1` range while using this example.
The head manager also installs `@lomray/consistent-suspense` as a transitive peer dependency; application code does not import it.

This comparison starts with Data-mode route objects, a shared `App` wrapper, and metadata already in the SPA.
The shared files are [src/app.tsx](src/app.tsx), [src/routes/index.ts](src/routes/index.ts), [src/constants/state-key.ts](src/constants/state-key.ts), the pages, and [tsconfig.json](tsconfig.json).
`App` accepts a meta manager through its `client` or `server` props and provides it to the route tree.
If your SPA has no metadata provider, add that shared wrapper before applying these entry changes.
The `.txt` files in [docs/spa-before](docs/spa-before) preserve the before sources at the target paths shown below; they are documentation fixtures, not a second application.
The after blocks are copied from this branch's files, with no omitted lines.

### `vite.config.ts`

Before — source: [docs/spa-before/vite.config.ts.txt](docs/spa-before/vite.config.ts.txt), copied to `vite.config.ts`.

```ts
import devtoolsJson from 'vite-plugin-devtools-json';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  envDir: '../',
  resolve: { tsconfigPaths: true },
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
  plugins: [devtoolsJson(), react()],
});
```

After — source: [vite.config.ts](vite.config.ts).

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
  plugins: [devtoolsJson(), SsrBoost(), react()],
});
```

`SsrBoost()` also reads the existing tsconfig aliases, so the before configuration’s `resolve.tsconfigPaths` is no longer needed.

### `src/index.html`

Before — source: [docs/spa-before/src/index.html.txt](docs/spa-before/src/index.html.txt), copied to `src/index.html`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/client.ts" async></script>
  </body>
</html>
```

After — source: [src/index.html](src/index.html).

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"><!--ssr-outlet--></div>
    <script type="module" src="/client.ts" async></script>
  </body>
</html>
```

The only HTML change from the SPA is `<!--ssr-outlet-->`.

### `src/client.ts`

Before — source: [docs/spa-before/src/client.ts.txt](docs/spa-before/src/client.ts.txt), copied to `src/client.ts`.

```ts
import { Manager as MetaManager } from '@lomray/react-head-manager';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import routes from '@routes/index';
import App from './app';

const router = createBrowserRouter(routes);
const metaManager = new MetaManager();

createRoot(document.getElementById('root')!).render(
  createElement(App, { client: { metaManager } }, createElement(RouterProvider, { router })),
);
```

After — source: [src/client.ts](src/client.ts).

```ts
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
```

### `src/server.ts`

Before: no server entry exists in the SPA.

After — source: [src/server.ts](src/server.ts).

```ts
import { Manager as MetaManager } from '@lomray/react-head-manager';
import MetaServer from '@lomray/react-head-manager/server';
import entryServer from '@lomray/vite-ssr-boost/adapters/express/entry';
import { isbot } from 'isbot';
import StateKey from '@constants/state-key';
import routes from '@routes/index';
import App from './app';

export default entryServer(App, routes, {
  init: () => ({
    onRequest: () => ({ appProps: { metaManager: new MetaManager() } }),
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
```

A new meta manager is created for each request, its tags are injected before the shell, and its state is restored by the client entry.
Crawler user agents or the `isCrawler=1` cookie select a complete response instead of streaming.

### `package.json scripts`

Before — source: [docs/spa-before/package.json.txt](docs/spa-before/package.json.txt), copied to `package.json`.

```json
{
  "scripts": {
    "develop": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

After — source: [package.json](package.json) (the complete `scripts` object; keep the dependency and tooling fields).

```json
{
  "scripts": {
    "develop": "ssr-boost dev",
    "build": "ssr-boost build",
    "build:spa": "ssr-boost build --focus-only client",
    "start:ssr": "ssr-boost start",
    "start:spa": "ssr-boost start --focus-only client",
    "preview": "ssr-boost preview",
    "smoke": "node scripts/smoke.mjs",
    "lint:check": "eslint \"src/**/*.{ts,tsx,*.ts,*tsx}\" --max-warnings=0",
    "lint:format": "eslint --fix \"src/**/*.{ts,tsx,*.ts,*tsx}\"",
    "style:check": "stylelint \"src/**/*.{css,scss}\"",
    "style:format": "stylelint --fix \"src/**/*.{css,scss}\"",
    "ts:check": "tsc --project ./tsconfig.json --skipLibCheck --noemit",
    "prepare": "husky"
  }
}
```

## Commands

Run `npm ci` after cloning the branch.
These commands call the scripts in [package.json](package.json):

| Command             | Result                                    |
| ------------------- | ----------------------------------------- |
| `npm run develop`   | Start the development server.             |
| `npm run build`     | Build the server and browser output.      |
| `npm run start:ssr` | Serve the SSR build.                      |
| `npm run build:spa` | Build only the browser output.            |
| `npm run start:spa` | Serve the SPA build.                      |
| `npm run smoke`     | Build and verify both SSR and SPA output. |

Run the matching build before starting a server; rebuild SSR after `npm run smoke`, which finishes with a SPA build.
For a development port override, set `VITE_PORT` to the same port in `.env.development.local` and pass `-- --port` to `npm run develop`.

This branch disables Vercel automatic deployments; the `prod` branch keeps the demo deployments.

## Pitfalls

- Browser globals: keep `window` out of module scope in server-imported code; use a lazy `onlyClient` route with a fallback for browser-only pages ([working route](src/routes/index.ts), [page](src/pages/client-only/index.tsx)).
- Loader promises: return critical data immediately and leave slow fields as promises, then read them with `<Await>` inside React `<Suspense>` ([deferred page](src/pages/deferred/index.tsx), [streaming guide](https://github.com/Lomray-Software/vite-ssr-boost/blob/staging/docs/guide/data-streaming.md)). This example keeps the default footer hydration; the `prod` branch also demonstrates early shell hydration and React 19 `use()`.
- Dependency CSS: add packages that import CSS to `ssr.noExternal` when they need Vite's server transforms ([Vite SSR externals](https://vite.dev/guide/ssr.html#ssr-externals)).
- Environment variables: read public values through `import.meta.env`, keep secrets out of `VITE_*`, and restart development after changing env files ([Vite env variables](https://vite.dev/guide/env-and-mode.html)).
- Hydration mismatches: compare the initial browser render with the server HTML and check data, dates, randomness, and browser-dependent branches ([React hydration troubleshooting](https://react.dev/reference/react-dom/client/hydrateRoot#troubleshooting)).

## Need more?

| Branch                                                                                               | What it shows                                                      |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [prod](https://github.com/Lomray-Software/vite-template/tree/prod)                                   | Streamed data, MobX, consistent Suspense, and deployment examples. |
| [example/custom-server](https://github.com/Lomray-Software/vite-template/tree/example/custom-server) | Planned.                                                           |
| [example/localization](https://github.com/Lomray-Software/vite-template/tree/example/localization)   | Planned.                                                           |
