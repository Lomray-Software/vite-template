import type { KVNamespace } from '@cloudflare/workers-types';
import type { IAssetsBinding } from '@lomray/vite-ssr-boost/cloudflare';

interface IWorkerEnv {
  ASSETS: IAssetsBinding;
  MESSAGES: KVNamespace;
}

export default IWorkerEnv;
