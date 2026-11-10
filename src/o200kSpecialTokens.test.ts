import { describe, expect, test } from 'vite-plus/test'
import * as o200kBase from './encoding/o200k_base.js'
import * as o200kHarmony from './encoding/o200k_harmony.js'
import * as main from './main.js'
import * as gpt4o from './model/gpt-4o.js'
import {
  EndOfPrompt,
  EndOfText,
  FimMiddle,
  FimPrefix,
  FimSuffix,
  HarmonyStart,
  ImEnd,
  ImSep,
  ImStart,
} from './specialTokens.js'

// Official IDs: https://github.com/openai/tiktoken/blob/main/tiktoken_ext/openai_public.py
const officialSpecialTokens = [
  [EndOfText, 199_999],
  [EndOfPrompt, 200_018],
] as const

describe.each([
  ['o200k_base', o200kBase],
  ['o200k_harmony', o200kHarmony],
  ['default entry point', main],
  ['gpt-4o model entry point', gpt4o],
] as const)('%s special-token IDs', (_, encoding) => {
  test.each(officialSpecialTokens)('%s uses token %i', (text, token) => {
    expect(encoding.encode(text, { allowedSpecial: 'all' })).toEqual([token])
    expect(encoding.encode(text, { allowedSpecial: new Set([text]) })).toEqual([
      token,
    ])
    expect(encoding.decode([token])).toBe(text)
    expect([...encoding.decodeGenerator([token])].join('')).toBe(text)
  })

  test('decodes the official end-of-prompt ID asynchronously', async () => {
    async function* tokens() {
      yield 200_018
    }
    let decoded = ''
    for await (const text of encoding.decodeAsyncGenerator(tokens())) {
      decoded += text
    }
    expect(decoded).toBe(EndOfPrompt)
  })
})

describe('o200k compatibility extensions', () => {
  test.each([
    [FimPrefix, 200_000],
    [FimMiddle, 200_001],
    [FimSuffix, 200_002],
    [ImStart, 200_003],
    [ImEnd, 200_004],
    [ImSep, 200_005],
  ] as const)('preserves %s as token %i', (text, token) => {
    expect(o200kBase.encode(text, { allowedSpecial: 'all' })).toEqual([token])
    expect(o200kBase.decode([token])).toBe(text)
  })

  test('does not retain the incorrect end-of-prompt ID as an alias', () => {
    expect(() => o200kBase.decode([200_006])).toThrowError(
      'Token 200006 is not in the byte pair encoder.',
    )
    expect(o200kHarmony.decode([200_006])).toBe(HarmonyStart)
  })

  test('preserves ChatML framing for o200k models', () => {
    const chat = [{ role: 'user' as const, content: 'hello' }]
    const expected = [
      200_003, 1_428, 200_005, 24_912, 200_004, 200_003, 173_781, 200_005,
    ]
    expect(gpt4o.encodeChat(chat)).toEqual(expected)
    expect([...gpt4o.encodeChatGenerator(chat)].flat()).toEqual(expected)
  })
})
