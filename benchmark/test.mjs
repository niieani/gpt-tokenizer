import assert from 'node:assert/strict'
import { test } from 'node:test'
import { firstDifference } from './dist/correctness.js'
import { datasets, generateRandomUnicode } from './dist/datasets.js'

test('token comparison checks IDs, length, and all supported output types', () => {
  assert.equal(firstDifference([1, 2], new Uint32Array([1, 2])), -1)
  assert.equal(firstDifference([1, 2], [1, 3]), 1)
  assert.equal(firstDifference([1, 2], [1]), 1)
  assert.equal(firstDifference([1], new Int32Array([1, 2])), 1)
  assert.equal(firstDifference([], []), -1)
})

test('every worker gets exactly the same Unicode corpus', () => {
  assert.equal(generateRandomUnicode(120000), datasets.UnicodeRandom.text)
  assert.equal([...datasets.UnicodeRandom.text].length, 120000)
  assert.equal(Object.keys(datasets).length, 7)
})
