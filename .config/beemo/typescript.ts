import { TypeScriptConfig } from '@beemo/driver-typescript'

const config: TypeScriptConfig & {
  compilerOptions: { verbatimModuleSyntax?: boolean }
} = {
  compilerOptions: {
    allowJs: true,
    verbatimModuleSyntax: true,
    moduleResolution: 'nodenext',
  },
  include: ['src'],
}

export default config
