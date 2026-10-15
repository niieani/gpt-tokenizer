import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
export const corpus = JSON.parse(
  readFileSync(new URL('./corpus.json', import.meta.url)),
)
export const sha256 = (value) =>
  createHash('sha256').update(value).digest('hex')
export const snapshots = JSON.parse(
  readFileSync(new URL('./snapshots/manifest.json', import.meta.url)),
)
const snapshotDocuments = Object.entries(snapshots.files).map(
  ([file, metadata]) => {
    const text = readFileSync(
      new URL(`./snapshots/${file}`, import.meta.url),
      'utf8',
    )
    if (sha256(text) !== metadata.sha256)
      throw new Error(`Snapshot hash mismatch: ${file}`)
    return { id: file, category: metadata.category, text }
  },
)
export const documents = [...corpus.documents, ...snapshotDocuments].map(
  (document) => ({
    ...document,
    // Deterministic rotating requests preserve realistic shared vocabulary while
    // changing payloads. This is a bounded stream, not an unbounded cold cache.
    stream: Array.from(
      { length: 32 },
      (_, i) =>
        `${document.text}\nRequest ${i}: item_${((i * 2654435761) >>> 0).toString(16)}; revision=${i + 17}.`,
    ),
  }),
)
export const probes = [
  " I'\u017fa",
  '\u{32A13}?t',
  '',
  '\uFEFFhello',
  'a\u0085b\uFEFFc\u00A0d',
  'e\u0301👨‍👩‍👧‍👦',
  'x'.repeat(1024),
]
export const defaultEntries = [
  'baseline',
  'candidate',
  'ai-tokenizer',
  'bpe-lite',
  '@goliapkg/tiktoken-wasm',
  'tiktoken',
]
export const geometricMean = (values) =>
  Math.exp(
    values.reduce((sum, value) => sum + Math.log(value), 0) / values.length,
  )
export function validateRounds(rounds, minMs, exploratory, warmMs = 50) {
  if (
    !Number.isInteger(rounds) ||
    rounds < 1 ||
    !Number.isFinite(minMs) ||
    !(minMs > 0)
  )
    throw new Error('Invalid measurement budget')
  if (!Number.isFinite(warmMs) || warmMs < 0)
    throw new Error('Invalid warmup budget')
  if (!exploratory && (rounds < 5 || minMs < 100 || warmMs < 50))
    throw new Error(
      'Publication requires >=5 processes, >=100 ms measurement and >=50 ms warmup per document/mode/operation; use --exploratory for smoke runs',
    )
}
