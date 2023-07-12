module.exports = {
  '*.{ts,tsx}': [
    'eslint --max-warnings=0',
    'prettier --write',
  ],
  '*.{css,scss}': [
    'stylelint'
  ],
}
