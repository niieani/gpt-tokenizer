import { performance } from 'node:perf_hooks'
import { datasets, probes } from './datasets.js'
import { firstDifference as compareTokens } from './correctness.js'
import { tokenizers } from './tokenizers.js'
import type {
  Check,
  Memory,
  Sample,
  Timing,
  Tokens,
  Verification,
  WorkerInput,
} from './interfaces.js'

const gc = () => {
  if (!globalThis.gc) throw new Error('Start worker with --expose-gc')
  globalThis.gc()
  globalThis.gc()
}
const memory = (): Memory => {
  const m = process.memoryUsage()
  return {
    heapUsed: m.heapUsed,
    rss: m.rss,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
  }
}
const difference = (after: Memory, before: Memory): Memory =>
  Object.fromEntries(
    Object.entries(after).map(([key, value]) => [
      key,
      (value - before[key as keyof Memory]) / 1024 ** 2,
    ]),
  ) as unknown as Memory

// Batch timing avoids two timer reads for every sub-microsecond operation.
// Sync APIs stay sync; the native HF API includes its required Promise/N-API cost.
async function timed(
  fn: () => unknown,
  asyncApi: boolean,
  minMs: number,
  longInput = false,
  minCalls = 5,
): Promise<Timing> {
  let calls = 0
  let checksum = 0
  const batch = longInput ? 1 : asyncApi ? 10 : 100
  const start = performance.now()
  do {
    if (asyncApi) {
      for (let i = 0; i < batch; i++) {
        const v = await fn()
        checksum ^= size(v)
      }
    } else {
      for (let i = 0; i < batch; i++) {
        const v = fn()
        checksum ^= size(v)
      }
    }
    calls += batch
  } while (performance.now() - start < minMs || calls < minCalls)
  sink ^= checksum
  const elapsedMs = performance.now() - start
  return { ms: elapsedMs / calls, calls, elapsedMs }
}
function size(v: unknown): number {
  return typeof v === 'number' ? v : (v as { length: number }).length
}
let sink = 0

async function run(input: WorkerInput): Promise<Sample | Verification> {
  const adapter = tokenizers.find((t) => t.id === input.id)
  if (!adapter || !adapter.encodings.includes(input.encoding))
    throw new Error(`Unsupported ${input.id}/${input.encoding}`)
  if (input.mode === 'verify') {
    const t = await adapter.load(input.encoding)
    const reference = await import(`../../esm/encoding/${input.encoding}.js`)
    const checks: Check[] = []
    for (const [dataset, { text }] of Object.entries({
      ...datasets,
      ...probes,
    })) {
      const expected: number[] = reference.encode(text)
      try {
        const actual = await t.encode(text)
        const firstDifference = compareTokens(expected, actual)
        const check: Check = {
          dataset,
          tokens: expected.length,
          actualTokens: actual.length,
          firstDifference,
          expectedToken: expected[firstDifference],
          actualToken: actual[firstDifference],
          roundTrip: false,
          count: false,
        }
        try {
          check.roundTrip = (await t.decode(actual)) === text
        } catch (error) {
          check.error = `decode: ${String(error)}`
        }
        try {
          check.count = (await t.countTokens(text)) === expected.length
        } catch (error) {
          check.error = `${check.error ?? ''} count: ${String(error)}`
        }
        checks.push(check)
      } catch (error) {
        checks.push({
          dataset,
          tokens: expected.length,
          actualTokens: 0,
          firstDifference: -1,
          roundTrip: false,
          count: false,
          error: String(error),
        })
      }
    }
    t.free?.()
    return {
      id: input.id,
      encoding: input.encoding,
      checks,
      passed: checks.every(
        (c) => c.firstDifference === -1 && c.roundTrip && c.count && !c.error,
      ),
    }
  }
  // Materialize lazy/rope corpus strings before the memory baseline. Otherwise
  // first encode can charge input flattening (or rope release) to the tokenizer.
  for (const data of Object.values(datasets)) {
    data.text = Buffer.from(data.text, 'utf8').toString('utf8')
  }
  gc()
  const before = memory()
  const start = performance.now()
  const t = await adapter.load(input.encoding)
  const initMs = performance.now() - start
  gc()
  const after = memory()
  const result: Sample = {
    id: input.id,
    encoding: input.encoding,
    initialization: { ms: initMs, memory: difference(after, before) },
    datasets: {},
    retained: before,
    peakRssMiB: 0,
    checksum: 0,
  }
  for (const [name, { text }] of Object.entries(datasets)) {
    let ids: Tokens = await t.encode(text)
    const encode = () => t.encode(text)
    const decode = () => t.decode(ids)
    const count = () => t.countTokens(text)
    // Warm each operation, then measure it. Long inputs get a small batch.
    const operations = { encode, decode, count }
    result.datasets[name] = {} as Sample['datasets'][string]
    for (const [key, fn] of Object.entries(operations)) {
      const warmup = await timed(
        fn,
        !!adapter.async,
        input.warmupMs ?? Math.min(100, input.minMs),
        text.length > 10000,
        input.warmupCalls ?? 5,
      )
      gc()
      result.datasets[name][key as keyof typeof operations] = {
        ...(await timed(fn, !!adapter.async, input.minMs, text.length > 10000)),
        warmup,
      }
    }
    ids = [] // Do not retain benchmark output buffers in the memory measurement.
  }
  gc()
  result.retained = difference(memory(), after)
  result.peakRssMiB = process.resourceUsage().maxRSS / 1024
  result.checksum = sink
  t.free?.()
  return result
}

process.once('message', async (input: WorkerInput) => {
  try {
    process.send?.({ ok: true, result: await run(input) }, () =>
      process.exit(0),
    )
  } catch (error) {
    process.send?.({ ok: false, error: String(error) }, () => process.exit(1))
  }
})
