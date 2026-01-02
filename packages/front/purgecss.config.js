export default {
  content: ['./src/**/*.vue', './src/**/*.ts', './index.html'],
  css: ['./src/assets/css/**/*.scss', './src/assets/css/**/*.css'],
  // Safelist patterns that should never be purged
  safelist: {
    standard: [
      // Theme classes
      /^data-theme/,
      // Animation classes
      /^zen-/,
      /^ink-/,
      /^floating-/,
      /^water-/,
      /^light-beam/,
      // View transitions
      /^::view-transition/,
      // Dynamic classes
      /^gutenku-/,
      /^book-/,
      /^theme-/,
    ],
    deep: [],
    greedy: [],
  },
  // Output for analysis
  output: './css-analysis/',
  rejected: true,
};
