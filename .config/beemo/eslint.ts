import { ESLintConfig } from '@beemo/driver-eslint'

const config: ESLintConfig = {
  rules: {
    'import/no-unresolved': 'off',
  },
  ignorePatterns: ['**/models/*.js'],
}

export default config
