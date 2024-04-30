module.exports = {
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['data', '.eslintrc.cjs'],
  rules: {
    '@typescript-eslint/dot-notation': 'error',
    'eol-last': 'error',
    'prettier/prettier': 'error',
  },
};
