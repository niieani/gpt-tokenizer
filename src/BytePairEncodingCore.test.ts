import { describe, expect, test } from 'vite-plus/test'
import { encode as encodeCl100k } from './encoding/cl100k_base.js'
import { encode as encodeO200k } from './encoding/o200k_base.js'

// A long run without whitespace becomes a single piece for the merge step.
// Rescanning the piece after every merge made this quadratic (minutes for a
// few hundred thousand characters), so this guards the heap-based merge.
describe('long runs without whitespace', () => {
  test('encodes a 200,000-character run', () => {
    expect(encodeCl100k('='.repeat(200_000))).toHaveLength(3125)
    expect(encodeO200k('a'.repeat(200_000))).toHaveLength(25_000)
  })
})
