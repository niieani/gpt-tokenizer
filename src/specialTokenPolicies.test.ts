import { describe, expect, test } from 'vite-plus/test'
import fixtures from './__fixtures__/specialTokens.json'
import { type EncodeOptions, GptEncoding } from './GptEncoding.js'
import { encodingNames } from './mapping.js'
import { resolveEncoding } from './resolveEncoding.js'

interface Reference {
  policies: {
    allowedSpecial?: string | string[]
    disallowedSpecial?: string | string[]
  }[]
  encodings: Record<
    string,
    {
      specialTokens: Record<string, number>
      invalidTokenIds: number[]
      ordinaryTokens: Record<string, number[]>
      decodedTokens: Record<string, string>
      unregisteredTokens: Record<string, number[]>
      policies: {
        policy: number
        text: string
        tokens?: number[]
        error?: boolean
      }[]
    }
  >
}
const reference: Reference = fixtures

function option(value: string | string[] | undefined) {
  if (value === undefined || value === 'all') return value
  if (Array.isArray(value)) return new Set(value)
  throw new Error(`Invalid fixture policy: ${value}`)
}

function options(index: number): EncodeOptions {
  const policy = reference.policies[index]!
  return {
    allowedSpecial: option(policy.allowedSpecial),
    disallowedSpecial: option(policy.disallowedSpecial),
  }
}

describe.each(encodingNames)('%s tiktoken special-token policies', (name) => {
  const encoding = GptEncoding.getEncodingApi(name, resolveEncoding)
  const expected = reference.encodings[name]!

  test.each(Object.entries(expected.specialTokens))(
    '%s has the official token ID and policies',
    (text, id) => {
      for (const policy of [
        { allowedSpecial: 'all' },
        { allowedSpecial: 'all', disallowedSpecial: 'all' },
        { allowedSpecial: new Set([text]) },
      ] satisfies EncodeOptions[]) {
        expect(encoding.encode(text, policy)).toEqual([id])
        expect([...encoding.encodeGenerator(text, policy)].flat()).toEqual([id])
        expect(encoding.countTokens(text, policy)).toBe(1)
        expect(encoding.isWithinTokenLimit(text, 1, policy)).toBe(1)
        expect(encoding.isWithinTokenLimit(text, 0, policy)).toBe(false)
      }
      expect(() => encoding.encode(text)).toThrow(/Disallowed special token/)
      expect(() =>
        encoding.encode(text, {
          allowedSpecial: 'all',
          disallowedSpecial: new Set([text]),
        }),
      ).toThrow(/Disallowed special token/)
      expect(encoding.encode(text, { disallowedSpecial: new Set() })).toEqual(
        expected.ordinaryTokens[text],
      )
    },
  )

  test('decodes every official special ID through each decoder', async () => {
    for (const [id, text] of Object.entries(expected.decodedTokens)) {
      const tokens = [Number(id)]
      expect(encoding.decode(tokens)).toBe(text)
      expect([...encoding.decodeGenerator(tokens)].join('')).toBe(text)
      async function* stream() {
        yield* tokens
      }
      let decoded = ''
      for await (const chunk of encoding.decodeAsyncGenerator(stream()))
        decoded += chunk
      expect(decoded).toBe(text)
    }
  })

  // The legacy FIM/ChatML extensions are a separate compatibility decision.
  // Exercise policy semantics here without those extension-only literals.
  const policyCases = expected.policies.filter(
    ({ text }) => text !== '<|im_start|>' && text !== '<|fim_prefix|>',
  )

  test.each(policyCases)(
    'matches tiktoken option policy $policy on $text',
    ({ policy, text, tokens, error }) => {
      const config = options(policy)
      const calls = [
        () => encoding.encode(text, config),
        () => [...encoding.encodeGenerator(text, config)].flat(),
        () => encoding.countTokens(text, config),
        () => encoding.isWithinTokenLimit(text, Infinity, config),
        () => encoding.createIncrementalCounter(config).update(text),
      ]
      if (error) {
        for (const call of calls)
          expect(call).toThrow(/Disallowed special token/)
      } else {
        expect(calls[0]!()).toEqual(tokens)
        expect(calls[1]!()).toEqual(tokens)
        for (const call of calls.slice(2)) expect(call()).toBe(tokens!.length)
        // Both append boundaries and replacement edits must preserve the policy.
        const counter = encoding.createIncrementalCounter(config)
        const split = Math.floor(text.length / 2)
        counter.append(text.slice(0, split))
        expect(counter.append(text.slice(split))).toBe(tokens!.length)
        expect(counter.applyEdit(0, text.length, text)).toBe(tokens!.length)
      }
    },
  )
})
