// libs/config-eslint/vitest.eslint.config.mjs
/** @type {import('eslint').Linter.Config} */
const vitestConfig = {
  name: 'vitest',
  files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/unbound-method': 'off'
  },
  ignores: [
    '.*.js',
    '*.setup.js',
    '*.config.js',
    '.turbo/',
    '.coverage/',
    'dist/',
    'node_modules/',
  ],
}

export default vitestConfig