import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**'],
  },

  js.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  ...tseslint.configs.recommended,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', //-- use proper datatype
      // '@typescript-eslint/no-unused-vars': 'off', //-- dont declare unused variables
      // 'no-async-promise-executor': 'off', //--not use async functions inside new Promise
      // 'prefer-const': 'off',// --use const instead of let when variables are not reassigned
      // '@typescript-eslint/no-var-requires': 'off', //--use import statements instead of require() calls
      // '@typescript-eslint/ban-types': 'off', //-- avoid generic types like Object, Function, etc- use specific types instead
    },
  },
];
