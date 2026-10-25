export default {
  '*': ['oxfmt --no-error-on-unmatched-pattern'],
  '*.{cjs,js,ts,tsx,vue}': ['pnpm lint --no-error-on-unmatched-pattern'],
  '*.{vue,scss,css}': ['pnpm exec stylelint --fix'],
};
