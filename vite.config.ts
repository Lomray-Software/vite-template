import MobxManager from '@lomray/react-mobx-manager/plugins/vite/index';
import SsrBoost from '@lomray/vite-ssr-boost/plugin';
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
  plugins: [SsrBoost({ abortDelay: 20000 }), react(), MobxManager()],
});
