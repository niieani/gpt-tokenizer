import { describe, expect, test } from 'vite-plus/test'
import { GptEncoding } from './GptEncoding.js'
import { type EncodingName } from './mapping.js'
import { resolveEncoding } from './resolveEncoding.js'

const getEncoding = (encodingName: string) =>
  GptEncoding.getEncodingApi(encodingName as EncodingName, resolveEncoding)

/**
 * Two things have to line up with tiktoken for these strings:
 *
 * - the split patterns must treat `\s` as the Unicode White_Space property.
 *   JavaScript's own `\s` differs from it on exactly two code points: U+0085
 *   (White_Space only) and U+FEFF (JavaScript `\s` only);
 * - tokens that start with the UTF-8 byte order mark (EF BB BF, i.e. U+FEFF)
 *   must stay reachable, even though a plain `TextDecoder` strips that mark.
 *
 * Reference vectors generated with the Python `tiktoken` package
 * (`encoding.encode(text)`).
 */
const unicodeWhiteSpaceCases: [
  encodingName: string,
  text: string,
  expected: number[],
][] = [
  ['cl100k_base', 'a\ufeffb', [64, 3305, 65]],
  ['cl100k_base', 'Hello\ufeff\n', [9906, 62619]],
  ['o200k_base', 'x\ufeff\ufeffy', [87, 135153, 88]],
  ['o200k_base', 'a \u0085b', [64, 220, 126, 227, 65]],
  ['cl100k_base', 'a \u0085b', [64, 220, 126, 227, 65]],
  ['p50k_base', 'a \ufeffb', [64, 27332, 119, 123, 65]],
  ['r50k_base', 'a \ufeffb', [64, 27332, 119, 123, 65]],
  ['r50k_base', 'a \u0085b', [64, 220, 126, 227, 65]],
  ['p50k_base', 'a \u0085b', [64, 220, 126, 227, 65]],
  ['o200k_base', 'a\ufeffb', [64, 5574, 65]],
  ['cl100k_base', 'x\ufeff\ufeffy', [87, 3305, 3305, 88]],
  ['o200k_base', 'Hello\ufeff\n', [13225, 61992]],
  ['o200k_base', '\ufeffHello world', [5574, 13225, 2375]],
  ['cl100k_base', '\ufeffHello world', [3305, 9906, 1917]],
  ['o200k_base', 'a\u0085b', [64, 126, 227, 65]],
  ['cl100k_base', 'a\u0085\n\u0085b', [64, 126, 227, 198, 126, 227, 65]],
  ['o200k_base', 'line one\u0085line two', [1137, 1001, 126, 227, 1137, 1920]],
  ['cl100k_base', 'line one\u0085line two', [1074, 832, 126, 227, 1074, 1403]],
  ['p50k_base', 'a\ufeffb', [64, 171, 119, 123, 65]],
  ['r50k_base', 'a\ufeffb', [64, 171, 119, 123, 65]],
]

/**
 * Ordinary whitespace must keep tokenizing exactly as before (and exactly like
 * tiktoken): the change above only affects U+0085 and U+FEFF.
 */
