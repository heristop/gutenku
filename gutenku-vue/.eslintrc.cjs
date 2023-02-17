// eslint-disable-next-line no-undef
module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-strongly-recommended',
        'plugin:vuetify/base',
        '@vue/eslint-config-typescript',
    ],
    rules: {
        'vue/multi-word-component-names': 'off',
        'indent': ["error", 4],
    },
    ignorePatterns: ['cypress'],
}
