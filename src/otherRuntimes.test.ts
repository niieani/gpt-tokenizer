/**
 * @vitest-environment edge-runtime
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from 'vitest'
import { GptEncoding } from './GptEncoding.js'
import { resolveEncoding } from './resolveEncoding.js'

describe('edge-runtime', () => {
  const encoding = GptEncoding.getEncodingApi('o200k_base', resolveEncoding)

  const { decode, encode, isWithinTokenLimit } = encoding

  test('simple text', () => {
    const str = 'This is some text'
    const encoded = [2_500, 382, 1_236, 2_201]
    expect(encode(str)).toEqual(encoded)
    expect(decode(encode(str))).toEqual(str)
    expect(isWithinTokenLimit(str, 3)).toBe(false)
    expect(isWithinTokenLimit(str, 5)).toBe(encoded.length)
  })
})
