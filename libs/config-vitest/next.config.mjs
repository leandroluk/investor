/// <reference types="vitest" />
import {defineConfig, mergeConfig} from 'vitest/config';
import base from './base.config.mjs';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.{test,spec}.tsx', 'test/**/*.{test,spec}.tsx'],
    },
  })
);
