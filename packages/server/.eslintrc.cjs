module.exports = {
    env: {
        node: true
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json'
    },
    plugins: [
        '@typescript-eslint'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    ignorePatterns: ['data'],
    rules: {
        '@typescript-eslint/dot-notation': 'error',
        'indent': ["error", 4],
        'eol-last': "error"
    }
};
