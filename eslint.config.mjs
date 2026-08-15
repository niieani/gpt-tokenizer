import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import-x'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'src/bpeRanks/**',
      'src/chat/**',
      'src/model/**',
      'src/modelsChatEnabled.gen.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,ts}'],
    plugins: {
      import: importPlugin,
      unicorn,
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-useless-assignment': 'off',
    },
  },
)
