import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { documents } from './protocol.mjs'

if (process.versions.bun ? process.versions.bun !== '1.4.3' : process.versions.node !== '26.12.0') throw Error('Unexpected engine version')

const root = fileURLToPath(new URL('../..', import.meta.url))
const hash = (value) => createHash('sha256').update(value).digest('hex')
const rounds = Number(process.env.TINY_ROUNDS || 5)
const warmMs = Number(process.env.TINY_WARM_MS || 500)
const minMs = Number(process.env.TINY_MIN_MS || 500)
const inputs = [
  { id: 'English', text: 'The quick brown fox jumps over the lazy dog.' },
  { id: 'Chinese', text: '快速的棕色狐狸跳过懒狗。' },
  { id: 'French', text: 'Le renard brun rapide saute par-dessus le chien paresseux.' },
  { id: 'Code', text: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}' },
  ...documents.filter(({ id }) => ['support', 'typescript', 'api-json', 'cjk', 'mixed', 'readme.md'].includes(id)),
].filter(({id}) => ['English', 'Chinese', 'support', 'typescript', 'api-json', 'cjk'].includes(id))
const rawBytes = Array.from({length: 127}, (_, i) => [0xf0, 0x9f, 0x98, 0x80, 0x61, 0xc3, 0x61, 0xff][i % 8])
inputs.push({id: 'malformed-127', text: new TextDecoder('utf8', {ignoreBOM: true}).decode(new Uint8Array(rawBytes)), rawBytes})
const selected = (process.env.TINY_SELECT || 'English,Chinese,support,typescript,api-json,malformed-127').split(',')
const selectedInputs = inputs.filter(({id}) => selected.includes(id))
if (process.argv[2] === 'driver') {
  const [, , , engine, encoding, output, baseline] = process.argv
  if (existsSync(output)) throw Error('Preserve existing measurements: choose a new output')
  const samples = []
  if (readFileSync(new URL('../../package.json', import.meta.url), 'utf8').length < 1) throw Error('root')
  for (let round = 0; round < rounds; round++) {
    const entries = process.env.TINY_NO_AI ? ['baseline', 'candidate'] : ['baseline', 'candidate', 'ai-tokenizer']
    for (const variant of round % 2 ? entries.reverse() : entries) {
      const child = spawnSync(engine, [fileURLToPath(import.meta.url), 'child', variant, encoding, baseline], { encoding: 'utf8', maxBuffer: 10_000_000 })
      if (child.status !== 0) throw Error(child.stderr || child.stdout)
      samples.push({ round, ...JSON.parse(child.stdout) })
      writeFileSync(output, JSON.stringify({ complete: false, samples }, null, 2))
    }
  }
  writeFileSync(output, JSON.stringify({ complete: true, rounds, warmMs, measureMs: minMs, scriptSha256: hash(readFileSync(fileURLToPath(import.meta.url))), inputs: selectedInputs.map(({id,text,rawBytes,stream}) => ({ id, sha256: hash(rawBytes ? JSON.stringify(rawBytes) : text), streamSha256: stream?.map(hash) })), samples }, null, 2))
  console.log(JSON.stringify({ complete: true, encoding, output, samples: samples.length }))
} else {
  const [, , , variant, encoding, baseline] = process.argv
  const { requirePerfLease } = await import(resolve(process.env.TINY_PARENT_BENCH, 'dist/perfLease.js'))
  requirePerfLease()
  const modulePath = variant === 'candidate' ? resolve(root, 'esm/encoding', `${encoding}.js`) : resolve(baseline, 'esm/encoding', `${encoding}.js`)
  const {tokenizers} = await import(resolve(process.env.TINY_PARENT_BENCH, 'dist/tokenizers.js'))
  const reference = await tokenizers.find(({id}) => id === 'tiktoken').load(encoding)
  const api = variant === 'ai-tokenizer' ? await tokenizers.find(({id}) => id === 'ai-tokenizer').load(encoding) : (await import(modulePath)).default
  const measurements = []
  let checksum = 0
  for (const input of selectedInputs) {
    if (variant === 'ai-tokenizer' && input.rawBytes) continue
    for (const mode of input.stream ? ['repeated', 'stream'] : ['repeated']) {
      const texts = mode === 'stream' ? input.stream : [input.text]
      const ids = input.rawBytes ? [input.rawBytes.map((byte) => {
        const rank = api.bytePairEncodingCoreProcessor.bytePairRankDecoder.findIndex((value) => typeof value === 'string' ? byte < 128 && value === String.fromCharCode(byte) : value?.length === 1 && value[0] === byte)
        if(rank < 0) throw Error('missing raw byte token')
        return rank
      })] : texts.map((text) => Array.from(reference.encode(text)))
      if(!input.rawBytes) ids.forEach((tokens, i) => {if(JSON.stringify(Array.from(api.encode(texts[i]))) !== JSON.stringify(tokens)) throw Error('token IDs mismatch')})
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
        const warmup = run(warmMs)
        measurements.push({ id: input.id, mode, consumer, tokens: ids[0].length, idsSha256: hash(JSON.stringify(ids)), sha256: hash(input.rawBytes ? JSON.stringify(input.rawBytes) : input.text), warmup, ...run(minMs) })
      }
    }
  }
  console.log(JSON.stringify({ variant, encoding, packageVersion: variant === 'ai-tokenizer' ? '1.0.7' : undefined, runtime: { node: process.versions.node, bun: process.versions.bun ?? null }, coreSha256: variant === 'ai-tokenizer' ? undefined : hash(readFileSync(resolve(modulePath, '../../BytePairEncodingCore.js'))), checksum, measurements }))
}
