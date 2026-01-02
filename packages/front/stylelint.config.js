export default {
  extends: ['stylelint-config-standard-scss'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],
  rules: {
    // BEM naming: .block__element--modifier, allows hyphens and state classes
    'selector-class-pattern': [
      '^[a-z][a-z0-9-]*(__[a-z][a-z0-9-]*)?(--[a-z][a-z0-9-]*)?$',
      {
        message:
          'Expected class to follow BEM pattern: block-name__element--modifier',
        resolveNestedSelectors: true,
      },
    ],

    // Core validation rules
    'color-no-invalid-hex': true,
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'named-grid-areas-no-invalid': true,
    'no-descending-specificity': null, // Disabled - intentional in Vue components
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': null, // Disabled - can be intentional in different contexts
    'no-invalid-double-slash-comments': true,
    'no-invalid-position-at-import-rule': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['deep', 'global', 'slotted', 'export'] },
    ],
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': [
      true,
      { ignoreTypes: ['from', 'to'] }, // Allow keyframe selectors
    ],
    'string-no-newline': true,
    'unit-no-unknown': true,

    // SCSS validation
    'scss/at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['tailwind', 'apply', 'layer', 'use', 'forward'] },
    ],
    'scss/comment-no-empty': true,
    'scss/declaration-nested-properties-no-divided-groups': true,
    'scss/dollar-variable-no-missing-interpolation': true,
    'scss/function-quote-no-quoted-strings-inside': true,
    'scss/function-unquote-no-unquoted-strings-inside': true,
    'scss/no-duplicate-dollar-variables': [
      true,
      { ignoreInside: ['at-rule', 'nested-at-rule'] },
    ],
    'scss/no-duplicate-mixins': true,
    'scss/no-global-function-names': null, // Allow global SCSS functions
    'scss/operator-no-newline-after': true,
    'scss/operator-no-newline-before': true,
    'scss/operator-no-unspaced': true,
    'scss/selector-no-redundant-nesting-selector': true,

    // Additional constraints
    'declaration-block-no-duplicate-custom-properties': true,
    'declaration-block-no-duplicate-properties': [
      true,
      { ignore: ['consecutive-duplicates-with-different-values'] },
    ],
    'declaration-block-no-shorthand-property-overrides': true,
    'function-name-case': 'lower',
    'max-nesting-depth': [
      4,
      {
        ignore: ['pseudo-classes'],
        ignoreAtRules: ['media', 'supports', 'include', 'if', 'else'],
      },
    ],
    'no-unknown-animations': true,
    'selector-max-compound-selectors': 5,
    'selector-max-id': 1,

    // Disabled in favor of SCSS versions
    'at-rule-no-unknown': null,

    // Vue scoped styles may have empty blocks
    'no-empty-source': null,
    'block-no-empty': null,

    // OKLCH decimal format
    'lightness-notation': null,
    'hue-degree-notation': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'color-function-alias-notation': null,

    // Vendor prefixes required for cross-browser support
    'property-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,

    // Formatting delegated to Prettier/oxfmt
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'scss/double-slash-comment-empty-line-before': null,

    // Style preferences
    'media-feature-range-notation': null,
    'selector-not-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'shorthand-property-no-redundant-values': null,
    'function-url-quotes': null,
    'color-hex-length': null,
    'length-zero-no-unit': null,
    'font-family-name-quotes': null,
    'value-keyword-case': null,
    'declaration-block-single-line-max-declarations': null,
    'keyframe-block-no-duplicate-selectors': null,

    // SCSS pattern rules disabled
    'scss/at-extend-no-missing-placeholder': null,
    'scss/load-no-partial-leading-underscore': null,
    'scss/dollar-variable-pattern': null,
    'scss/at-mixin-pattern': null,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,

    // Deprecated features allowed
    'property-no-deprecated': null,
    'declaration-property-value-keyword-no-deprecated': null,
  },
};
