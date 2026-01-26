import globals from 'globals';
import baseConfig from './base.eslint.config.mjs';
import vitestConfig from './vitest.eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
const nestConfig = [
  {
    ...baseConfig,
    name: 'nest',
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: {
        ...globals.node,
        ...globals.vitest
      }
    },
  },
  vitestConfig,
];

export default nestConfig