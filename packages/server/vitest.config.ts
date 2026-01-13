import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '~~': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.ts'],
    exclude: ['tests/fixtures/**', 'tests/helpers/**', 'tests/e2e/**'],
    globals: false,
    threads: false,
    pool: 'forks',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      all: false,
      include: [
        'src/domain/services/NaturalLanguageService.ts',
        'src/domain/services/MarkovChainService.ts',
        'src/domain/services/MarkovEvaluatorService.ts',
        'src/domain/services/HaikuGeneratorService.ts',
        'src/domain/events/QuoteGeneratedEvent.ts',
        'src/presentation/graphql/resolvers.ts',
        'src/shared/helpers/HaikuHelper.ts',
        'src/application/services/BookService.ts',
        'src/application/services/ChapterService.ts',
        'src/application/services/HaikuBridgeService.ts',
        'src/application/services/DiscordService.ts',
        'src/application/events/GraphQLEventBus.ts',
        'src/infrastructure/services/PubSubService.ts',
        'src/infrastructure/services/CanvasService.ts',
        'src/infrastructure/services/MongoConnection.ts',
        'src/infrastructure/services/OpenAIGeneratorService.ts',
        'src/application/commands/book/**/*.ts',
        'src/application/commands/haiku/**/*.ts',
        'src/application/queries/books/**/*.ts',
        'src/application/queries/chapters/**/*.ts',
        'src/application/queries/haiku/**/*.ts',
        'src/application/queries/puzzle/**/*.ts',
        'src/application/queries/stats/**/*.ts',
      ],
      exclude: ['**/tests/**', '**/dist/**', '**/scripts/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
});
