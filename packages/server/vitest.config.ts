import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.ts'],
    globals: false,
    threads: false,
    pool: 'forks',
    setupFiles: ['vitest.setup.ts'],
  },
  coverage: {
    provider: 'istanbul',
    reporter: ['text', 'html', 'lcov'],
    reportsDirectory: './coverage',
    all: true,
    include: [
      'src/domain/services/NaturalLanguageService.ts',
      'src/domain/services/MarkovChainService.ts',
      'src/domain/services/HaikuGeneratorService.ts',
      'src/presentation/graphql/resolvers.ts',
      'src/shared/helpers/HaikuHelper.ts',
      'src/application/services/BookService.ts',
      'src/application/services/ChapterService.ts',
      'src/infrastructure/services/PubSubService.ts',
    ],
    exclude: [
      '**/tests/**',
      '**/dist/**',
      '**/scripts/**',
      '**/src/index.ts',
      '**/src/**/models/**',
      '**/src/infrastructure/**',
      '**/src/shared/themes/**',
    ],
    thresholds: {
      lines: 0.8,
      functions: 0.8,
      statements: 0.8,
      branches: 0.7,
    },
  },
});
