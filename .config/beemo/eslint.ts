import { ESLintConfig } from '@beemo/driver-eslint'

const config: ESLintConfig = {
  rules: {
    'import/no-unresolved': 'off',
  },
  ignorePatterns: [
    '**/models/*.js',
    'src/model/*.ts',
    'benchmark/**/*.ts',
    'src/codegen/*.js',
  ],
}

export default config
