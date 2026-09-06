# TanStack Query with streamed SSR

The `example/tanstack-query` branch of [vite-template](https://github.com/Lomray-Software/vite-template) shows how an existing TanStack Query SPA can keep its queries while adding server rendering. It uses React 19, React Router 8 Data mode, vite-ssr-boost **8.3.0**, and TanStack Query **5.102.8**. `@tanstack/react-query` is the only runtime dependency added to `example/minimal`.

- `/users` awaits `queryClient.prefetchQuery`, then returns `{ dehydratedState: dehydrate(queryClient) }`. All list data is resolved before rendering.
- `/users/:id` starts `prefetchQuery` without awaiting it. The dehydrated pending query contains a promise; SSR Boost streams its result after an artificial **800 ms** delay. `useSuspenseQuery` reads it inside React `Suspense`.
- Both pages use `useLoaderData` and `HydrationBoundary`. Data comes from [src/data/users.ts](src/data/users.ts), with no API or network dependency.
- `/`, lazy `/about` with its stylesheet, `/deferred` with React Router `Await`, the 301 `/redirect`, `/client-only`, and 404 handling remain available.

The approach follows TanStack's [Advanced SSR guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr) and SSR Boost's [loader data streaming guide](https://lomray-software.github.io/vite-ssr-boost/guide/data-streaming). Successful and pending queries are dehydrated; the library restores native promises in the browser. Keep this data in loader results: `getState` uses JSON and cannot transport promises.

## The wiring in 15 lines

This condensed sketch shows the connections; imports, existing metadata setup, client readiness, and cache seeding are in the linked source files below.

```tsx
const makeClient = () => new QueryClient({ defaultOptions: {
  queries: { staleTime: 60_000 },
  dehydrate: { shouldDehydrateQuery: q =>
    defaultShouldDehydrateQuery(q) || q.state.status === 'pending' },
} });
// server init hook:
onRequest: () => ({ appProps: { queryClient: makeClient() } })
// browser entry init (once):
init: async () => ({ queryClient: makeClient() })
<QueryClientProvider client={client?.queryClient ?? server?.queryClient}>{children}</QueryClientProvider>
await queryClient.prefetchQuery(usersQuery); // list loader
void queryClient.prefetchQuery(userQuery(id)); // detail loader
return { dehydratedState: dehydrate(queryClient) }; // both loaders
<HydrationBoundary state={useLoaderData().dehydratedState}><Suspense fallback={<p>Loading user…</p>}><Details /></Suspense></HydrationBoundary>
const Details = () => <h1>{useSuspenseQuery(userQuery(id)).data.name}</h1>;
```

[Server entry](src/server.ts) creates the client in `onRequest`, then the route loaders read it from request `appProps`. There is no shared server client. [Browser entry](src/client.ts) creates its client once in `init`, outside React renders, and passes the same instance to the provider and loaders. A readiness promise covers SPA startup, where the router can start a loader before `init` runs. [The factory](src/common/helpers/query-client.ts) supplies the shared defaults; [query options](src/data/user-queries.ts) are reused by loaders and components.

The default footer hydration remains enabled: the browser hydrates after the response's state is available, while the server can send the fallback and resolved markup in separate chunks. Googlebot and the `isCrawler=1` cookie select buffered output. Profile metadata is available in the shell, before the query resolves.

## Cache and transport guarantees

| Guarantee | Check |
| --- | --- |
| Hydration does not run a query function again while data is fresh (`staleTime: 60_000`). | `npm run test:query` hydrates resolved and pending state into a separate client, counts queryFn calls, and tests the freshness boundary. Browser tests also remount the hydrated pages at 59 seconds. |
| A direct detail visit transfers one query result. | `npm run smoke` counts exactly **1** `__ssrBoostStream` resolve frame for `/users/2`; `/users` has **0**. Rendered HTML also contains the user for display; the count measures data settlement frames. |
| Concurrent server requests do not share cached users. | Smoke starts two `curl` processes concurrently for `/users/1` and `/users/2`, checks each complete HTML response contains only its own user, and counts one frame each. |
| List-to-detail client navigation reuses complete cached records. | The detail loader seeds from a fresh list without changing its `dataUpdatedAt`. Node and browser tests cover this. With no fresh list or detail, the browser runs the native query function once; subsequent visits reuse it. |
| Crawlers receive complete content. | Smoke requests `/users/2` as Googlebot and asserts Grace Hopper, her role, and zero `<!--$?-->` markers. |

In development, inspect `window.__queryFnCalls`: direct SSR hydration starts at `{}`; a cold browser navigation to `/users/1` increments `"users/1"` to `1`. This counts query functions because the example uses local data. The counter is omitted from production builds. Freshness is measured from `dataUpdatedAt`; data older than 60 seconds can refetch normally. Unknown user IDs are validated before streaming so `/users/999` returns HTTP 404.

## Run and verify

Use Node **22.23.2** (`.nvmrc`) and npm.

```sh
npm ci
npm run develop
```

| Command | Result |
| --- | --- |
| `npm run lint:check` | Check application lint rules. |
| `npm run ts:check` | Check application types. |
| `npm run style:check` | Check styles. |
| `npm run test:query` | Run cache, hydration, freshness, and isolation tests without a browser. |
| `npm run build -- --throw-warnings` | Build SSR and browser assets; fail on build warnings. |
| `npm run size:check` | Check total gzip JavaScript against the measured baseline plus 5%. |
| `npm run start:ssr` | Serve the SSR build on port 3000. |
| `npm run test:stream -- http://localhost:3000 /tmp/query-captures` | Capture timestamped streaming, Googlebot output, and concurrent curl responses; save HTML in the optional directory. |
| `npm run smoke` | Build and check SSR routes, streaming guarantees, crawlers, then SPA output. Requires `curl`. |
| `npm run build:spa` / `npm run start:spa` | Build / serve the same app as a SPA. |

The smoke runner stops its own servers and finishes with a SPA build. Run the SSR build again before `start:ssr` or measuring SSR build size.

Browser tests use the development query counter and start their own server on port 5173. Stop any existing server on that port, then run:

```sh
npx playwright install chromium
npm run test:browser
```

`@playwright/test` is a development dependency. The tests cover direct hydration, list cache reuse, cold client navigation, and browser errors. Browser execution requires an environment that can launch Chromium. See [PR_DESCRIPTION.md](PR_DESCRIPTION.md) for the checks actually run on this working tree.
