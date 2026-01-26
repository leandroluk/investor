import globals from 'globals'
import path from 'path'
import baseConfig from './base.eslint.config.mjs'

/** @type {import('eslint').Linter.Config[]} */
const libraryConfig = [
  {
    ...baseConfig,
    name: 'library',
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        typescript: {project: path.resolve(process.cwd(), 'tsconfig.json'), },
      },
    },
    rules: {
      ...baseConfig.rules,
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    name: "library-ignores",
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts"],
  },
  {
    name: "library-overrides",
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
]

export default libraryConfig
