import { describe, expect, test } from 'vite-plus/test'
import fixtures from './__fixtures__/unicode16Tokens.json'
import { GptEncoding } from './GptEncoding.js'
import { type EncodingName } from './mapping.js'
import {
  CL100K_TOKEN_SPLIT_REGEX,
  O200K_TOKEN_SPLIT_REGEX,
} from './encodingParams/constants.js'
import { resolveEncoding } from './resolveEncoding.js'

// Generated offline by the official Python implementation, not the current
// JavaScript engine's property tables or another JS tokenizer sharing them.
describe.each(['cl100k_base', 'o200k_base'] as const)(
  '%s Unicode16 token boundaries',
  (encoding) => {
    const api = GptEncoding.getEncodingApi(
      encoding as EncodingName,
      resolveEncoding,
    )
    test.each(fixtures.cases)(
      'canonical categories: $text',
      ({ text, tokens }) => {
        const expected = tokens[encoding]
        expect(api.encode(text)).toEqual(expected)
        expect(api.countTokens(text)).toBe(expected.length)
        expect(Array.from(api.encodeGenerator(text)).flat()).toEqual(expected)
        expect(api.decode(expected)).toBe(text)
      },
    )
  },
)

describe.each([CL100K_TOKEN_SPLIT_REGEX, O200K_TOKEN_SPLIT_REGEX])(
  'Unicode regex dispatch',
  (regex) => {
    test.each(['x ordinary ASCII words 123', 'x\u{32A13}?t and text'])(
      'preserves match/matchAll/exec state: %s',
      (text) => {
        const plain = new RegExp(regex.source, regex.flags)
        try {
          regex.lastIndex = plain.lastIndex = 1
          expect(text.match(regex)).toEqual(text.match(plain))
          expect(regex.lastIndex).toBe(plain.lastIndex)
          regex.lastIndex = plain.lastIndex = 1
          const a = text.matchAll(regex)
          const b = text.matchAll(regex)
          const expected = Array.from(text.matchAll(plain))
          expect(Array.from(a)).toEqual(expected)
          expect(Array.from(b)).toEqual(expected)
          expect(regex.lastIndex).toBe(1)
          regex.lastIndex = plain.lastIndex = 1
          let actual: RegExpExecArray | null
          do {
            actual = regex.exec(text)
            expect(actual).toEqual(plain.exec(text))
            expect(regex.lastIndex).toBe(plain.lastIndex)
          } while (actual)
        } finally {
          regex.lastIndex = 0
        }
      },
    )
  },
)

test('Unicode long-s contraction preserves the leading-space I-apostrophe token', () => {
  const text = " I'ſa"
  const api = GptEncoding.getEncodingApi('o200k_base', resolveEncoding)
  // Official Python tiktoken0.14.0: space-I-apostrophe, long-s, a.
  const expected = [3413, 70067, 64]
  expect(api.encode(text)).toEqual(expected)
  expect(api.countTokens(text)).toBe(3)
  expect(Array.from(api.encodeGenerator(text)).flat()).toEqual(expected)
  expect(api.decode(expected)).toBe(text)
})
