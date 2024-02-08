# Vite template

## Demo links
[SSR Docker (Streaming supported)](https://vite-template.lomray.com/)  
[SSR Amplify (Streaming not supported)](https://prod.d947n8vxd7uac.amplifyapp.com/)  
[SSR Vercel (Streaming not supported)](https://vite-template-three.vercel.app/)  
[SPA Amplify](https://prod.d2fyemmi74bwx3.amplifyapp.com/)

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

## WARNING
Right solution for wrap `<Outlet />` into `<Suspense />`. If you would like to wrap your lazy routes only once:
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
        - nvm use 18.13.0
        - npm ci
    build:
      commands:
        - npm run build -- --only-client
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
        - nvm use 18.13.0
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
