import { readFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import adapterFastify from '@lomray/vite-ssr-boost/adapters/fastify';
import ServerConfig from '@lomray/vite-ssr-boost/services/server-config';
import SsrManifest from '@lomray/vite-ssr-boost/services/ssr-manifest';
import Fastify from 'fastify';
import { configureHandler, handler } from '../build/server/server.js';

const clientDir = fileURLToPath(new URL('../build/client/', import.meta.url));
const parts = (await readFile(join(clientDir, 'index.html'), 'utf8')).split('<!--ssr-outlet-->');

if (parts.length !== 2) {
  throw new Error('Build SSR output with npm run build before starting Fastify.');
}

const [header, footer] = parts;
const config = ServerConfig.init({ isProd: true, isOnlyClient: false });
const manifest = SsrManifest.get(config);

configureHandler({
  getHtml: () => ({ header, footer }),
  prepare: async ({ context, executionContext }) => {
    const hints = manifest.injectAssets(context);

    if (hints.has('Link')) {
      await executionContext?.onEarlyHints?.(hints);
    }
  },
});

const app = Fastify();

await app.register(fastifyStatic, {
  root: clientDir,
  index: false,
  wildcard: false,
  immutable: true,
  maxAge: '1y',
  setHeaders: (reply, filePath) => {
    if (!filePath.startsWith(`${join(clientDir, 'assets')}${sep}`)) {
      reply.header('Cache-Control', 'public, max-age=0');
    }
  },
});
app.all('/*', adapterFastify(handler, { compression: true }));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    void app.close().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });
}

const address = await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });

console.info(`Fastify listening at ${address}`);
