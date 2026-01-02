export default {
  '*': ['oxfmt --no-error-on-unmatched-pattern'],
  '*.{mjs,js,ts,tsx,vue}': ['oxlint'],
  '*.{ts,tsx,vue}': () => 'pnpm typecheck',
};
