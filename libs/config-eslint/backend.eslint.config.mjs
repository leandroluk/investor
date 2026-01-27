// libs/config-eslint/backend.eslint.config.mjs
import globals from 'globals';
import baseConfig from './base.eslint.config.mjs';
import vitestConfig from './vitest.eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
const backendConfig = [
  {
    ...baseConfig,
    name: 'backend',
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

export default backendConfig