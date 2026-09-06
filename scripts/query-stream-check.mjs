import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36';

export const countResolveFrames = (html) =>
  [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .filter(([, script]) => script.includes('__ssrBoostStream'))
    .reduce((count, [, script]) => count + [...script.matchAll(/\.push\(\["resolve",/g)].length, 0);

// Run against a production SSR server, or import from the SSR/SPA smoke runner.
export const verifyQueryStreaming = async (origin, outputDir) => {
  const save = async (name, html) => {
    if (outputDir) {
      await mkdir(outputDir, { recursive: true });
      await writeFile(`${outputDir}/${name}.html`, html);
    }
  };
  const started = performance.now();
  const response = await fetch(`${origin}/users/2`, {
    headers: { 'User-Agent': userAgent },
    signal: AbortSignal.timeout(10_000),
  });

  assert.equal(response.status, 200);
  let html = '';
  let fallbackAt;
  let resolvedAt;
  const decoder = new TextDecoder();

  for await (const chunk of response.body) {
    html += decoder.decode(chunk, { stream: true });
    const elapsed = performance.now() - started;

    if (fallbackAt === undefined && html.includes('Loading user…')) {
      fallbackAt = elapsed;
      console.info(
        `[query-stream] +${elapsed.toFixed(0)} ms fallback: <p role="status">Loading user…</p>`,
      );
      assert.ok(
        !html.includes('<h1>Grace Hopper</h1>'),
        'The fallback must arrive before the profile.',
      );
    }
    if (resolvedAt === undefined && html.includes('<h1>Grace Hopper</h1>')) {
      resolvedAt = elapsed;
      console.info(`[query-stream] +${elapsed.toFixed(0)} ms resolved: <h1>Grace Hopper</h1>`);
    }
  }

  html += decoder.decode();
  await save('stream-users-2', html);
  assert.ok(fallbackAt !== undefined && resolvedAt !== undefined);
  assert.ok(
    resolvedAt - fallbackAt >= 600,
    'Expected the 800 ms query to resolve after the shell.',
  );
  assert.equal(
    countResolveFrames(html),
    1,
    'Transfer the detail query result in exactly one resolve frame.',
  );
  console.info(
    '[query-stream] /users/2: 1 __ssrBoostStream resolve frame; fallback precedes result by >=600 ms.',
  );

  const list = await fetch(`${origin}/users`, { signal: AbortSignal.timeout(10_000) });
  const listHtml = await list.text();

  assert.equal(list.status, 200);
  assert.ok(listHtml.includes('Ada Lovelace'));
  assert.equal(countResolveFrames(listHtml), 0);
  assert.ok(!listHtml.includes('<!--$?-->'));
  console.info('[query-stream] /users: resolved list; 0 resolve frames; 0 pending boundaries.');

  const botStarted = performance.now();
  const bot = await fetch(`${origin}/users/2`, {
    headers: { 'User-Agent': 'Googlebot' },
    signal: AbortSignal.timeout(10_000),
  });
  const botHtml = await bot.text();

  await save('googlebot-users-2', botHtml);
  assert.equal(bot.status, 200);
  assert.ok(botHtml.includes('<h1>Grace Hopper</h1>'));
  assert.ok(botHtml.includes('Computer scientist'));
  assert.ok(!botHtml.includes('<!--$?-->'));
  assert.ok(!botHtml.includes('Loading user…'));
  assert.equal(countResolveFrames(botHtml), 1);
  console.info(
    `[query-stream] Googlebot +${(performance.now() - botStarted).toFixed(0)} ms: 200; Grace Hopper; 0 <!--$?-->; 1 resolve frame.`,
  );

  const profiles = [
    { id: '1', name: 'Ada Lovelace' },
    { id: '2', name: 'Grace Hopper' },
  ];

  // execFile starts both curl children before either response is awaited.
  const captures = await Promise.all(
    profiles.map(async ({ id, name }) => {
      const { stdout } = await exec('curl', [
        '--fail',
        '--silent',
        '--show-error',
        '--no-buffer',
        '--max-time',
        '10',
        '--user-agent',
        userAgent,
        `${origin}/users/${id}`,
      ]);

      await save(`concurrent-users-${id}`, stdout);
      assert.ok(stdout.includes(`<h1>${name}</h1>`));
      for (const other of ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'].filter(
        (value) => value !== name,
      )) {
        assert.ok(!stdout.includes(other), `/users/${id} leaked ${other}.`);
      }
      assert.equal(countResolveFrames(stdout), 1);

      return `[query-stream] parallel curl /users/${id}: only ${name}; 1 resolve frame.`;
    }),
  );

  captures.forEach((line) => console.info(line));
  console.info('[query-stream] All checks passed.');
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifyQueryStreaming(process.argv[2] ?? 'http://localhost:3000', process.argv[3]);
}
