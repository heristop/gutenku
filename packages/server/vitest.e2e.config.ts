import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest configuration for E2E tests.
 * These tests require network access to Project Gutenberg.
 *
 * Run with: pnpm test:e2e
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '~~': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/e2e/**/*.ts'],
    globals: false,
    threads: false,
    pool: 'forks',
    testTimeout: 60000, // E2E tests may take longer
    hookTimeout: 60000,
  },
});
