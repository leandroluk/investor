/// <reference types="vitest" />
import {defineConfig, mergeConfig} from 'vitest/config';
import baseConfig from './base.config.mjs';

const {include = [], exclude = []} = (baseConfig.test?.coverage ?? {})

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'node',
      coverage: {
        include,
        exclude: [...exclude, 'src/main.ts'],
      },
    },
  })
);
