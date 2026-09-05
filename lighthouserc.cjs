module.exports = {
  ci: {
    collect: {
      url: process.env.LIGHTHOUSE_URLS
        ? JSON.parse(process.env.LIGHTHOUSE_URLS)
        : ['http://127.0.0.1:4173/', 'http://127.0.0.1:4173/details'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
