import { appendFile, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const directory = process.argv[2] ?? '.lighthouseci';
const files = (await readdir(directory)).filter((file) => /^lhr-.*\.json$/.test(file));
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const reportsByUrl = new Map();

if (files.length === 0) {
  throw new Error(`No Lighthouse reports found in ${directory}.`);
}

for (const file of files) {
  const report = JSON.parse(await readFile(join(directory, file), 'utf8'));
  const url = report.requestedUrl;

  if (!url || report.runtimeError) {
    throw new Error(`Incomplete Lighthouse report: ${file}.`);
  }

  const reports = reportsByUrl.get(url) ?? [];

  reports.push(report);
  reportsByUrl.set(url, reports);
}

const rows = [...reportsByUrl.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([url, reports]) => {
    const medians = categories.map((category) => {
      const scores = reports.map((report) => report.categories[category]?.score);

      if (scores.some((score) => typeof score !== 'number' || !Number.isFinite(score))) {
        throw new Error(`Missing ${category} score for ${url}.`);
      }

      scores.sort((a, b) => a - b);
      const middle = Math.floor(scores.length / 2);
      const median = scores.length % 2 ? scores[middle] : (scores[middle - 1] + scores[middle]) / 2;

      return (median * 100).toFixed(1);
    });

    return `| ${url} | ${reports.length} | ${medians.join(' | ')} |`;
  });

const summary = [
  '### Lighthouse median category scores',
  '',
  'Each category is the median across the runs for that URL, on a 0–100 scale.',
  '',
  '| URL | Runs | Performance | Accessibility | Best practices | SEO |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...rows,
  '',
].join('\n');

console.log(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}
