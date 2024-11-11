export default {
  '*.{ts,tsx}': [
    'eslint --max-warnings=0 --no-warn-ignored',
    'prettier --write',
  ],
  '*.{css,scss}': [
    'stylelint'
  ],
}
