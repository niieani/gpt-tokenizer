import { spawn } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { resolve, dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import {
  corpus,
  snapshots,
  documents,
  defaultEntries,
  sha256,
  validateRounds,
} from './protocol.mjs'
import { requirePerfLease } from '../dist/perfLease.js'
import { tokenizers } from '../dist/tokenizers.js'
import { benchmarkHostId } from '../dist/provenance.js'
requirePerfLease()
if (!process.versions.bun && process.version !== 'v26.12.0')
  throw new Error('Use Node v26.12.0 explicitly')
if (process.versions.bun && process.versions.bun !== '1.4.3')
  throw new Error('Use Bun 1.4.3 explicitly')
const { values } = parseArgs({
  options: {
    candidate: { type: 'string' },
    output: { type: 'string' },
    encoding: { type: 'string', default: 'o200k_base' },
    rounds: { type: 'string', default: '5' },
    'min-ms': { type: 'string', default: '100' },
    'warm-ms': { type: 'string', default: '50' },
    entries: { type: 'string', default: defaultEntries.join(',') },
    exploratory: { type: 'boolean', default: false },
    legacy: { type: 'boolean', default: false },
    operations: { type: 'string', default: 'encode,decode,count' },
    modes: { type: 'string', default: 'repeated,stream' },
    consume: { type: 'string', default: 'length' },
    'warm-calls': { type: 'string', default: '20' },
  },
})
if (!values.candidate || !values.output)
  throw new Error(
    'Required: --candidate /absolute/esm/encoding/o200k_base.js --output FILE',
  )
if (existsSync(values.output))
  throw new Error(
    'Output already exists; choose a new filename to preserve provenance',
  )
const candidate = resolve(values.candidate)
const rounds = Number(values.rounds),
  minMs = Number(values['min-ms']),
  warmMs = Number(values['warm-ms'])
validateRounds(rounds, minMs, values.exploratory, warmMs)
if (!['o200k_base', 'cl100k_base'].includes(values.encoding))
  throw new Error('Unknown encoding')
if (!Number.isFinite(warmMs) || !(warmMs >= 0))
  throw new Error('Invalid warmup')
if (!['length', 'full'].includes(values.consume))
  throw new Error('Unknown output consumer')
const operations = values.operations.split(',')
const modes = values.modes.split(',')
const warmCalls = Number(values['warm-calls'])
if (!Number.isInteger(warmCalls) || warmCalls < 20)
  throw new Error('Warmup requires at least20calls')
for (const [selected, allowed] of [
  [operations, ['encode', 'decode', 'count']],
  [modes, ['repeated', 'stream']],
])
  if (
    !selected.length ||
    new Set(selected).size !== selected.length ||
    selected.some((value) => !allowed.includes(value))
  )
    throw new Error('Invalid operation/mode filters')
const entries = values.entries.split(',')
if (
  new Set(entries).size !== entries.length ||
  !entries.includes('baseline') ||
  !entries.includes('candidate')
)
  throw new Error('Entries must be unique and include baseline,candidate')
for (const entry of entries)
  if (
    !['baseline', 'candidate'].includes(entry) &&
    !tokenizers.some(
      (adapter) =>
        adapter.id === entry &&
        adapter.id === adapter.packageName &&
        adapter.encodings.includes(values.encoding),
    )
  )
    throw new Error(`Unsupported entry/encoding: ${entry}/${values.encoding}`)
const candidateRoot = resolve(dirname(candidate), '../..')
const digestFiles = readdirSync(resolve(candidateRoot, 'esm'), {
  recursive: true,
})
  .filter((path) => path.endsWith('.js'))
  .sort()
const candidateFiles = Object.fromEntries(
  digestFiles.map((path) => [
    path,
    sha256(readFileSync(resolve(candidateRoot, 'esm', path))),
  ]),
)
const git = (...args) => {
  try {
    return execFileSync('git', ['-C', candidateRoot, ...args], {
      encoding: 'utf8',
    }).trim()
  } catch {
    return null
  }
}
const packageNames = [
  ...new Set([
    'tiktoken',
    ...entries.filter((entry) => !['baseline', 'candidate'].includes(entry)),
  ]),
]
const packages = Object.fromEntries(
  packageNames.map((name) => [
    name,
    JSON.parse(
      readFileSync(
        new URL(`../node_modules/${name}/package.json`, import.meta.url),
      ),
    ).version,
  ]),
)
const measuredDocuments = [...documents]
if (values.legacy) {
  const { datasets } = await import('../dist/datasets.js')
  for (const [id, { text }] of Object.entries(datasets))
    measuredDocuments.push({
      id: `legacy:${id}`,
      category: 'legacy',
      text,
      stream: [text],
    })
}
const result = {
  schema: 1,
  packages,
  hardware: {
    hostname: benchmarkHostId(),
    loadStart: os.loadavg(),
    loadEnd: [],
    cpus: os.cpus().map(({ model, speed }) => ({ model, speed })),
    memoryBytes: os.totalmem(),
    release: os.release(),
  },
  harness: Object.fromEntries(
    ['run.mjs', 'worker.mjs', 'protocol.mjs'].map((name) => [
      name,
      sha256(readFileSync(new URL(name, import.meta.url))),
    ]),
  ),
  startedAt: new Date().toISOString(),
  exploratory: values.exploratory,
  runtime: {
    executable: process.execPath,
    version: process.version,
    bun: process.versions.bun ?? null,
    platform: process.platform,
    arch: process.arch,
  },
  configuration: {
    rounds,
    minMs,
    warmMs,
    warmCalls,
    consume: values.consume,
    operations,
    modes,
    encoding: values.encoding,
    entries,
    legacy: values.legacy,
  },
  corpus: {
    version: corpus.version,
    snapshots,
    provenance: corpus.provenance,
    sha256: sha256(readFileSync(new URL('./corpus.json', import.meta.url))),
    documents: measuredDocuments.map(({ id, category, text, stream }) => ({
      id,
      category,
      utf8Bytes: Buffer.byteLength(text),
      sha256: sha256(text),
      streamSha256: stream.map(sha256),
    })),
  },
  candidate: {
    root: candidateRoot,
    gitCommit: git('rev-parse', 'HEAD'),
    dirty: git('status', '--porcelain'),
    files: candidateFiles,
  },
  baseline: {
    package: 'gpt-tokenizer',
    version: JSON.parse(
      readFileSync(
        new URL('../node_modules/gpt-tokenizer/package.json', import.meta.url),
      ),
    ).version,
  },
  samples: [],
}
const worker = fileURLToPath(new URL('./worker.mjs', import.meta.url))
const run = (config) =>
  new Promise((resolveResult, reject) => {
    const child = spawn(
      process.execPath,
      ['--expose-gc', worker, JSON.stringify(config)],
      { stdio: ['ignore', 'pipe', 'inherit'] },
    )
    let stdout = ''
    let timedOut = false
    const timeout = setTimeout(
      () => {
        timedOut = true
        child.kill('SIGKILL')
      },
      10 * 60 * 1000,
    )
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    // Parsing after exit also guarantees no competing cleanup from the old child.
    child.on('close', (code) => {
      clearTimeout(timeout)
      if (timedOut)
        return reject(
          new Error(
            `${config.entry} exceeded 10-minute worker limit and was killed/reaped`,
          ),
        )
      if (code !== 0) return reject(new Error(`${config.entry} exited ${code}`))
      try {
        resolveResult(JSON.parse(stdout))
      } catch (error) {
        reject(error)
      }
    })
  })
for (let round = 0; round < rounds; round++) {
  // Baseline/candidate remain adjacent; alternate their order to reduce drift.
  // Rotate contender positions around that pair in successive rounds.
  const pair = round % 2 ? ['candidate', 'baseline'] : ['baseline', 'candidate']
  const others = entries.filter((entry) => !pair.includes(entry))
  const offset = round % (others.length + 1)
  const order = [...others.slice(0, offset), ...pair, ...others.slice(offset)]
  for (const entry of order) {
    console.error(`[experiment] round ${round + 1}/${rounds}: ${entry}`)
    result.samples.push(
      await run({
        candidate,
        entry,
        round,
        encoding: values.encoding,
        minMs,
        warmMs,
        warmCalls,
        consume: values.consume,
        operations,
        modes,
        legacy: values.legacy,
      }),
    )
    writeFileSync(
      values.output,
      JSON.stringify({ ...result, complete: false }, null, 2),
    )
  }
}
result.hardware.loadEnd = os.loadavg()
result.completedAt = new Date().toISOString()
result.complete = true
writeFileSync(values.output, JSON.stringify(result, null, 2))
console.error(`Wrote ${values.output}`)
