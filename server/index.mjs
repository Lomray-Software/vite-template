import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import adapterFastify from '@lomray/vite-ssr-boost/adapters/fastify';
import { createRouteAssetPreparer, loadHtmlShell } from '@lomray/vite-ssr-boost/node/production';
import Fastify from 'fastify';
import { configureHandler, handler } from '../build/server/server.js';

const buildDir = fileURLToPath(new URL('../build/', import.meta.url));
const clientDir = join(buildDir, 'client');

configureHandler({
  getHtml: await loadHtmlShell({ indexFile: join(clientDir, 'index.html') }),
  prepare: createRouteAssetPreparer({ buildDir }),
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
