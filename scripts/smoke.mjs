import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { createGunzip } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(
  new URL('../node_modules/@lomray/vite-ssr-boost/cli.js', import.meta.url),
);
const wrangler = fileURLToPath(
  new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url),
);
const workerOnly = process.argv.includes('--worker-only');
const children = new Set();
const env = { ...process.env };

delete env.NO_COLOR;
let interrupted = false;

// Keep the HTTP and process helpers self-contained, following scripts/test-template.mjs
// in vite-ssr-boost. Count decoded HTML chunks so gzip headers cannot pass the stream check.
const getPort = async () => {
  const server = net.createServer();

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  const closed = once(server, 'close');

  server.close();
  await closed;

  return port;
};

const startProcess = (command, args) => {
  assert.ok(!interrupted, 'Smoke check interrupted.');
  const child = spawn(command, args, { cwd: root, stdio: 'inherit', detached: true, env });
  const processState = { child, result: null, done: null, stopping: null };

  processState.done = new Promise((resolve) => {
    const finish = (result) => {
      processState.result = result;
      resolve(result);
    };

    child.once('error', (error) => finish({ error }));
    child.once('exit', (code, signal) => finish({ code, signal }));
  });
  children.add(processState);

  return processState;
};

const stop = (state) => {
  state.stopping ??= (async () => {
    const signalGroup = (signal) => {
      if (!state.child.pid) {
        return;
      }

      try {
        process.kill(-state.child.pid, signal);
      } catch (error) {
        if (error.code !== 'ESRCH') {
          throw error;
        }
      }
    };

    signalGroup('SIGTERM');
    const timeout = setTimeout(() => signalGroup('SIGKILL'), 3_000);

    try {
      await state.done;
    } finally {
      clearTimeout(timeout);
      children.delete(state);
    }
  })();

  return state.stopping;
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    interrupted = true;
    console.error(`[smoke] Interrupted by ${signal}.`);
    await Promise.all([...children].map(stop));
    process.exit(1);
  });
}

const build = async (args = []) => {
  console.info(`[smoke] env -u NO_COLOR npx ssr-boost build ${args.join(' ')}`.trim());
  const state = startProcess('env', ['-u', 'NO_COLOR', 'npx', 'ssr-boost', 'build', ...args]);
  const { code, signal, error } = await state.done;

  if (error) {
    throw error;
  }

  assert.equal(code, 0, `ssr-boost build failed (${signal ?? code}).`);
  children.delete(state);
};

const inspect = (origin, pathname, { method = 'GET', headers = {}, timeout = 30_000 } = {}) =>
  new Promise((resolve, reject) => {
    const started = performance.now();
    const request = http.request(
      new URL(pathname, origin),
      { method, headers, signal: AbortSignal.timeout(timeout) },
      (response) => {
        const chunks = [];
        const decoded =
          response.headers['content-encoding'] === 'gzip'
            ? response.pipe(createGunzip())
            : response;

        decoded.on('data', (chunk) =>
          chunks.push({ body: chunk, at: performance.now() - started }),
        );
        decoded.on('end', () => {
          resolve({
            status: response.statusCode,
            html: Buffer.concat(chunks.map(({ body }) => body)).toString('utf8'),
            headers: response.headers,
            chunks: chunks.length,
            frames: chunks.map(({ body, at }) => ({ html: body.toString('utf8'), at })),
          });
        });
        response.on('error', reject);
        decoded.on('error', reject);
      },
    );

    request.on('error', (error) => reject(new Error(`${method} ${pathname}: ${error.message}`)));
    request.end();
  });

const waitUntilReady = async (origin, state) => {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    assert.ok(!interrupted, 'Smoke check interrupted.');
    assert.ok(
      !state.result,
      `Server exited before readiness (${state.result?.error?.message ?? state.result?.signal ?? state.result?.code}).`,
    );

    try {
      const response = await inspect(origin, '/', { timeout: 1_000 });

      if (response.status === 200) return;
    } catch {
      await delay(100);
    }
  }

  throw new Error(`Server did not become ready within 30 seconds: ${origin}`);
};

const withServer = async (mode, args, verify) => {
  const port = await getPort();
  const origin = `http://127.0.0.1:${port}`;
  const state = startProcess(
    process.execPath,
    mode === 'Worker'
      ? [
          wrangler,
          'dev',
          '--local',
          '--ip',
          '127.0.0.1',
          '--port',
          String(port),
          '--inspector-port',
          '0',
          ...args,
        ]
      : [cli, 'start', ...args, '--port', String(port)],
  );

  console.info(`[smoke] Starting ${mode} server on port ${port} (PID ${state.child.pid}).`);

  try {
    await waitUntilReady(origin, state);
    await verify(origin);
  } finally {
    await stop(state);
    console.info(`[smoke] Stopped ${mode} server (PID ${state.child.pid}).`);
  }
};

