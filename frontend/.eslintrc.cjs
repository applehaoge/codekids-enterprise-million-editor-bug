module.exports = {
  ignorePatterns: ['**/*副本*', '**/*.txt'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['@typescript-eslint','react','react-hooks'],
  extends: ['eslint:recommended','plugin:@typescript-eslint/recommended','plugin:react/recommended'],
  settings: { react: { version: 'detect' } },
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "NewExpression[callee.name='WebSocket']",
        message: "禁止直接 new WebSocket()。必须使用 frontend/src/wsClient.js 提供的接口，并从 .env 中读取 VITE_WS_URL。"
      }
    ],
    'no-unused-vars': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }]
  },
  overrides: [
    {
      files: ['src/wsClient.js','src/wsClient.*'],
      rules: { 'no-restricted-syntax': 'off' }
    }
  ]
};