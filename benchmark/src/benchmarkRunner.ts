import { fork } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { tokenizers } from './tokenizers.js'
import { datasets, probes } from './datasets.js'
import { prepareFixtures } from './fixtures.js'
import { requirePerfLease } from './perfLease.js'
import {
  builtModuleHashes,
  requireBenchmarkRuntime,
  benchmarkHostId,
} from './provenance.js'
import type {
  Encoding,
  Sample,
  Verification,
  WorkerInput,
} from './interfaces.js'

requirePerfLease()
requireBenchmarkRuntime()

function option(name: string, fallback: string) {
  const i = process.argv.indexOf(`--${name}`)
  return i < 0 ? fallback : process.argv[i + 1]
}
const rounds = Number(option('rounds', '5'))
const minMs = Number(option('min-ms', '300'))
const warmupMs = Number(option('warm-ms', String(Math.min(100, minMs))))
const warmupCalls = Number(option('warm-calls', '5'))
if (
  !Number.isInteger(rounds) ||
  rounds < 2 ||
  !Number.isFinite(minMs) ||
  minMs < 10 ||
  !Number.isFinite(warmupMs) ||
  warmupMs < 0 ||
  !Number.isInteger(warmupCalls) ||
  warmupCalls < 5
)
  throw new Error('Use --rounds >= 2 and --min-ms >= 10')
const only = option('only', '').split(',').filter(Boolean)
const encodings = option('encodings', 'cl100k_base,o200k_base').split(
  ',',
) as Encoding[]
if (
  only.some((id) => !tokenizers.some((t) => t.id === id)) ||
  encodings.some((e) => !['cl100k_base', 'o200k_base'].includes(e))
)
  throw new Error('Unknown tokenizer/encoding')
const cases = tokenizers
  .filter((t) => !only.length || only.includes(t.id))
  .flatMap((t) =>
    encodings
      .filter((e) => t.encodings.includes(e))
      .map((encoding) => ({ id: t.id, encoding })),
  )

function worker<T>(input: WorkerInput): Promise<T> {
  return new Promise((resolve, reject) => {
    const child = fork(new URL('./benchmarkWorker.js', import.meta.url), [], {
      execPath: process.execPath,
      execArgv: ['--expose-gc'],
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    })
    let data: T | undefined
    let failure: Error | undefined
    const timeout = setTimeout(() => {
      child.kill('SIGKILL')
      failure = new Error(`Worker timeout: ${input.id}`)
    }, 600_000)
    child.on('message', (value: { ok: boolean; result: T; error?: string }) => {
      if (value.ok) data = value.result
      else failure = new Error(value.error)
    })
    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    child.on('exit', (code, signal) => {
      clearTimeout(timeout)
      if (failure) reject(failure)
      else if (code !== 0 || data === undefined)
        reject(
          new Error(
            `Worker exited unsuccessfully: code ${code}, signal ${signal}`,
          ),
        )
      else resolve(data)
    })
    child.send(input)
  })
}
const maybeRead = async (path: string) =>
  readFile(path, 'utf8').catch(() => null)
await prepareFixtures()
const engine = 'bun' in process.versions ? 'bun' : 'node'
const engineVersion =
  engine === 'bun' ? process.versions.bun : process.versions.node
const output = option('output', `results/${engine}-${engineVersion}.json`)
if ((await maybeRead(output)) !== null)
  throw new Error('Timing output already exists; choose a new filename')
const result = {
  schema: 1,
  candidateBuild: builtModuleHashes(),
  startedAt: new Date().toISOString(),
  finishedAt: '',
  environment: {
    engine,
    engineVersion,
    versions: process.versions,
    executable: process.execPath,
    hostname: benchmarkHostId(),
    platform: os.platform(),
    arch: os.arch(),
    kernel: os.release(),
    cpus: os.cpus(),
    totalMemoryGiB: os.totalmem() / 1024 ** 3,
    loadStart: os.loadavg(),
    loadEnd: [] as number[],
    cpuInfo: await maybeRead('/proc/cpuinfo'),
    cpuAffinity: (await maybeRead('/proc/self/status'))?.match(
      /^Cpus_allowed_list:.*$/m,
    )?.[0],
    cgroupCpuMax: await maybeRead('/sys/fs/cgroup/cpu.max'),
    gitCommit: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    gitDiffSha256: createHash('sha256')
      .update(execFileSync('git', ['diff', 'HEAD']))
      .digest('hex'),
  },
  settings: {
    rounds,
    minMs,
    warmupMs,
    warmupMinimumCalls: warmupCalls,
    minimumCalls: 5,
    seed: '0x12345678',
    schedule:
      'sequential, rotated cases per round; fresh process per tokenizer/encoding/round',
    cache: 'default tokenizer caches; repeated same input after warmup',
  },
  packages: tokenizers.map(
    ({ id, packageName, version, encodings, async }) => ({
      id,
      packageName,
      version,
      encodings,
      async: !!async,
    }),
  ),
  inputs: Object.entries({ ...datasets, ...probes }).map(
    ([name, { text }]) => ({
      name,
      bytes: Buffer.byteLength(text),
      sha256: createHash('sha256').update(text).digest('hex'),
      timed: name in datasets,
    }),
  ),
  verification: [] as Verification[],
  samples: [] as (Sample & { round: number })[],
  errors: [] as {
    id: string
    encoding: Encoding
    phase: string
    error: string
  }[],
}
async function save() {
  await mkdir(new URL('../results/', import.meta.url), { recursive: true })
  await writeFile(output, JSON.stringify(result, null, 2) + '\n')
}
for (const item of cases) {
  try {
    const check = await worker<Verification>({ ...item, mode: 'verify', minMs })
    result.verification.push(check)
    console.log(
      `verify ${item.id}/${item.encoding}: ${
        check.passed
          ? 'PASS'
          : 'MISMATCH ' +
            check.checks
              .filter(
                (c) =>
                  c.firstDifference >= 0 || !c.roundTrip || !c.count || c.error,
              )
              .map((c) => c.dataset)
              .join(', ')
      }`,
    )
  } catch (error) {
    result.errors.push({ ...item, phase: 'verify', error: String(error) })
    console.error(item, String(error))
  }
}
await save()
if (!process.argv.includes('--verify-only')) {
  for (let round = 0; round < rounds; round++) {
    // Rotating order distributes startup/host drift across competitors.
    const shift = (round * 5) % cases.length
    for (const item of [...cases.slice(shift), ...cases.slice(0, shift)]) {
      if (
        result.errors.some(
          (e) =>
            e.id === item.id &&
            e.encoding === item.encoding &&
            e.phase === 'verify',
        )
      )
        continue
      try {
        const sample = await worker<Sample>({
          ...item,
          mode: 'measure',
          minMs,
          warmupMs,
          warmupCalls,
        })
        result.samples.push({ ...sample, round: round + 1 })
        console.log(
          `${engine} round ${round + 1}/${rounds} ${item.id}/${item.encoding}: init ${sample.initialization.ms.toFixed(1)} ms`,
        )
      } catch (error) {
        result.errors.push({
          ...item,
          phase: `round ${round + 1}`,
          error: String(error),
        })
        console.error(item, String(error))
      }
      await save()
    }
  }
}
result.finishedAt = new Date().toISOString()
result.environment.loadEnd = os.loadavg()
await save()
console.log(
  `Saved ${output}: ${result.samples.length} samples, ${result.errors.length} errors`,
)
if (result.errors.length) process.exitCode = 1
