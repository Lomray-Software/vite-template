import MobxManager from '@lomray/react-mobx-manager/plugins/vite';
import SsrBoost from '@lomray/vite-ssr-boost/plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  envDir: '../',
  build: {
    outDir: '../build',
  },
  plugins: [SsrBoost(), react(), MobxManager()],
});
