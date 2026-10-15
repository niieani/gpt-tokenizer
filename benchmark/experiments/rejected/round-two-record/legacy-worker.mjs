import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { performance } from 'node:perf_hooks'
import { documents as realDocuments, probes } from '/tmp/gpt-tokenizer-warm-record-loop/benchmark/experiments/protocol.mjs'
import { tokenizers } from '/tmp/gpt-tokenizer-warm-record-loop/benchmark/experiments/../dist/tokenizers.js'
import { requirePerfLease } from '/tmp/gpt-tokenizer-warm-record-loop/benchmark/experiments/../dist/perfLease.js'
requirePerfLease()
const config = JSON.parse(process.argv[2])
const documents = []
if (config.legacy) {
  const { datasets } = await import('/tmp/gpt-tokenizer-warm-record-loop/benchmark/experiments/../dist/datasets.js')
  for (const [id, { text }] of Object.entries(datasets))
    documents.push({
      id: `legacy:${id}`,
      category: 'legacy',
      text,
      stream: [text],
    })
}
const settled = async () => {
  await new Promise(setImmediate)
  await new Promise(setImmediate)
  globalThis.gc?.()
  return process.memoryUsage()
}
function materializeInputs() {
  for (const document of documents) {
    document.text = Buffer.from(document.text, 'utf8').toString('utf8')
    document.stream = document.stream.map((text) =>
      Buffer.from(text, 'utf8').toString('utf8'),
    )
  }
}
materializeInputs()
const before = await settled()
const start = performance.now()
let tokenizer
if (config.entry === 'candidate') {
  const module = await import(pathToFileURL(config.candidate).href)
  tokenizer = {
    encode: module.encode,
    decode: (ids) => module.decode(ids),
    countTokens: module.countTokens,
  }
} else
  tokenizer = await tokenizers
    .find(
      (item) =>
        item.id ===
        (config.entry === 'baseline' ? 'gpt-tokenizer:npm' : config.entry),
    )
    .load(config.encoding)
const initializationMs = performance.now() - start
const initialized = await settled()
// The base-document first pass precedes reference loading/correctness work.
// It captures lazy work triggered by those documents; later stream variants may
// prepare additional cache entries or trigger another path during verification.
let checksum = 0
async function firstDocumentPass() {
  const timings = []
  for (const document of documents) {
    const t0 = performance.now()
    const ids = await tokenizer.encode(document.text)
    const t1 = performance.now()
    const decoded = await tokenizer.decode(ids)
    const t2 = performance.now()
    const count = await tokenizer.countTokens(document.text)
    const t3 = performance.now()
    checksum += ids.length + decoded.length + count
    timings.push({
      id: document.id,
      encodeMs: t1 - t0,
      decodeMs: t2 - t1,
      countMs: t3 - t2,
    })
  }
  return timings
}
const firstPass = await firstDocumentPass()
const afterFirstPass = await settled()
const reference = await tokenizers
  .find((item) => item.id === 'tiktoken')
  .load(config.encoding)
const semanticProbes = []
for (const text of probes) {
  try {
    const expected = Array.from(await reference.encode(text))
    const actual = Array.from(await tokenizer.encode(text))
    semanticProbes.push({
      text,
      ids: JSON.stringify(actual) === JSON.stringify(expected),
      roundTrip: (await tokenizer.decode(actual)) === text,
      count: (await tokenizer.countTokens(text)) === expected.length,
    })
  } catch (error) {
    semanticProbes.push({ text, error: String(error) })
  }
}
const prepared = []
for (const document of documents) {
  const texts = [document.text, ...document.stream]
  const ids = []
  for (const text of texts) {
    const expected = Array.from(await reference.encode(text))
    const actual = await tokenizer.encode(text)
    assert.deepEqual(Array.from(actual), expected, `${document.id}: token IDs`)
    assert.equal(
      await tokenizer.decode(actual),
      text,
      `${document.id}: round trip`,
    )
    assert.equal(
      await tokenizer.countTokens(text),
      expected.length,
      `${document.id}: count`,
    )
    ids.push(actual)
  }
  prepared.push({ ...document, texts, ids })
}
reference.free?.()
const measurements = []
for (const document of prepared) {
  for (const mode of config.modes) {
    for (const operation of config.operations) {
      let cursor = 0
      const invoke = () => {
        const index =
          mode === 'repeated' ? 0 : 1 + (cursor++ % document.stream.length)
        return operation === 'encode'
          ? tokenizer.encode(document.texts[index])
          : operation === 'decode'
            ? tokenizer.decode(document.ids[index])
            : tokenizer.countTokens(document.texts[index])
      }
      const consume =
        config.consume === 'full'
          ? (result) => {
              if (typeof result === 'number') checksum += result
              else if (typeof result === 'string') {
                // Separate end-to-end diagnostic: read even lazy string ropes.
                for (let i = 0; i < result.length; i++)
                  checksum = (checksum + result.charCodeAt(i)) >>> 0
              } else {
                for (let i = 0; i < result.length; i++)
                  checksum = (checksum + result[i]) >>> 0
              }
            }
          : (result) => {
              checksum += typeof result === 'number' ? result : result.length
            }
      const async = config.entry === 'tokenizers'
      async function loop(minMs, minCalls) {
        let calls = 0
        const began = performance.now()
        do {
          for (
            let batch = 0;
            batch < (document.text.length > 8192 ? 1 : 20);
            batch++
          ) {
            if (async) consume(await invoke())
            else consume(invoke())
            calls++
          }
        } while (performance.now() - began < minMs || calls < minCalls)
        const elapsedMs = performance.now() - began
        return { ms: elapsedMs / calls, elapsedMs, calls }
      }
      const warmup = await loop(config.warmMs, config.warmCalls)
      measurements.push({
        id: document.id,
        category: document.category,
        mode,
        operation,
        warmup,
        ...(await loop(config.minMs, 5)),
      })
    }
  }
}
const result = {
  verification: {
    passed: true,
    reference: 'tiktoken',
    documents: documents.length,
    inputs: prepared.reduce((sum, document) => sum + document.texts.length, 0),
  },
  runtime: { node: process.version, bun: process.versions.bun ?? null },
  entry: config.entry,
  round: config.round,
  initializationMs,
  before,
  initialized,
  afterFirstPass,
  firstPass,
  semanticProbes,
  measurements,
  checksum,
}
tokenizer.free?.()
process.stdout.write(JSON.stringify(result))
