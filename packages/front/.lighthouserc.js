module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm preview --port 4444',
      startServerReadyPattern: 'Local',
      url: [
        'http://localhost:4444/',
        'http://localhost:4444/game',
        'http://localhost:4444/haiku',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
