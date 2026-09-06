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
  {
    files: ['src/worker.ts'],
    rules: {
      // This manifest does not exist until the first client build.
      'import-x/no-unresolved': ['error', { ignore: ['^../build/client/assets-manifest\\.json$'] }],
    },
    languageOptions: {
      globals: { ExportedHandler: 'readonly' },
      parserOptions: {
        projectService: false,
        project: './tsconfig.worker.json',
      },
    },
  },
];
