import { setImmediate } from 'node:timers/promises'
import { datasets } from './datasets.js'
import { tokenizers } from './tokenizers.js'
import type { Memory, Tokenizer, WorkerInput } from './interfaces.js'

function snapshot(): Memory {
  const m = process.memoryUsage()
  return {
    heapUsed: m.heapUsed,
    rss: m.rss,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
  }
}
function delta(after: Memory, before: Memory): Memory {
  return Object.fromEntries(
    Object.entries(after).map(([k, v]) => [
      k,
      (v - before[k as keyof Memory]) / 1024 ** 2,
    ]),
  ) as unknown as Memory
}
async function settle() {
  if (!globalThis.gc) throw new Error('Start worker with --expose-gc')
  // Unwind async/native loader roots, collect, then let finalizers settle too.
  await setImmediate()
  globalThis.gc()
  await setImmediate()
  globalThis.gc()
}
function materialize() {
  for (const data of Object.values(datasets))
    data.text = Buffer.from(data.text, 'utf8').toString('utf8')
}
async function encodeDecode(t: Tokenizer, text: string) {
  const ids = await t.encode(text)
  const decoded = await t.decode(ids)
  return ids.length + decoded.length
}
async function onePass(t: Tokenizer, text: string) {
  const size = await encodeDecode(t, text)
  await settle() // release IDs/decoded text before the independent count call
  return size + (await t.countTokens(text))
}
async function run(input: WorkerInput) {
  const adapter = tokenizers.find((t) => t.id === input.id)
  if (!adapter || !adapter.encodings.includes(input.encoding))
    throw new Error('Unsupported memory case')
  materialize()
  await settle()
  const before = snapshot()
  const t = await adapter.load(input.encoding)
  await settle()
  const initialized = snapshot()
  const result = {
    id: input.id,
    encoding: input.encoding,
    baseline: before,
    initialized,
    initialization: delta(initialized, before),
    datasets: {} as Record<string, Memory>,
    retained: {} as Memory,
    final: {} as Memory,
    peakRssMiB: 0,
    checksum: 0,
  }
  for (const [name, { text }] of Object.entries(datasets)) {
    result.checksum ^= await onePass(t, text)
    // onePass has returned; output buffers and async-frame locals can be freed.
    await settle()
    result.datasets[name] = delta(snapshot(), initialized)
  }
  await settle()
  result.final = snapshot()
  result.retained = delta(result.final, initialized)
  result.peakRssMiB = process.resourceUsage().maxRSS / 1024
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
