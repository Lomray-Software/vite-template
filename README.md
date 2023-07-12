# Vite template

## Links
[Testing SPA amplify]()  
[Testing SSR docker](https://vite-template.lomray.com/)

# Local development

```bash
git clone git@github.com:Lomray-Software/vite-template.git
npm ci
npm run dev
```


## Git workflow
__NOTE: see .github and .aws for understand CI/CD__
1. Create feature, bugfix, etc.
2. Create Pull Request & test
3. Squash commit & merge into `staging` & test
4. Merge into `prod` (semantic release)
