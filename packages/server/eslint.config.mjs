import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  // Ignores
  { ignores: ['eslint.config.*', 'data', 'node_modules', 'dist', 'coverage'] },

  // Base JS rules
  js.configs.recommended,

  // TypeScript baseline (non type-checked)
  ...tseslint.configs.recommended,

  // Project-aware parser options and local rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { sourceType: 'module' },
    rules: {
      'dot-notation': 'error',
      'eol-last': 'error',
      'prettier/prettier': 'error',
    },
  },

  // Prettier integration (formatting conflicts disabled and plugin rule enabled)
  prettierRecommended,

  // CJS ecosystem config: allow Node globals
  {
    files: ['ecosystem.config.cjs'],
    rules: { 'no-undef': 'off' },
  },
);
