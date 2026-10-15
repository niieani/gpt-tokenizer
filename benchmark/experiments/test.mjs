import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  corpus,
  documents,
  geometricMean,
  validateRounds,
  sha256,
} from './protocol.mjs'
test('publication budget is finite and cannot silently accept a smoke run', () => {
  assert.throws(() => validateRounds(1, 10, false))
  assert.throws(() => validateRounds(NaN, 100, true))
  assert.throws(() => validateRounds(5, 0, true))
  assert.throws(() => validateRounds(5, 100, false, 0))
  assert.throws(() => validateRounds(5, 100, false, NaN))
  assert.doesNotThrow(() => validateRounds(1, 1, true, 0))
  assert.doesNotThrow(() => validateRounds(5, 100, false))
  assert.doesNotThrow(() => validateRounds(1, 1, true))
})
test('normalization weights documents equally rather than large input latency', () => {
  assert.equal(geometricMean([2, 0.5]), 1)
  assert.equal(geometricMean([4, 4]), 4)
})
test('real categories have equal coverage and streams change each request', () => {
  assert.equal(corpus.version, 3)
  assert.equal(documents.length, 15)
  for (const category of new Set(documents.map((d) => d.category)))
    assert.equal(
      documents.filter((d) => d.category === category).length,
      category.startsWith('long-') ? 1 : 3,
    )
  for (const document of documents) {
    assert.equal(document.stream.length, 32)
    assert.equal(new Set(document.stream.map(sha256)).size, 32)
    assert.ok(!document.stream.includes(document.text))
  }
})
