import * as nextPlugin from '@next/eslint-plugin-next';
import globals from "globals";
import path from "path";
import baseConfig from "./base.eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
const nextConfig = [
  {
    ...baseConfig,
    name: "next",
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: Object.assign(globals.browser, globals.node),
    },
    settings: {
      "import/resolver": {
        typescript: {project: path.resolve(process.cwd(), "tsconfig.json"), },
      },
    },
    plugins: {
      ...baseConfig.plugins,
      "@next/next": nextPlugin,
    },
    rules: {
      ...baseConfig.rules,
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    name: "next-ignores",
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts"],
  },
  {
    name: "next-overrides",
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
]

export default nextConfig
