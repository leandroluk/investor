// libs/config-vitest/base.config.mjs
/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: [
      'test/**/*.{e2e-test,test,spec}.{js,jsx,ts,tsx}',
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './.coverage',
      include: ['src/**/*.{ts,js,tsx,jsx}'],
      exclude: ['**/index.ts', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {'#': 'src'},
  },
});
