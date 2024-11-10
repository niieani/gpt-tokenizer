import { TypeScriptConfig } from '@beemo/driver-typescript'

const config: TypeScriptConfig & {
  compilerOptions: { verbatimModuleSyntax?: boolean }
} = {
  compilerOptions: {
    allowJs: true,
    verbatimModuleSyntax: true,
    module: 'nodenext',
    moduleResolution: 'nodenext',
  },
  include: ['src'],
}

export default config
