// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from 'vitest'
import { ALL_SPECIAL_TOKENS } from './constants.js'
import { GptEncoding } from './GptEncoding.js'
import { EndOfText } from './specialTokens.js'

describe('isWithinTokenLimit with chat and special tokens', () => {
  // Use a specific chat model that we know supports chat functionality
  test('should work with chat messages containing special tokens', async () => {
    const encoding: GptEncoding = await import('./model/gpt-3.5-turbo.js').then(
      (mod) => mod.default,
    )

    const chatWithSpecialToken = [
      { role: 'user' as const, content: `Hello ${EndOfText} world` },
    ]

    const result = encoding.isWithinTokenLimit(chatWithSpecialToken, 100, {
      allowedSpecial: ALL_SPECIAL_TOKENS,
    })
    expect(result).toBeGreaterThan(0)
  })

  test('should fail with chat messages containing disallowed special tokens', async () => {
    const encoding: GptEncoding = await import('./model/gpt-3.5-turbo.js').then(
      (mod) => mod.default,
    )

    const chatWithSpecialToken = [
      { role: 'user' as const, content: `Hello ${EndOfText} world` },
    ]

    expect(() => {
      encoding.isWithinTokenLimit(chatWithSpecialToken, 100)
    }).toThrow('Disallowed special token found')
  })
})
