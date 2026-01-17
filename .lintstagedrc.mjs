export default {
  '*': ['oxfmt --no-error-on-unmatched-pattern'],
  '*.{mjs,js,ts,tsx,vue}': ['oxlint'],
  '*.{ts,tsx,vue}': [
    () => 'pnpm typecheck',
    () =>
      'pnpm exec depcruise packages --include-only "^packages/.*/src" --config --output-type err --validate .dependency-cruiser.js',
  ],
};
