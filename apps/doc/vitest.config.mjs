import config from '@libs/config-vitest/frontend.config.mjs';
import {defineConfig, mergeConfig} from 'vitest/config';

export default mergeConfig(
  config,
  defineConfig({
    test: {
      setupFiles: ['./vitest.setup.ts'], // local do web
    },
  })
);