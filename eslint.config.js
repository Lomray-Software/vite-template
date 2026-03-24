import lomrayConfig from '@lomray/eslint-config-react';

export default [
  ...lomrayConfig.config(),
  {
    rules: {
      'no-restricted-imports': 'off'
    }
  }
];
