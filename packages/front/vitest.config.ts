import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

const gutenguessBasePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../private/gutenguess',
);
const privateGamePath = resolve(gutenguessBasePath, 'packages/front');
const isGameEnabled = existsSync(privateGamePath);
const gameModulePath = isGameEnabled
  ? privateGamePath
  : resolve(
      dirname(fileURLToPath(import.meta.url)),
      './src/features/game-stub',
    );

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@/features/game': gameModulePath,
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
      '@gutenguess/shared': resolve(gutenguessBasePath, 'packages/shared/src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/unit/features/game/**/*.test.ts', 'node_modules/**'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Measured surface: testable TypeScript business logic only.
      include: [
        'src/core/composables/**/*.ts',
        'src/features/haiku/composables/**/*.ts',
        'src/features/haiku/store/**/*.ts',
        'src/features/blog/composables/**/*.ts',
        'src/utils/**/*.ts',
        'src/services/**/*.ts',
        'src/store/**/*.ts',
        'src/locales/config.ts',
      ],
      exclude: [
        // Presentational SFCs and view components (template-heavy)
        '**/*.vue',
        // Entry points, plugins, generated and types-only files
        'src/main.ts',
        'src/App.vue',
        'src/client.ts',
        'src/analytics-setup.ts',
        'src/router/**',
        'src/core/plugins/**',
        'src/core/types/**',
        'src/locales/index.ts',
        'src/features/game-stub/**',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        // Heavy DOM-measurement composable: depends on pretext layout,
        // ResizeObserver and getComputedStyle font metrics that jsdom
        // cannot reproduce deterministically.
        'src/features/haiku/composables/marker-layout.ts',
        // Touch/long-press gesture orchestration relies on real pointer/touch
        // hardware semantics (vueuse useSwipe internals) not faithfully
        // emulated by jsdom; covered indirectly via integration/e2e.
        'src/core/composables/touch-gestures.ts',
        'dist/**',
        'node_modules/**',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
