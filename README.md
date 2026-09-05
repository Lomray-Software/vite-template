# Vite template

## Branches

| Branch | What it shows | When to start from it | Link |
| --- | --- | --- | --- |
| `prod` | Streaming SSR, MobX, consistent Suspense, meta tags and route management | Use the full reference app | [Browse](https://github.com/Lomray-Software/vite-template/tree/prod) |
| `example/minimal` | Six runtime dependencies, loaders, a lazy route with CSS, redirect, client-only route and 404, plus the SPA-to-SSR file diff | Start with a small SSR app | [Browse](https://github.com/Lomray-Software/vite-template/tree/example/minimal) |
| `example/custom-server` | Development through the managed CLI, production through an application-owned Fastify server with static assets, compression and Early Hints; dual export of the managed entry and a Fetch handler | Own the production server | [Browse](https://github.com/Lomray-Software/vite-template/tree/example/custom-server) |
| `example/localization` | i18next with the language chosen on the server from the cookie or Accept-Language, transferred to the client before hydration, and a cookie-based switcher | Add localization | [Browse](https://github.com/Lomray-Software/vite-template/tree/example/localization) |

## Demo links

### Streaming supported

- [SSR Docker (Streaming supported)](https://vite-template.lomray.com/)
- [SSR Vercel (Streaming supported)](https://vite-template-three.vercel.app/)

### Streaming not supported

- [SSR Amplify (Streaming not supported)](https://prod.d947n8vxd7uac.amplifyapp.com/)

### SPA

- [SPA Amplify](https://prod.d2fyemmi74bwx3.amplifyapp.com/)

## Explore
 - [prod](https://github.com/Lomray-Software/vite-template/tree/prod) current branch with Mobx + Store Manager, Head Manager (meta), Route Manager
 - [feature/localization](https://github.com/Lomray-Software/vite-template/tree/feature/localization) branch with example of localization

## Used libraries
 - [VITE SSR BOOST](https://github.com/Lomray-Software/vite-ssr-boost)
 - [CONSISTENT SUSPENSE](https://github.com/Lomray-Software/consistent-suspense)
 - [REACT MOBX MANAGER](https://github.com/Lomray-Software/react-mobx-manager)
 - [REACT HEAD MANAGER](https://github.com/Lomray-Software/react-head-manager)
 - [REACT ROUTE MANAGER](https://github.com/Lomray-Software/react-route-manager)

# Local development

```bash
git clone git@github.com:Lomray-Software/vite-template.git
npm ci
npm run develop
```

## Structure
- `constants/index` - configure application constants
- `common/services/route-manager` - configure site routes

## Bundle analyze
```bash
vite-bundle-visualizer
```

## Git workflow
__NOTE: see .github for understand CI/CD__
1. Create feature, bugfix, etc.
2. Create Pull Request & test
3. Squash & merge into `prod`

Dependabot checks dependencies every Monday morning and opens grouped update PRs for `prod` and the three example branches.

PR and example checks run `npm run size:check` after building; the script lists client JavaScript gzip sizes and enforces the budget in `scripts/size-budget.mjs` (1 KB = 1024 bytes).
After an intentional bundle change, rebuild and set that branch's budget to the measured gzip total plus 5%, rounded up to a whole KB.

The example workflow also runs Lighthouse weekly and on manual dispatch for `/` and `/details` on `prod`, and `/` and `/about` on `example/minimal`.
The audit build unlocks robots with `--unlock-robots`, matching the production deploy.
It measures each URL three times, requires performance of at least 90, warns below 90 for accessibility, best practices and SEO, and publishes reports and median category scores in the workflow artifacts and summary.
To run the prod checks locally, build the app, run `npm run start:ssr -- --port 4173`, then in another terminal run `npx --yes @lhci/cli@0.15.1 autorun --upload.target=temporary-public-storage` and `node scripts/lighthouse-summary.mjs`.
Lighthouse reports are uploaded to temporary public storage.

## Some cases to pay attention to.
 - Right solution for wrap `<Outlet />` into `<Suspense />`. If you would like to wrap your lazy routes only once:
```typescript jsx
import { Outlet, useLocation } from 'react-router-dom';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { Suspense } from '@lomray/consistent-suspense';

/**
 * NOTE: without key it's doesn't work
 * @see https://github.com/remix-run/react-router/issues/10568
 * @constructor
 */
const MyLayout: FCRoute = () => {
  const { key } = useLocation();

  return (
    <Suspense key={key}>
      <Outlet/>
    </Suspense>
  )
}
```

- In some cases nested Suspense should be memorized for preventing "This Suspense boundary received an update before it finished hydrating."
```typescript jsx
/**
 * Parent component can receive update what will entail rerender.
 * We should avoid rerenders for children suspense. 
 * @constructor
 */
const Parent: FC = () => {
  /**
   * Memorize Suspense to avoid errors
   */
  const children = useMemo(
    () => (
      <Suspense fallback={<Fallback/>}>
        <UserWrapper id={id} fields={restFields}/>
      </Suspense>
    ),
    [],
  );

  return (
    <div style={{ paddingLeft: '50px', textAlign: 'left' }}>
      {children}
    </div>
  );
}
```

## Docker build
[See github workflow](.github/workflows/release.yml) or
```bash
npm run build
ssr-boost build-docker --image-name test-image
```

## AWS Amplify build (amplify.yml) - SPA
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 22.23.2
        - npm ci
    build:
      commands:
        - npm run build -- --focus-only client
  artifacts:
    baseDirectory: build/client
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## AWS Amplify build (amplify.yml) - SSR
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 22.23.2
        - npm pkg delete scripts.prepare
        - npm ci
    build:
      commands:
        - npm run build -- --eject
        - npm run build:amplify
  artifacts:
    baseDirectory: .amplify-hosting
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Vercel build (vercel.json) - SSR
```json
{
  "buildCommand": "npm pkg delete scripts.prepare && npm run build -- --serverless && npm run build:vercel",
  "installCommand": "npm ci",
  "outputDirectory": ".vercel/output"
}
```
