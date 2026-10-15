import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { geometricMean, validateRounds } from './protocol.mjs'
const result = JSON.parse(readFileSync(process.argv[2], 'utf8'))
assert.equal(result.complete, true, 'Incomplete run cannot be ranked')
const { rounds, minMs, entries, operations, modes } = result.configuration
validateRounds(rounds, minMs, result.exploratory, result.configuration.warmMs)
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}
const categories = [
  ...new Set(result.samples[0].measurements.map((item) => item.category)),
]
assert.equal(result.samples.length, entries.length * rounds)
assert.equal(new Set(entries).size, entries.length)
const index = new Map()
for (const entry of entries) {
  const samples = result.samples.filter((item) => item.entry === entry)
  assert.equal(samples.length, rounds)
  assert.equal(new Set(samples.map((sample) => sample.round)).size, rounds)
  for (const sample of samples) {
    assert.equal(sample.runtime.node, result.runtime.version)
    assert.equal(sample.runtime.bun, result.runtime.bun)
    assert.ok(Number.isFinite(sample.checksum))
    assert.equal(sample.verification.passed, true)
    assert.equal(sample.verification.documents, result.corpus.documents.length)
    assert.equal(
      sample.verification.inputs,
      result.corpus.documents.reduce(
        (sum, document) => sum + 1 + document.streamSha256.length,
        0,
      ),
    )
    for (const measure of sample.measurements) {
      assert.ok(
        result.corpus.documents.some(
          (document) =>
            document.id === measure.id &&
            document.category === measure.category,
        ),
      )
      assert.ok(
        Number.isInteger(sample.round) &&
          sample.round >= 0 &&
          sample.round < rounds,
      )
      assert.ok(
        measure.warmup.calls >= result.configuration.warmCalls &&
          measure.warmup.elapsedMs >= result.configuration.warmMs,
      )
      assert.ok(
        measure.calls >= 5 &&
          measure.elapsedMs >= minMs &&
          Number.isFinite(measure.ms) &&
          measure.ms > 0,
      )
      assert.ok(Math.abs(measure.elapsedMs / measure.calls - measure.ms) < 1e-9)
      const key = JSON.stringify([
        entry,
        sample.round,
        measure.id,
        measure.mode,
        measure.operation,
      ])
      assert.ok(!index.has(key), 'Duplicate measurement')
      index.set(key, measure.ms)
    }
  }
}
const baselineRows = result.samples.find(
  (sample) => sample.entry === 'baseline',
).measurements
assert.equal(
  baselineRows.length,
  result.corpus.documents.length * modes.length * operations.length,
)
for (const row of baselineRows) {
  assert.ok(
    result.corpus.documents.some(
      (document) =>
        document.id === row.id && document.category === row.category,
    ),
  )
  assert.ok(modes.includes(row.mode))
  assert.ok(operations.includes(row.operation))
}
for (const sample of result.samples)
  assert.equal(sample.measurements.length, baselineRows.length)
const lines = [
  `# Optimization experiment (${result.exploratory ? 'EXPLORATORY — not publication evidence' : 'publication budget'})`,
  '',
  `${result.runtime.bun ? 'Bun ' + result.runtime.bun : 'Node ' + result.runtime.version}; ${result.configuration.encoding}; ${rounds} fresh processes per entry. Corpus ${result.corpus.sha256}.`,
  '',
  `Output consumer: ${result.configuration.consume ?? 'length'}; length consumes only output length, while full includes a complete output checksum. They are separate metrics.`,
  '',
  'Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.',
  '',
  '| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |',
  '|---|---|---|---|---:|---:|',
]
for (const category of categories)
  for (const mode of modes)
    for (const operation of operations) {
      const rows = baselineRows.filter(
        (row) =>
          row.category === category &&
          row.mode === mode &&
          row.operation === operation,
      )
      const scores = entries
        .map((entry) => {
          const ratios = Array.from({ length: rounds }, (_, round) =>
            geometricMean(
              rows.map(
                (row) =>
                  index.get(
                    JSON.stringify([
                      'baseline',
                      round,
                      row.id,
                      mode,
                      operation,
                    ]),
                  ) /
                  index.get(
                    JSON.stringify([entry, round, row.id, mode, operation]),
                  ),
              ),
            ),
          )
          assert.ok(
            ratios.every((ratio) => Number.isFinite(ratio) && ratio > 0),
            'Missing sample or invalid ratio',
          )
          return {
            entry,
            value: median(ratios),
            min: Math.min(...ratios),
            max: Math.max(...ratios),
          }
        })
        .sort((a, b) => b.value - a.value)
      let rank = 0
      scores.forEach((score) =>
        lines.push(
          `| ${category} | ${mode} | ${operation} | ${score.entry} | ${score.entry === 'baseline' ? '—' : ++rank} | ${score.value.toFixed(3)}× [${score.min.toFixed(3)}, ${score.max.toFixed(3)}] |`,
        ),
      )
    }
lines.push(
  '',
  '## Per-document latency',
  '',
  'Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.',
  '',
  '| Document | Mode | Operation | Entry | ms median [min,max] |',
  '|---|---|---|---|---:|',
)
for (const row of baselineRows)
  for (const entry of entries) {
    const values = Array.from({ length: rounds }, (_, round) =>
      index.get(
        JSON.stringify([entry, round, row.id, row.mode, row.operation]),
      ),
    )
    lines.push(
      `| ${row.id} | ${row.mode} | ${row.operation} | ${entry} | ${median(values).toFixed(6)} [${Math.min(...values).toFixed(6)}, ${Math.max(...values).toFixed(6)}] |`,
    )
  }
lines.push(
  '',
  '## First-use and retained memory (unranked)',
  '',
  'One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.',
  '',
  '| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |',
  '|---|---:|---:|---:|---:|---:|',
)
for (const entry of entries) {
  const samples = result.samples.filter((sample) => sample.entry === entry)
  const range = (values) =>
    `${median(values).toFixed(3)} [${Math.min(...values).toFixed(3)}, ${Math.max(...values).toFixed(3)}]`
  lines.push(
    `| ${entry} | ${range(samples.map((s) => s.initializationMs))} | ${range(samples.map((s) => s.firstPass.reduce((sum, row) => sum + row.encodeMs, 0)))} | ${range(samples.map((s) => (s.initialized.heapUsed - s.before.heapUsed) / 2 ** 20))} | ${range(samples.map((s) => (s.afterFirstPass.heapUsed - s.initialized.heapUsed) / 2 ** 20))} | ${range(samples.map((s) => (s.afterFirstPass.rss - s.initialized.rss) / 2 ** 20))} |`,
  )
}
lines.push('', '## Semantic probe mismatches', '')
for (const sample of result.samples.filter((s) => s.round === 0))
  for (const probe of sample.semanticProbes)
    if (probe.error || !probe.ids || !probe.count || !probe.roundTrip)
      lines.push(`- ${sample.entry}: ${JSON.stringify(probe)}`)
lines.push(
  '',
  'All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.',
  '',
)
const markdown = lines.join('\n')
if (process.argv[3]) writeFileSync(process.argv[3], markdown)
else console.log(markdown)
