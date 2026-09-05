import lomrayConfig from '@lomray/eslint-config-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  ...lomrayConfig.config(),
  {
    files: ['**/*.{ts,tsx,d.ts}'],
    settings: {
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.eslint.json',
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        NodeJS: true,
      },
    },
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];
