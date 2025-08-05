// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tsEslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...compat.extends('airbnb-base'),
  ...tsEslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'no-console': 'warn',
      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
      'no-useless-constructor': 'off',
      'no-empty-function': 'off',
      'no-await-in-loop': 'off',
      "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
      'no-case-declarations': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
);
