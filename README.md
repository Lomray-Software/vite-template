# Localization example

This is the `example/localization` branch of vite-template. It adds i18next to
[`example/minimal`](https://github.com/Lomray-Software/vite-template/tree/example/minimal).

- English and Spanish headings, descriptions, and navigation on the home, users, about, and not-found pages.
- An i18next instance for each server request, supplied through `I18nextProvider`.
- Bundled JSON namespaces with TypeScript translation-key checking.
- Language transfer through the SSR state and bundled resources initialized before hydration.
- A language switcher that saves a cookie and reloads the current URL.

The minimal routes remain: `/`, `/users`, `/users/:id`, `/about`, `/redirect`,
`/client-only`, and the not-found route. The users loader resolves its data before
rendering. The about route loads lazily and includes its own stylesheet. The user
profile and browser-only demonstrations keep their English copy.

## Language selection

`src/common/services/localization.ts` selects the language on the server:

1. A supported value in the `lang` cookie wins.
2. Otherwise, the first supported language in `Accept-Language` wins, in header order.
3. Otherwise, the language is `en`.

The supported languages are `en` and `es`. Regional tags such as `es-MX` resolve to
`es`, and matching ignores case. Unsupported languages, malformed cookie encoding,
and header entries with `q=0` are skipped. Preferences are not sorted by quality;
the first supported, non-excluded entry wins.

`src/server.ts` initializes localization before rendering each request. The same
instance supplies the page translations and the `<html lang>` attribute. Each
request gets its own instance and a copy of the resources, so concurrent requests
can use different languages.

## Resources and typing

`src/assets/locales/namespaces.ts` statically imports `translation.json` and
`forms.json` from `src/assets/locales/en` and `src/assets/locales/es`. These namespace names
and the original `checkIt` and `firstName` keys come from the old localization
branch. The Spanish sample strings are corrected. `types/i18next.d.ts` uses the
English resource shape to type translation keys and declares `translation` as the
default namespace. The JSON files are source modules and are not published as
standalone static assets.

The only added runtime dependencies are `i18next` and `react-i18next`.
`i18next-http-backend` is omitted because the resources are bundled and available
before the first render. No translation HTTP request is needed. A browser language
detector is also unnecessary because the server chooses the SSR language.

## State transfer and hydration

`src/server.ts` returns only `{ language }` from `getState` under
`StateKey.localization`, next to `StateKey.metaManager`. `src/client.ts` reads the
selected language and initializes i18next with that language and the statically
imported resources inside the client entry's `init` callback. The entry awaits
initialization before hydrating the app. The translation resources are already in
the client bundle, so they are not duplicated in the HTML state.

The server and client must agree on the language and resources before hydration.
Otherwise, the client's first render can produce different text from the existing
server HTML and cause a hydration mismatch. SSR startup therefore uses the
transferred language without detecting the browser language again. Both entries
import the same bundled resources. Separate instances use the
[i18next `createInstance` API](https://www.i18next.com/overview/api#createinstance).

For a SPA build, there is no server localization state. The client instead uses
the `lang` cookie, then `navigator.languages`, then English, and initializes the
bundled resources before mounting. It also sets `document.documentElement.lang`.

## Switcher

`src/common/components/layouts/app/index.tsx` renders English and Español buttons.
A click sets `lang=en` or `lang=es` with `Path=/`, `SameSite=Lax`, and a one-year
lifetime, then reloads the current URL. The next SSR request uses that cookie.
The active button exposes its selection through `aria-pressed`. Switching requires
JavaScript after startup. URLs do not have language prefixes.

## Commands

Use Node 22.23.2 and install with `npm ci`. The scripts below are defined in
`package.json`.

| Command                             | Purpose                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `npm run develop`                   | Start the managed development server.                                          |
| `npm run build -- --throw-warnings` | Build SSR output and reject warnings.                                          |
| `npm run start:ssr -- --port 3000`  | Serve the SSR build.                                                           |
| `npm run build:spa`                 | Build the browser app without SSR.                                             |
| `npm run start:spa -- --port 3000`  | Serve the SPA build.                                                           |
| `npm run smoke`                     | Build and check SSR routes, language headers, cookie priority, and SPA output. |

The smoke configuration accepts an optional `headers` object per route. Existing
route checks without headers still work. The script builds SPA output last; run
`npm run build` again before starting an SSR server afterwards.

## Need more?

| Branch                                                                                                 | What it shows                                                 |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [`prod`](https://github.com/Lomray-Software/vite-template/tree/prod)                                   | Streamed data, MobX, and consistent Suspense.                 |
| [`example/minimal`](https://github.com/Lomray-Software/vite-template/tree/example/minimal)             | The minimal SSR app without localization.                     |
| [`example/custom-server`](https://github.com/Lomray-Software/vite-template/tree/example/custom-server) | A custom production server using a Fetch handler and Fastify. |