try {
  const config = JSON.parse(
    await readFile(new URL('./smoke.config.json', import.meta.url), 'utf8'),
  );
  const { routes, streamPath, crawlerCookie, crawlerRoutes } = config;

  assert.ok(Array.isArray(routes) && routes.length > 0, 'Configure at least one smoke route.');
  assert.ok(typeof streamPath === 'string' && streamPath.startsWith('/'), 'Configure streamPath.');
  assert.ok(
    typeof crawlerCookie === 'string' && crawlerCookie.length > 0,
    'Configure crawlerCookie.',
  );

  const verifySsr = async (origin, mode) => {
    for (const { path, status, contains = [], containsAny = [], headers = {} } of routes) {
      const response = await inspect(origin, path, { headers });

      assert.equal(response.status, status, `${mode} GET ${path}: expected status ${status}.`);
      for (const marker of contains) {
        assert.ok(
          response.html.includes(marker),
          `${mode} GET ${path}: missing ${JSON.stringify(marker)}.`,
        );
      }

      if (containsAny.length > 0) {
        assert.ok(
          containsAny.some((marker) => response.html.includes(marker)),
          `${mode} GET ${path}: expected one of ${JSON.stringify(containsAny)}.`,
        );
      }

      console.info(`[smoke] ${mode} GET ${path}: ${status}; content checks passed.`);
    }

    const first = routes[0];
    const head = await inspect(origin, first.path, { method: 'HEAD', headers: first.headers });

    assert.equal(head.status, first.status, `${mode} HEAD ${first.path}: unexpected status.`);
    assert.equal(head.html, '', `${mode} HEAD ${first.path}: expected an empty body.`);
    console.info(`[smoke] ${mode} HEAD ${first.path}: ${head.status}; empty body.`);

    const streamed = await inspect(origin, streamPath);

    assert.equal(streamed.status, 200, `${mode} stream ${streamPath}: expected status 200.`);
    assert.ok(
      streamed.chunks > 1,
      `${mode} stream ${streamPath}: expected more than one HTML chunk, got ${streamed.chunks}.`,
    );
    console.info(`[smoke] ${mode} stream ${streamPath}: ${streamed.chunks} HTML chunks.`);

    const crawler = await inspect(origin, streamPath, { headers: { Cookie: crawlerCookie } });

    assert.equal(crawler.status, 200, `${mode} crawler ${streamPath}: expected status 200.`);
    assert.ok(
      !crawler.html.includes('<!--$?-->'),
      `${mode} crawler ${streamPath}: pending Suspense boundary.`,
    );
    console.info(`[smoke] ${mode} crawler ${streamPath}: 200; no pending Suspense boundaries.`);

    for (const { path, contains } of crawlerRoutes) {
      const response = await inspect(origin, path, { headers: { 'User-Agent': 'Googlebot' } });

      assert.equal(response.status, 200, `${mode} Googlebot ${path}: expected status 200.`);
      for (const marker of contains) {
        assert.ok(response.html.includes(marker), `${mode} Googlebot ${path}: missing ${marker}.`);
      }
      assert.ok(
        !response.html.includes('<!--$?-->'),
        `${mode} Googlebot ${path}: pending Suspense boundary.`,
      );
      console.info(
        `[smoke] ${mode} Googlebot ${path}: 200; resolved users; no pending boundaries.`,
      );
    }
  };

  if (!workerOnly) {
    await build();
    await withServer('SSR', [], (origin) => verifySsr(origin, 'SSR'));
  }

  await build(['--focus-only', 'all']);
  const persistTo = await mkdtemp(join(tmpdir(), 'vite-template-worker-smoke-'));
  const workerArgs = ['--persist-to', persistTo];

  try {
    await withServer('Worker', workerArgs, async (origin) => {
      await verifySsr(origin, 'Worker');

      const home = await inspect(origin, '/');
      const asset = home.html.match(/(?:src|href)="(\/assets\/[^" ]+-[\w-]{8,}\.js)"/)?.[1];

      assert.ok(asset, 'Worker: no hashed JavaScript asset in the rendered document.');
      const response = await inspect(origin, asset);

      assert.equal(response.status, 200);
      assert.equal(response.headers['cache-control'], 'public, max-age=31536000, immutable');
      const head = await inspect(origin, asset, { method: 'HEAD' });

      assert.equal(head.status, 200);
      assert.equal(head.html, '');
      assert.equal(head.headers['cache-control'], response.headers['cache-control']);
      console.info('[smoke] Worker hashed asset: GET and HEAD; immutable cache header.');

      const streamed = await inspect(origin, config.worker.streamPath, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
          'Accept-Encoding': 'gzip',
        },
      });
      const resolveFrames = (streamed.html.match(/\.push\(\["resolve",/g) ?? []).length;
      const pending = streamed.frames.findIndex(({ html }) =>
        html.includes('Loading users with Await'),
      );
      const resolved = streamed.frames.findIndex(({ html }) =>
        html.includes('<li>Ada Lovelace</li>'),
      );

      assert.equal(streamed.status, 200);
      assert.equal(
        resolveFrames,
        config.worker.resolveFrames,
        'Worker: unexpected resolve frame count.',
      );
      assert.ok(
        pending >= 0 && resolved > pending,
        'Worker: pending shell must arrive before resolved users.',
      );
      assert.ok(
        streamed.frames[resolved].at - streamed.frames[pending].at > 500,
        'Worker: deferred content was buffered with the shell.',
      );
      assert.equal(streamed.headers['content-encoding'], 'identity');
      assert.ok(streamed.headers['cache-control'].includes('no-transform'));
      console.info(
        `[smoke] Worker /deferred: pending shell precedes resolved users; ${resolveFrames} resolve frame; identity/no-transform.`,
      );

      const fallback = await inspect(origin, '/api/message');

      assert.equal(fallback.status, 200);
      assert.deepEqual(JSON.parse(fallback.html), { message: 'No greeting in KV yet.' });
      const bot = await inspect(origin, config.worker.streamPath, {
        headers: { 'User-Agent': 'Googlebot' },
      });

      assert.equal(bot.status, 200);
      assert.ok(bot.html.includes('<li>Ada Lovelace</li>'));
      assert.ok(!bot.html.includes('Loading users with Await'));
      assert.ok(!bot.html.includes('<!--$?-->'));
      assert.ok(
        bot.frames[0].at > 1_000,
        'Worker Googlebot: HTML arrived before the loader resolved.',
      );
      console.info(
        '[smoke] Worker Googlebot /deferred: buffered users; no fallback or pending boundaries.',
      );
    });

    const seed = startProcess(process.execPath, [
      wrangler,
      'kv',
      'key',
      'put',
      '--local',
      '--binding',
      'MESSAGES',
      '--persist-to',
      persistTo,
      'greeting',
      config.worker.kvMessage,
    ]);
    const result = await seed.done;

    assert.equal(
      result.code,
      0,
      `Worker KV seed failed: ${result.error?.message ?? result.signal ?? result.code}.`,
    );
    children.delete(seed);
    await withServer('Worker', workerArgs, async (origin) => {
      const page = await inspect(origin, '/kv');
      const api = await inspect(origin, '/api/message');

      assert.equal(page.status, 200);
      assert.ok(
        page.html.includes(config.worker.kvMessage),
        'Worker /kv: seeded binding missing from loader data.',
      );
      assert.equal(api.status, 200);
      assert.deepEqual(JSON.parse(api.html), { message: config.worker.kvMessage });
      assert.equal(api.headers['cache-control'], 'no-store');
      const head = await inspect(origin, '/api/message', { method: 'HEAD' });
      const post = await inspect(origin, '/api/message', { method: 'POST' });

      assert.equal(head.status, 200);
      assert.equal(head.html, '');
      assert.equal(post.status, 405);
      assert.equal(post.headers.allow, 'GET, HEAD');
      console.info(
        '[smoke] Worker /kv and /api/message: seeded KV; API HEAD and method checks passed.',
      );
    });
  } finally {
    await rm(persistTo, { recursive: true, force: true });
  }

  if (!workerOnly) {
    await build(['--focus-only', 'client']);
    await withServer('SPA', ['--focus-only', 'client'], async (origin) => {
      for (const path of ['/', streamPath, '/deferred', '/kv']) {
        const response = await inspect(origin, path);

        assert.equal(response.status, 200, `SPA GET ${path}: expected status 200.`);
        assert.ok(
          !response.html.includes('window.__staticRouterHydrationData'),
          `SPA GET ${path}: unexpected hydration data.`,
        );
        console.info(`[smoke] SPA GET ${path}: 200; no hydration data.`);
      }
    });
  }

  console.info('[smoke] All checks passed.');
} catch (error) {
  console.error(`[smoke] FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  await Promise.all([...children].map(stop));
}
