import type { ScaffoldConfig } from '@niieani/scaffold'

const config: ScaffoldConfig = {
  module: '@niieani/scaffold',
  drivers: ['babel', 'eslint', 'jest', 'prettier', 'typescript', 'webpack'],
  settings: {
    name: 'GPT3Encoder',
    engineTarget: 'web',
    codeTarget: 'es2022',
    umd: {
      filename: 'gpt3encoder.js',
      export: 'default',
    },
  },
}

export default config
