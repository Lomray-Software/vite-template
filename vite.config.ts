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
