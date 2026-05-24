import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/utils/**/*.ts'],
      exclude: [
        'src/types/**',
        'src/constants.ts',
        'src/index.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        'dist',
        'node_modules',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 90,
      },
    },
  },
});
