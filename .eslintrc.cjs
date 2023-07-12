module.exports = {
  root: true,
  extends: [
    'prettier',
    'plugin:prettier/recommended',
    '@lomray/eslint-config'
  ],
  ignorePatterns: ['/node_modules/*', '/build/*', '*.cjs', '*.js'],
  plugins: [],
  env: {
    browser: true,
    es6: true,
    node: true,
    serviceworker: true,
  },
  globals: {
    NodeJS: true,
    JSX: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    'unicorn/import-index': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'unicorn/no-nested-ternary': 'off',
    'no-await-in-loop': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ]
  }
}
