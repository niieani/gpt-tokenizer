import { TypeScriptConfig } from '@beemo/driver-typescript'

const config: TypeScriptConfig & {
  compilerOptions: { verbatimModuleSyntax?: boolean }
} = {
  compilerOptions: {
    allowJs: true,
    verbatimModuleSyntax: true,
    moduleResolution: 'nodenext',
    module: 'nodenext',
  },
  include: ['src'],
}

export default config
