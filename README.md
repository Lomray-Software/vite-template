# Vite template

## Links
[Testing SPA Amplify](https://prod.d2fyemmi74bwx3.amplifyapp.com/)  
[Testing SSR Amplify](https://prod.d947n8vxd7uac.amplifyapp.com/)  
[Testing SSR Docker](https://vite-template.lomray.com/)

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
npm run dev
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

## Docker build
[See github workflow](.github/workflows/release.yml) or
```bash
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

## Vercel build - SSR
__Build Command__: `npm pkg delete scripts.prepare && npm run build -- --serverless && npm run build:vercel`  
__Output Directory__: `.vercel/output`  
__Install command__: `npm ci`
