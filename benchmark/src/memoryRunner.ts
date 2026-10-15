import { fork, execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import os from 'node:os'
import { tokenizers } from './tokenizers.js'
import { datasets } from './datasets.js'
import { prepareFixtures } from './fixtures.js'
import { requirePerfLease } from './perfLease.js'
import {
  builtModuleHashes,
  requireBenchmarkRuntime,
  benchmarkHostId,
} from './provenance.js'
import type { Encoding } from './interfaces.js'

requirePerfLease()
requireBenchmarkRuntime()

const engine = 'bun' in process.versions ? 'bun' : 'node'
const version = engine === 'bun' ? process.versions.bun : process.versions.node
function option(name: string, fallback: string) {
  const index = process.argv.indexOf(`--${name}`)
  return index < 0 ? fallback : process.argv[index + 1]!
}
const timingFile = option('timing', `results/${engine}-${version}.json`)
const timing = JSON.parse(await readFile(timingFile, 'utf8'))
if (!timing.finishedAt || timing.errors.length)
  throw new Error('Complete timing phase first')
if (
  timing.environment.engine !== engine ||
  timing.environment.engineVersion !== version
)
  throw new Error('Memory/timing runtime differs')
const candidateBuild = builtModuleHashes()
if (JSON.stringify(candidateBuild) !== JSON.stringify(timing.candidateBuild))
  throw new Error('Executed build differs from timing phase')
const cases = timing.verification.map(
  ({ id, encoding }: { id: string; encoding: Encoding }) => ({ id, encoding }),
) as { id: string; encoding: Encoding }[]
if (
  !cases.length ||
  new Set(cases.map((c) => `${c.id}/${c.encoding}`)).size !== cases.length
)
  throw new Error('Invalid timing verification coverage')
const selectedEncodings = [...new Set(cases.map((c) => c.encoding))]
const productionDiff = execFileSync('git', [
  'diff',
  timing.environment.gitCommit,
  '--',
  ':(top)src',
])
if (productionDiff.length)
  throw new Error('Tokenizer source changed since timing run')
const packages = tokenizers.map(
  ({ id, packageName, version, encodings, async }) => ({
    id,
    packageName,
    version,
    encodings,
    async: !!async,
  }),
)
if (JSON.stringify(packages) !== JSON.stringify(timing.packages))
  throw new Error('Package versions changed since timing phase')
const inputs = Object.entries(datasets).map(([name, { text }]) => ({
  name,
  bytes: Buffer.byteLength(text),
  sha256: createHash('sha256').update(text).digest('hex'),
  timed: true,
}))
if (
  JSON.stringify(inputs) !==
  JSON.stringify(timing.inputs.filter((i: { timed: boolean }) => i.timed))
)
  throw new Error('Memory/timing inputs differ')
await prepareFixtures()
const output = option('output', `results/memory-${engine}-${version}.json`)
if (
  await readFile(output).then(
    () => true,
    () => false,
  )
)
  throw new Error('Memory output already exists; choose a new filename')
const result = {
  schema: 1,
  candidateBuild,
  protocol: 'settled-one-pass-v1',
  startedAt: new Date().toISOString(),
  finishedAt: '',
  environment: {
    ...timing.environment,
    executable: process.execPath,
    versions: process.versions,
    hostname: benchmarkHostId(),
    kernel: os.release(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalMemoryGiB: os.totalmem() / 1024 ** 3,
    loadStart: os.loadavg(),
    loadEnd: [] as number[],
    gitCommit: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    gitDiffSha256: createHash('sha256')
      .update(execFileSync('git', ['diff', 'HEAD']))
      .digest('hex'),
  },
  timingFile,
  timingSha256: createHash('sha256')
    .update(await readFile(timingFile))
    .digest('hex'),
  timingSourceCommit: timing.environment.gitCommit,
  productionSourceUnchanged: true,
  settings: {
    rounds: 5,
    passes: 1,
    operations: ['encode', 'decode', 'count'],
    settlement:
      'two setImmediate turns with forced full GC before baseline, after load, between decode/count, and after every input',
    schedule: 'sequential fresh processes; rotated case order each round',
    peak: 'absolute process RSS high-water mark during loading plus one workload pass, including harness/corpus',
  },
  expectedChecksums: Object.fromEntries(
    selectedEncodings.map((encoding) => {
      const checks = timing.verification.find(
        (v: { id: string; encoding: string }) =>
          v.id === 'gpt-tokenizer:local' && v.encoding === encoding,
      )?.checks
      if (!checks)
        throw new Error(`Missing local correctness checks: ${encoding}`)
      let sum = 0
      for (const [name, { text }] of Object.entries(datasets))
        sum ^=
          2 *
            checks.find((c: { dataset: string }) => c.dataset === name).tokens +
          text.length
      return [encoding, sum]
    }),
  ),
  packages,
  inputs,
  samples: [] as object[],
  errors: [] as object[],
}
function worker(id: string, encoding: Encoding): Promise<object> {
  return new Promise((resolve, reject) => {
    const child = fork(new URL('./memoryWorker.js', import.meta.url), [], {
      execPath: process.execPath,
      execArgv: ['--expose-gc'],
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    })
    let data: object | undefined
    let failure: Error | undefined
    const timeout = setTimeout(() => {
      child.kill('SIGKILL')
      failure = new Error('Memory worker timeout')
    }, 120_000)
    child.on(
      'message',
      (v: { ok: boolean; result: object; error?: string }) => {
        if (v.ok) data = v.result
        else failure = new Error(v.error)
      },
    )
    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    // Wait for exit so even teardown cannot overlap the next memory process.
    child.on('exit', (code, signal) => {
      clearTimeout(timeout)
      if (failure) reject(failure)
      else if (code !== 0 || !data)
        reject(new Error(`Memory worker exit ${code}/${signal}`))
      else resolve(data)
    })
    child.send({ id, encoding })
  })
}
async function save() {
  await writeFile(output, JSON.stringify(result, null, 2) + '\n')
}
for (let round = 0; round < 5; round++) {
  const shift = (round * 5) % cases.length
  for (const item of [...cases.slice(shift), ...cases.slice(0, shift)]) {
    try {
      result.samples.push({
        ...(await worker(item.id, item.encoding)),
        round: round + 1,
      })
      console.log(`${engine} memory ${round + 1}/5 ${item.id}/${item.encoding}`)
    } catch (error) {
      result.errors.push({ ...item, round: round + 1, error: String(error) })
      console.error(item, String(error))
    }
    await save()
  }
}
result.finishedAt = new Date().toISOString()
result.environment.loadEnd = os.loadavg()
await save()
console.log(
  `Saved ${output}: ${result.samples.length} samples, ${result.errors.length} errors`,
)
if (result.errors.length) process.exitCode = 1
