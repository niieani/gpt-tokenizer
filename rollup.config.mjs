import terser from '@rollup/plugin-terser'

const bundles = [
  ['main.js', 'cl100k_base.js', 'GPTTokenizer_cl100k_base'],
  ['encoding/p50k_base.js', 'p50k_base.js', 'GPTTokenizer_p50k_base'],
  ['encoding/p50k_edit.js', 'p50k_edit.js', 'GPTTokenizer_p50k_edit'],
  ['encoding/r50k_base.js', 'r50k_base.js', 'GPTTokenizer_r50k_base'],
  ['encoding/o200k_base.js', 'o200k_base.js', 'GPTTokenizer_o200k_base'],
  [
    'encoding/o200k_harmony.js',
    'o200k_harmony.js',
    'GPTTokenizer_o200k_harmony',
  ],
]

const defaultExportFacade = (entry) => ({
  name: 'default-export-facade',
  resolveId(id) {
    return id === '\0entry' ? id : null
  },
  load(id) {
    return id === '\0entry'
      ? `export { default } from ${JSON.stringify(`./esm/${entry}`)}`
      : null
  },
})

export default bundles.map(([entry, file, name]) => ({
  input: '\0entry',
  output: {
    exports: 'default',
    file: `dist/${file}`,
    format: 'umd',
    name,
    sourcemap: true,
  },
  plugins: [defaultExportFacade(entry), terser()],
}))
