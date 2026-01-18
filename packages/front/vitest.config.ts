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
  : resolve(dirname(fileURLToPath(import.meta.url)), './src/features/game-stub');

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
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/core/composables/**/*.ts',
        'src/features/haiku/composables/**/*.ts',
        'src/features/haiku/store/**/*.ts',
        'src/features/blog/composables/**/*.ts',
      ],
    },
  },
});
