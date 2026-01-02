export default {
  '*': ['oxfmt --no-error-on-unmatched-pattern'],
  '*.{cjs,js,ts}': ['pnpm lint'],
};