const ordinaryWhiteSpaceCases: [
  encodingName: string,
  label: string,
  text: string,
  expected: number[],
][] = [
  ['cl100k_base', 'space', 'a  b', [64, 220, 293]],
  ['cl100k_base', 'tabs', 'a\t\tb\tc', [64, 197, 2282, 1470]],
  ['cl100k_base', 'newlines', 'a\n\nb\r\nc\n', [64, 271, 65, 319, 66, 198]],
  ['cl100k_base', 'nbsp', 'a\u00a0b \u00a0c', [64, 4194, 65, 220, 4194, 66]],
  [
    'cl100k_base',
    'ideographic space',
    'a\u3000b\u3000\u3000c',
    [64, 23249, 65, 23249, 23249, 66],
  ],
  [
    'cl100k_base',
    'line and paragraph separators',
    'a\u2028b\u2029c \u2028',
    [64, 378, 101, 65, 378, 102, 66, 639, 101],
  ],
  [
    'cl100k_base',
    'mixed unicode spaces',
    'x\u2003y\u2009\u200az\u202f\u205f',
    [87, 378, 225, 88, 378, 231, 378, 232, 89, 378, 107, 53233, 253],
  ],
  [
    'cl100k_base',
    'vertical tab and form feed',
    'a\u000bb\fc',
    [64, 199, 65, 200, 66],
  ],
  ['cl100k_base', 'trailing whitespace', 'hello   \n  ', [15339, 5996, 256]],
  ['cl100k_base', 'leading whitespace', '   hello', [256, 24748]],
  ['o200k_base', 'space', 'a  b', [64, 220, 287]],
  ['o200k_base', 'tabs', 'a\t\tb\tc', [64, 197, 3722, 2736]],
  ['o200k_base', 'newlines', 'a\n\nb\r\nc\n', [64, 279, 65, 370, 66, 198]],
  ['o200k_base', 'nbsp', 'a\u00a0b \u00a0c', [64, 5310, 65, 220, 5310, 66]],
  [
    'o200k_base',
    'ideographic space',
    'a\u3000b\u3000\u3000c',
    [64, 1397, 65, 1397, 1397, 66],
  ],
  [
    'o200k_base',
    'line and paragraph separators',
    'a\u2028b\u2029c \u2028',
    [64, 51008, 65, 318, 102, 66, 121514],
  ],
  [
    'o200k_base',
    'mixed unicode spaces',
    'x\u2003y\u2009\u200az\u202f\u205f',
    [87, 33203, 88, 29106, 86741, 89, 35971, 37127, 253],
  ],
  [
    'o200k_base',
    'vertical tab and form feed',
    'a\u000bb\fc',
    [64, 199, 65, 200, 66],
  ],
  ['o200k_base', 'trailing whitespace', 'hello   \n  ', [24912, 10190, 256]],
  ['o200k_base', 'leading whitespace', '   hello', [256, 40617]],
  ['p50k_base', 'space', 'a  b', [64, 220, 275]],
  ['p50k_base', 'tabs', 'a\t\tb\tc', [64, 197, 197, 65, 197, 66]],
  [
    'p50k_base',
    'newlines',
    'a\n\nb\r\nc\n',
    [64, 198, 198, 65, 201, 198, 66, 198],
  ],
  ['p50k_base', 'nbsp', 'a\u00a0b \u00a0c', [64, 1849, 65, 220, 1849, 66]],
  [
    'p50k_base',
    'ideographic space',
    'a\u3000b\u3000\u3000c',
    [64, 5099, 222, 65, 5099, 222, 5099, 222, 66],
  ],
  [
    'p50k_base',
    'line and paragraph separators',
    'a\u2028b\u2029c \u2028',
    [64, 447, 101, 65, 447, 102, 66, 564, 101],
  ],
  [
    'p50k_base',
    'mixed unicode spaces',
    'x\u2003y\u2009\u200az\u202f\u205f',
    [87, 447, 225, 88, 447, 231, 447, 232, 89, 447, 107, 46256, 253],
  ],
  [
    'p50k_base',
    'vertical tab and form feed',
    'a\u000bb\fc',
    [64, 199, 65, 200, 66],
  ],
  [
    'p50k_base',
    'trailing whitespace',
    'hello   \n  ',
    [31373, 50258, 198, 50257],
  ],
  ['p50k_base', 'leading whitespace', '   hello', [50257, 23748]],
  ['r50k_base', 'space', 'a  b', [64, 220, 275]],
  ['r50k_base', 'tabs', 'a\t\tb\tc', [64, 197, 197, 65, 197, 66]],
  [
    'r50k_base',
    'newlines',
    'a\n\nb\r\nc\n',
    [64, 198, 198, 65, 201, 198, 66, 198],
  ],
  ['r50k_base', 'nbsp', 'a\u00a0b \u00a0c', [64, 1849, 65, 220, 1849, 66]],
  [
    'r50k_base',
    'ideographic space',
    'a\u3000b\u3000\u3000c',
    [64, 5099, 222, 65, 5099, 222, 5099, 222, 66],
  ],
  [
    'r50k_base',
    'line and paragraph separators',
    'a\u2028b\u2029c \u2028',
    [64, 447, 101, 65, 447, 102, 66, 564, 101],
  ],
  [
    'r50k_base',
    'mixed unicode spaces',
    'x\u2003y\u2009\u200az\u202f\u205f',
    [87, 447, 225, 88, 447, 231, 447, 232, 89, 447, 107, 46256, 253],
  ],
  [
    'r50k_base',
    'vertical tab and form feed',
    'a\u000bb\fc',
    [64, 199, 65, 200, 66],
  ],
  [
    'r50k_base',
    'trailing whitespace',
    'hello   \n  ',
    [31373, 220, 220, 220, 198, 220, 220],
  ],
  ['r50k_base', 'leading whitespace', '   hello', [220, 220, 23748]],
]

describe('Unicode White_Space handling in the split patterns', () => {
  // Keep this test first: the shared TextDecoder only strips a BOM on its very
  // first decode, so later decodes in this file would hide a regression.
  test('decode keeps U+FEFF tokens', () => {
    const encoding = getEncoding('cl100k_base')
    const feff = String.fromCodePoint(0xfeff)

    // 3305 is the single token for the bytes EF BB BF
    expect(encoding.decode([3305])).toBe(feff)
    expect(encoding.decode([64, 3305, 65])).toBe(`a${feff}b`)
    // 62619 is the single token for the bytes EF BB BF 0A
    expect(encoding.decode([9906, 62_619])).toBe(`Hello${feff}\n`)
  })

  describe.each(unicodeWhiteSpaceCases)(
    '%s: %j',
    (encodingName, text, expected) => {
      const encoding = getEncoding(encodingName)

      test('encode matches tiktoken', () => {
        expect(encoding.encode(text)).toEqual(expected)
      })

      test('countTokens agrees with encode', () => {
        expect(encoding.countTokens(text)).toBe(expected.length)
      })

      test('decode round-trips', () => {
        expect(encoding.decode(encoding.encode(text))).toBe(text)
      })
    },
  )

  describe.each(ordinaryWhiteSpaceCases)(
    '%s: %s',
    (encodingName, _label, text, expected) => {
      const encoding = getEncoding(encodingName)

      test('encode matches tiktoken', () => {
        expect(encoding.encode(text)).toEqual(expected)
      })

      test('decode round-trips', () => {
        expect(encoding.decode(encoding.encode(text))).toBe(text)
      })
    },
  )
})
