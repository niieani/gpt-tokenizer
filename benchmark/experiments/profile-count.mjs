// Unranked CPU diagnostic for the realistic long-README count gap.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { Session } from 'node:inspector'
import { performance } from 'node:perf_hooks'
import { documents } from './protocol.mjs'
import { tokenizers } from '../dist/tokenizers.js'
import { requirePerfLease } from '../dist/perfLease.js'
import { builtModuleHashes } from '../dist/provenance.js'
requirePerfLease()
assert.equal(process.version, 'v26.12.0')
assert.equal(process.versions.bun, undefined)
const output = process.argv[2]
assert.ok(output && !existsSync(output), 'Choose a new output path')
const document = documents.find((item) => item.id === 'readme.md')
assert.ok(document, 'Pinned README must exist')
const reference = await tokenizers
  .find((item) => item.id === 'tiktoken')
  .load('o200k_base')
const expected = await reference.countTokens(document.text)
reference.free?.()
const result = {
  schema: 1,
  diagnostic: 'unranked repeated long-README count CPU profile',
  complete: false,
  runtime: { version: process.version, executable: process.execPath },
  candidateBuild: builtModuleHashes(),
  harnessSha256: createHash('sha256')
    .update(readFileSync(new URL(import.meta.url)))
    .digest('hex'),
  input: {
    id: document.id,
    sha256: createHash('sha256').update(document.text).digest('hex'),
    tokens: expected,
  },
  samplingIntervalMicroseconds: 1000,
  warmupMs: 1000,
  profileMs: 5000,
  entries: [],
}
for (const id of [
  'gpt-tokenizer:npm',
  'gpt-tokenizer:local',
  '@goliapkg/tiktoken-wasm',
]) {
  const tokenizer = await tokenizers
    .find((item) => item.id === id)
    .load('o200k_base')
  assert.equal(tokenizer.countTokens(document.text), expected)
  const count = () => tokenizer.countTokens(document.text)
  let checksum = 0
  const warm = performance.now()
  while (performance.now() - warm < result.warmupMs) checksum += count()
  const session = new Session()
  session.connect()
  const post = (method, params = {}) =>
    new Promise((resolve, reject) =>
      session.post(method, params, (error, value) =>
        error ? reject(error) : resolve(value),
      ),
    )
  await post('Profiler.enable')
  await post('Profiler.setSamplingInterval', {
    interval: result.samplingIntervalMicroseconds,
  })
  await post('Profiler.start')
  let calls = 0
  const start = performance.now()
  while (performance.now() - start < result.profileMs) {
    checksum += count()
    calls++
  }
  const elapsedMs = performance.now() - start
  const { profile } = await post('Profiler.stop')
  session.disconnect()
  assert.equal(checksum % expected, 0)
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]))
  const totals = new Map()
  for (let index = 0; index < profile.samples.length; index++) {
    const frame = nodes.get(profile.samples[index]).callFrame
    // Regex source can be huge; preserve its digest, not hundreds of ranges.
    const name = frame.functionName.startsWith('RegExp:')
      ? 'RegExp:' +
        createHash('sha256')
          .update(frame.functionName)
          .digest('hex')
          .slice(0, 12) +
        ' ' +
        frame.functionName.slice(7, 87)
      : frame.functionName || '(anonymous)'
    const key = JSON.stringify({
      name,
      url: frame.url,
      line: frame.lineNumber + 1,
    })
    const total = totals.get(key) ?? { microseconds: 0, samples: 0 }
    total.microseconds += profile.timeDeltas[index]
    total.samples++
    totals.set(key, total)
  }
  const sampledMicroseconds = [...totals.values()].reduce(
    (sum, value) => sum + value.microseconds,
    0,
  )
  const frames = [...totals]
    .map(([key, total]) => ({
      ...JSON.parse(key),
      ...total,
      fraction: total.microseconds / sampledMicroseconds,
      sampleFraction: total.samples / profile.samples.length,
    }))
    .sort((a, b) => b.samples - a.samples)
  result.entries.push({
    id,
    calls,
    elapsedMs,
    checksum,
    sampledMicroseconds,
    samples: profile.samples.length,
    largestGapMicroseconds: Math.max(...profile.timeDeltas),
    frames,
  })
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
  tokenizer.free?.()
  process.stderr.write(`profiled ${id}\n`)
}
result.complete = true
writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
