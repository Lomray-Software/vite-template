import { appendFile, readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

// After an intentional size change, rebuild and set ceil(total gzip bytes * 1.05 / 1024).
const SIZE_BUDGET_GZIP_KB = 103;

const assets = new URL('../build/client/assets/', import.meta.url);
const files = (await readdir(assets)).filter((file) => file.endsWith('.js')).sort();

if (files.length === 0) {
  throw new Error('No client JavaScript assets found. Run npm run build first.');
}

let totalGzip = 0;
const rows = [];

for (const file of files) {
  const content = await readFile(new URL(file, assets));
  const gzipBytes = gzipSync(content).length;

  totalGzip += gzipBytes;
  rows.push(`| ${file} | ${content.length} | ${gzipBytes} |`);
}

const summary = [
  '### Client JavaScript size',
  '',
  '| File | Raw bytes | Gzip bytes |',
  '| --- | ---: | ---: |',
  ...rows,
  '',
  `Total gzip: **${totalGzip} bytes (${(totalGzip / 1024).toFixed(2)} KB)**.`,
  `Budget: **${SIZE_BUDGET_GZIP_KB} KB (${SIZE_BUDGET_GZIP_KB * 1024} bytes)**; 1 KB = 1024 bytes.`,
  '',
].join('\n');

console.log(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}

if (totalGzip > SIZE_BUDGET_GZIP_KB * 1024) {
  console.error('Client JavaScript exceeds the gzip size budget.');
  process.exitCode = 1;
}
