import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/__tests__/**', '**/node_modules/**', '**/dist/**'],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'arrow-body-style': 'error',
      'no-console': 'off',
      'no-extra-boolean-cast': 'off',
      'no-mixed-operators': 'off',
      'prettier/prettier': 'error',
    },
  },
];
