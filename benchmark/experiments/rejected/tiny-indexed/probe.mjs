import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { documents } from '../../protocol.mjs'

if (process.versions.bun ? process.versions.bun !== '1.4.3' : process.versions.node !== '26.12.0') throw Error('Unexpected engine version')

const root = fileURLToPath(new URL('../../../..', import.meta.url))
const hash = (value) => createHash('sha256').update(value).digest('hex')
const inputs = [
  { id: 'English', text: 'The quick brown fox jumps over the lazy dog.' },
  { id: 'Chinese', text: '快速的棕色狐狸跳过懒狗。' },
  { id: 'French', text: 'Le renard brun rapide saute par-dessus le chien paresseux.' },
  { id: 'Code', text: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}' },
  ...documents.filter(({ id }) => ['support', 'typescript', 'api-json', 'cjk', 'mixed', 'readme.md'].includes(id)),
]
if (process.argv[2] === 'driver') {
  const [, , , engine, encoding, output, baseline] = process.argv
  const samples = []
  if (readFileSync(resolve(root, 'package.json'), 'utf8').length < 1) throw Error('root')
  for (let round = 0; round < 3; round++) {
    for (const variant of round % 2 ? ['npm', 'candidate', 'baseline'] : ['baseline', 'candidate', 'npm']) {
      const child = spawnSync(engine, [fileURLToPath(import.meta.url), 'child', variant, encoding, baseline], { encoding: 'utf8', maxBuffer: 10_000_000 })
      if (child.status !== 0) throw Error(child.stderr || child.stdout)
      samples.push({ round, ...JSON.parse(child.stdout) })
      writeFileSync(output, JSON.stringify({ complete: false, samples }, null, 2))
    }
  }
  writeFileSync(output, JSON.stringify({ complete: true, rounds: 3, warmMs: 300, measureMs: 300, inputs: inputs.map(({id,text}) => ({ id, sha256: hash(text) })), samples }, null, 2))
  console.log(JSON.stringify({ complete: true, encoding, output, samples: samples.length }))
} else {
  const [, , , variant, encoding, baseline] = process.argv
  const { requirePerfLease } = await import(resolve(process.env.TINY_PARENT_BENCH, 'dist/perfLease.js'))
  requirePerfLease()
  const modulePath = variant === 'candidate' ? resolve(root, 'esm/encoding', `${encoding}.js`) : variant === 'baseline' ? resolve(baseline, 'esm/encoding', `${encoding}.js`) : resolve(root, 'benchmark/node_modules/gpt-tokenizer/esm/encoding', `${encoding}.js`)
  const { default: api } = await import(modulePath)
  const measurements = []
  let checksum = 0
  for (const input of inputs) {
    if (variant === 'npm' && input.stream) continue
    for (const mode of input.stream ? ['repeated', 'stream'] : ['repeated']) {
      const texts = mode === 'stream' ? input.stream : [input.text]
      const ids = texts.map((text) => api.encode(text))
      ids.forEach((tokens, i) => { if (api.decode(tokens) !== texts[i]) throw Error('roundtrip') })
      for (const consumer of ['length', 'full']) {
        let cursor = 0
        const consume = consumer === 'length'
          ? (text) => { checksum = (checksum + text.length) >>> 0 }
          : (text) => { for (let i = 0; i < text.length; i++) checksum = (checksum + text.charCodeAt(i)) >>> 0 }
        const run = (budget) => {
          const start = performance.now()
          let calls = 0
          do {
            for (let batch = 0; batch < 20; batch++) {
              consume(api.decode(ids[cursor++ % ids.length]))
              calls++
            }
          } while (performance.now() - start < budget)
          const elapsedMs = performance.now() - start
          return { ms: elapsedMs / calls, elapsedMs, calls }
        }
        const warmup = run(300)
        measurements.push({ id: input.id, mode, consumer, tokens: ids[0].length, sha256: hash(input.text), warmup, ...run(300) })
      }
    }
  }
  console.log(JSON.stringify({ variant, encoding, runtime: { node: process.versions.node, bun: process.versions.bun ?? null }, coreSha256: hash(readFileSync(resolve(modulePath, '../../BytePairEncodingCore.js'))), checksum, measurements }))
}
