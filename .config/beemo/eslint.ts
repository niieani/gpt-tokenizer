import { ESLintConfig } from '@beemo/driver-eslint'

const config: ESLintConfig = {
  rules: {
    'import/no-unresolved': 'off',
  },
  ignorePatterns: ['**/models/*.js', 'benchmark/**/*.ts'],
}

export default config
