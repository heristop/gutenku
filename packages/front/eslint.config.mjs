import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  // Ignores
  { ignores: ['eslint.config.*', 'dist', 'cypress', 'node_modules'] },

  // Base JS rules
  js.configs.recommended,

  // Vue 3 strongly-recommended rules
  ...vue.configs['flat/strongly-recommended'],


  // TypeScript baseline (non type-checked)
  ...tseslint.configs.recommended,

  // Ensure Vue SFC parsing with TS in <script>
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // TS files general language options
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      sourceType: 'module',
    },
  },

  // Local rules
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'eol-last': 'error',
      'prettier/prettier': 'error',
    },
  },

  // Cypress and its config: relax some rules
  {
    files: ['cypress.config.*', 'cypress/**/*.*'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Declaration files: allow `any` and `{}` usages
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // Prettier integration (formatting conflicts disabled and plugin rule enabled)
  prettierRecommended,
);
