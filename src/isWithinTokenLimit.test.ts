// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from 'vitest'
import { ALL_SPECIAL_TOKENS } from './constants.js'
import { GptEncoding } from './GptEncoding.js'
import { resolveEncoding } from './resolveEncoding.js'
import { EndOfText } from './specialTokens.js'

describe('isWithinTokenLimit special tokens issue', () => {
  const encoding = GptEncoding.getEncodingApi('cl100k_base', resolveEncoding)
  const textWithSpecialToken = `Hello ${EndOfText} world`

  test('countTokens works with allowedSpecial', () => {
    const count = encoding.countTokens(textWithSpecialToken, {
      allowedSpecial: ALL_SPECIAL_TOKENS,
    })
    expect(count).toBeGreaterThan(0)
  })

  test('countTokens fails without allowedSpecial', () => {
    expect(() => {
      encoding.countTokens(textWithSpecialToken)
    }).toThrow('Disallowed special token found')
  })

  test('isWithinTokenLimit fails with special tokens (current behavior)', () => {
    expect(() => {
      encoding.isWithinTokenLimit(textWithSpecialToken, 100)
    }).toThrow('Disallowed special token found')
  })

  // This test should now pass after our fix
  test('isWithinTokenLimit should work with allowedSpecial', () => {
    const result = encoding.isWithinTokenLimit(textWithSpecialToken, 100, {
      allowedSpecial: ALL_SPECIAL_TOKENS,
    })
    expect(result).toBeGreaterThan(0)
  })
})
