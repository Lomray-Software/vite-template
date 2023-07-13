# Vite template

## Links
[Testing SPA amplify](https://prod.d2fyemmi74bwx3.amplifyapp.com/)  
[Testing SSR docker](https://vite-template.lomray.com/)

## Used technologies
 - [VITE SSR BOOST](https://github.com/Lomray-Software/vite-ssr-boost)
 - [CONSISTENT SUSPENSE](https://github.com/Lomray-Software/consistent-suspense)
 - [REACT MOBX MANAGER](https://github.com/Lomray-Software/react-mobx-manager)
 - [REACT HEAD MANAGER](https://github.com/Lomray-Software/react-head-manager)
 - [SUGAR ROUTE MANAGER](https://github.com/Lomray-Software/react-route-manager)

# Local development

```bash
git clone git@github.com:Lomray-Software/vite-template.git
npm ci
npm run dev
```

## Git workflow
__NOTE: see .github for understand CI/CD__
1. Create feature, bugfix, etc.
2. Create Pull Request & test
3. Squash & merge into `prod`

## Docker build
[See github workflow](.github/workflows/release.yml)

## AWS Amplify build (amplify.yml)
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
