import { describe, expect, test } from 'vite-plus/test'
import { ALL_SPECIAL_TOKENS } from './constants.js'
import { type EncodingName } from './mapping.js'
import { type EncodeOptions, GptEncoding } from './GptEncoding.js'
import { resolveEncoding } from './resolveEncoding.js'
import { EndOfPrompt, EndOfText } from './specialTokens.js'

const getEncoding = (encodingName: string) =>
  GptEncoding.getEncodingApi(encodingName as EncodingName, resolveEncoding)

/**
 * Reference vectors generated with the Python `tiktoken` package
 * (`encoding.encode(text, allowed_special="all")`).
 */
const allowedAnywhereCases: [
  encodingName: string,
  label: string,
  text: string,
  expected: number[],
][] = [
  [
    'o200k_base',
    'mid-text',
    'hello <|endoftext|> world',
    [24912, 220, 199999, 2375],
  ],
  [
    'o200k_base',
    'multiple',
    'a<|endoftext|>b<|endoftext|>c',
    [64, 199999, 65, 199999, 66],
  ],
  ['o200k_base', 'trailing', 'hi <|endoftext|>', [3686, 220, 199999]],
  ['o200k_base', 'start of text', '<|endoftext|>hi', [199999, 3686]],
  ['o200k_base', 'adjacent', '<|endoftext|><|endoftext|>', [199999, 199999]],
  ['o200k_base', 'only token', '<|endoftext|>', [199999]],
  [
    'o200k_base',
    'surrounded by whitespace',
    '  <|endoftext|>  ',
    [256, 199999, 256],
  ],
  [
    'o200k_base',
    'between newlines and unicode',
    '\u00e9<|endoftext|>\u65e5\u672c\u8a9e\n<|endoftext|>\ud83d\ude42',
    [377, 199999, 9048, 40909, 198, 199999, 37459],
  ],
  [
    'o200k_base',
    'no specials',
    'hello world, no specials',
    [24912, 2375, 11, 860, 75525],
  ],
  [
    'o200k_base',
    'truncated token is plain text',
    'x <|endoftext| y',
    [87, 464, 91, 419, 1440, 919, 91, 342],
  ],
  [
    'cl100k_base',
    'mid-text',
    'hello <|endoftext|> world',
    [15339, 220, 100257, 1917],
  ],
  [
    'cl100k_base',
    'multiple',
    'a<|endoftext|>b<|endoftext|>c',
    [64, 100257, 65, 100257, 66],
  ],
  ['cl100k_base', 'trailing', 'hi <|endoftext|>', [6151, 220, 100257]],
  ['cl100k_base', 'start of text', '<|endoftext|>hi', [100257, 6151]],
  ['cl100k_base', 'adjacent', '<|endoftext|><|endoftext|>', [100257, 100257]],
  ['cl100k_base', 'only token', '<|endoftext|>', [100257]],
  [
    'cl100k_base',
    'surrounded by whitespace',
    '  <|endoftext|>  ',
    [256, 100257, 256],
  ],
  [
    'cl100k_base',
    'between newlines and unicode',
    '\u00e9<|endoftext|>\u65e5\u672c\u8a9e\n<|endoftext|>\ud83d\ude42',
    [978, 100257, 9080, 22656, 45918, 252, 198, 100257, 9468, 19044],
  ],
  [
    'cl100k_base',
    'no specials',
    'hello world, no specials',
    [15339, 1917, 11, 912, 60874],
  ],
  [
    'cl100k_base',
    'truncated token is plain text',
    'x <|endoftext| y',
    [87, 83739, 8862, 728, 428, 91, 379],
  ],
  [
    'p50k_base',
    'mid-text',
    'hello <|endoftext|> world',
    [31373, 220, 50256, 995],
  ],
  [
    'p50k_base',
    'multiple',
    'a<|endoftext|>b<|endoftext|>c',
    [64, 50256, 65, 50256, 66],
  ],
  ['p50k_base', 'trailing', 'hi <|endoftext|>', [5303, 220, 50256]],
  ['p50k_base', 'start of text', '<|endoftext|>hi', [50256, 5303]],
  [
    'r50k_base',
    'mid-text',
    'hello <|endoftext|> world',
    [31373, 220, 50256, 995],
  ],
  [
    'r50k_base',
    'multiple',
    'a<|endoftext|>b<|endoftext|>c',
    [64, 50256, 65, 50256, 66],
  ],
  ['r50k_base', 'trailing', 'hi <|endoftext|>', [5303, 220, 50256]],
  ['r50k_base', 'start of text', '<|endoftext|>hi', [50256, 5303]],
  ['gpt2', 'mid-text', 'hello <|endoftext|> world', [31373, 220, 50256, 995]],
  [
    'gpt2',
    'multiple',
    'a<|endoftext|>b<|endoftext|>c',
    [64, 50256, 65, 50256, 66],
  ],
]

/**
 * Reference vectors generated with `tiktoken` for a subset of allowed special
 * tokens (`allowed_special={...}, disallowed_special=()`).
 *
 * `o200k_base` is only exercised with `<|endoftext|>` allowed: this library
 * assigns `<|endofprompt|>` a different id than tiktoken for that encoding,
 * which is unrelated to where the token appears in the text.
 */
