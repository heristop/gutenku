export default {
  '*': ['oxfmt --no-error-on-unmatched-pattern'],
  '*.{ts,tsx,vue}': () => 'pnpm typecheck',
};
