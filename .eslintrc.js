module.exports = {
  extends: [
    'plugin:prettier/recommended',
    'plugin:security/recommended',
  ],
  plugins: [
    'html'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'prefer-const': 'error',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'security/detect-object-injection': 'off',
    'no-unused-vars': 2,
    'no-undef': 2,
    'prettier/prettier': 'off',
    'semi': 2
  },
  globals: {
    Cypress: true,
    RED: true,
    $: true
  },
  env: {
    'amd': true,
    'node': true,
    'es6': true,
    'jest': true,
  }
};