const allowedSubsetCases: [
  encodingName: string,
  label: string,
  text: string,
  allowed: string[],
  expected: number[],
][] = [
  [
    'o200k_base',
    'disallowed first, allowed later',
    '<|endofprompt|> x <|endoftext|> y <|endofprompt|>',
    ['<|endoftext|>'],
    [
      27, 91, 419, 1440, 82467, 91, 29, 1215, 220, 199999, 342, 464, 91, 419,
      1440, 82467, 91, 29,
    ],
  ],
  [
    'o200k_base',
    'no allowed tokens, disallowed ignored',
    'hello <|endoftext|> world',
    [],
    [24912, 464, 91, 419, 1440, 919, 91, 29, 2375],
  ],
  [
    'cl100k_base',
    'only endofprompt allowed',
    'a <|endoftext|> b <|endofprompt|> c',
    ['<|endofprompt|>'],
    [64, 83739, 8862, 728, 428, 91, 29, 293, 220, 100276, 272],
  ],
  [
    'cl100k_base',
    'disallowed first, allowed later',
    '<|endofprompt|> x <|endoftext|> y <|endofprompt|>',
    ['<|endoftext|>'],
    [
      27, 91, 408, 1073, 41681, 91, 29, 865, 220, 100257, 379, 83739, 408, 1073,
      41681, 91, 29,
    ],
  ],
  [
    'cl100k_base',
    'no allowed tokens, disallowed ignored',
    'hello <|endoftext|> world',
    [],
    [15339, 83739, 8862, 728, 428, 91, 29, 1917],
  ],
]

describe('allowed special tokens are recognised anywhere in the text', () => {
  describe.each(allowedAnywhereCases)(
    '%s: %s',
    (encodingName, _label, text, expected) => {
      const encoding = getEncoding(encodingName)
      const options: EncodeOptions = { allowedSpecial: ALL_SPECIAL_TOKENS }

      test('encode matches tiktoken', () => {
        expect(encoding.encode(text, options)).toEqual(expected)
      })

      test('encodeGenerator matches tiktoken', () => {
        expect([...encoding.encodeGenerator(text, options)].flat()).toEqual(
          expected,
        )
      })

      test('countTokens agrees with encode', () => {
        expect(encoding.countTokens(text, options)).toBe(expected.length)
      })

      test('isWithinTokenLimit agrees with encode', () => {
        expect(
          encoding.isWithinTokenLimit(text, expected.length, options),
        ).toBe(expected.length)
        expect(
          encoding.isWithinTokenLimit(text, expected.length - 1, options),
        ).toBe(false)
      })

      test('decode round-trips', () => {
        expect(encoding.decode(encoding.encode(text, options))).toBe(text)
      })
    },
  )

  test.each(['o200k_base', 'cl100k_base'])(
    '%s: an explicit allowedSpecial set behaves like "all" for the tokens it contains',
    (encodingName) => {
      const encoding = getEncoding(encodingName)
      const text = `hello ${EndOfText} world`
      expect(
        encoding.encode(text, { allowedSpecial: new Set([EndOfText]) }),
      ).toEqual(encoding.encode(text, { allowedSpecial: ALL_SPECIAL_TOKENS }))
    },
  )

  test('README example: cl100k_base with allowedSpecial: new Set([EndOfPrompt])', () => {
    const encoding = getEncoding('cl100k_base')
    const text = `Some Text ${EndOfPrompt}`

    expect(
      encoding.encode(text, { allowedSpecial: new Set([EndOfPrompt]) }),
    ).toEqual([8538, 2991, 220, 100276])
  })
})

describe('only the allowed subset of special tokens is recognised', () => {
  test.each(allowedSubsetCases)(
    '%s: %s',
    (encodingName, _label, text, allowed, expected) => {
      const encoding = getEncoding(encodingName)
      const options: EncodeOptions = {
        allowedSpecial: new Set(allowed),
        disallowedSpecial: new Set<string>(),
      }

      expect(encoding.encode(text, options)).toEqual(expected)
      expect(encoding.countTokens(text, options)).toBe(expected.length)
      expect(encoding.decode(encoding.encode(text, options))).toBe(text)
    },
  )
})

describe('special tokens that are not allowed', () => {
  test.each(['o200k_base', 'cl100k_base', 'p50k_base', 'r50k_base', 'gpt2'])(
    '%s: throws by default wherever the token appears',
    (encodingName) => {
      const encoding = getEncoding(encodingName)

      for (const text of [
        `${EndOfText}hi`,
        `hello ${EndOfText} world`,
        `hi ${EndOfText}`,
      ]) {
        expect(() => encoding.encode(text)).toThrowError(
          /Disallowed special token found/,
        )
        expect(() => encoding.countTokens(text)).toThrowError(
          /Disallowed special token found/,
        )
        expect(() => encoding.isWithinTokenLimit(text, 100)).toThrowError(
          /Disallowed special token found/,
        )
      }
    },
  )

  test('text without special tokens is unaffected by the default options', () => {
    const encoding = getEncoding('o200k_base')
    const text = 'hello world, no specials'

    expect(encoding.encode(text)).toEqual([24_912, 2375, 11, 860, 75_525])
    expect(
      encoding.encode(text, { allowedSpecial: ALL_SPECIAL_TOKENS }),
    ).toEqual(encoding.encode(text))
  })
})
