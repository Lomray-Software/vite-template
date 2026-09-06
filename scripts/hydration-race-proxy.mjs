// Run against npm run start:ssr. HTML streams immediately; cache headers are preserved.
// UPSTREAM=http://127.0.0.1:3000 env -u NO_COLOR node scripts/hydration-race-proxy.mjs
import http from 'node:http';

const upstream = new URL(process.env.UPSTREAM || 'http://127.0.0.1:3000');
const moduleDelay = Number(process.env.MODULE_DELAY_MS || 300);
const server = http.createServer((request, response) => {
  const target = new URL(request.url, upstream);
  const upstreamRequest = http.request(
    target,
    { method: request.method, headers: { ...request.headers, host: upstream.host } },
    (upstreamResponse) => {
      const forward = () => {
        if (response.destroyed) return;
        response.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
        upstreamResponse.pipe(response);
      };

      upstreamResponse.on('error', () => response.destroy());
      if (/\.m?js$/.test(target.pathname)) setTimeout(forward, moduleDelay);
      else forward();
    },
  );

  upstreamRequest.on('error', () => {
    if (!response.headersSent) response.writeHead(502);
    response.end('Production server unavailable');
  });
  response.on('close', () => upstreamRequest.destroy());
  request.pipe(upstreamRequest);
});

server.listen(Number(process.env.PORT || 4174), '127.0.0.1', () => {
  console.info(
    `Hydration proxy: http://127.0.0.1:${server.address().port}; JS delay ${moduleDelay} ms`,
  );
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close();
    server.closeAllConnections();
  });
}
