module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: false,
    es2021: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'arrow-body-style': 'error',
    'no-console': 'off',
    'no-extra-boolean-cast': 'off',
    'no-mixed-operators': 'off',
    'prettier/prettier': 'error',
  },
};
