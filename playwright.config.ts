import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:8787', browserName: 'chromium' },
  webServer: {
    command: [
      'env -u NO_COLOR npm run build:worker',
      'env -u NO_COLOR npx --no-install wrangler kv key put --local --binding MESSAGES --persist-to .wrangler/browser-tests greeting "Hello from browser test KV"',
      'env -u NO_COLOR npm run preview:worker -- --ip 127.0.0.1 --port 8787 --inspector-port 0 --persist-to .wrangler/browser-tests',
    ].join(' && '),
    url: 'http://127.0.0.1:8787',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
