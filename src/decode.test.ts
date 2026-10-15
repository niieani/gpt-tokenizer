import { describe, expect, test } from 'vite-plus/test'
import { BytePairEncodingCore } from './BytePairEncodingCore.js'
import cl100k from './encoding/cl100k_base.js'
import o200k from './encoding/o200k_base.js'

// Include deliberately invalid UTF-8: decoding must agree with concatenated
// bytes, including replacement characters, rather than just valid round trips.
const decoder = new TextDecoder('utf8', { ignoreBOM: true })
const values = [
  'a',
  [0xf0],
  [0x9f],
  [0x98],
  [0x80],
  [0xff],
  [0xef, 0xbb, 0xbf],
  'é',
  [0xc3],
  '😀',
  '中',
  '',
  [],
] as const
const bytes = values.map((value) =>
  typeof value === 'string'
    ? new TextEncoder().encode(value)
    : new Uint8Array(value),
)
const core = new BytePairEncodingCore({
  bytePairRankDecoder: values,
  tokenSplitRegex: /./gu,
})

function expected(ids: number[]) {
  return decoder.decode(new Uint8Array(ids.flatMap((id) => [...bytes[id]!])))
}

describe('independent and contiguous UTF-8 decoding', () => {
  test.each(['getter', 'proxy'] as const)(
    'short %s-backed arrays read each token once before incomplete UTF-8',
    (kind) => {
      let reads = 0
      const firstToken = () => (++reads === 1 ? 0 : 7)
      const ids = [0, 8]
      const tokens =
        kind === 'getter'
          ? Object.defineProperty(ids, '0', { get: firstToken })
          : new Proxy(ids, {
              get(target, property, receiver) {
                return property === '0'
                  ? firstToken()
                  : Reflect.get(target, property, receiver)
              },
            })

      expect(core.decodeNative(tokens)).toBe('a\uFFFD')
      expect(reads).toBe(1)
    },
  )

  test('arbitrary sequences agree with decoding their concatenated bytes', () => {
    let state = 123456
    for (let iteration = 0; iteration < 1000; iteration++) {
      const ids = Array.from({ length: iteration % 200 }, () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0
        return state % values.length
      })
      expect(core.decodeNative(ids)).toBe(expected(ids))
      expect(core.decodeNative(new Uint32Array(ids))).toBe(expected(ids))
      expect(core.decodeNative(new Set(ids))).toBe(expected([...new Set(ids)]))
    }
  })

  test('incremental byte storage grows without changing previously cached tokens', () => {
    const text = '𐌀'.repeat(2048)
    const growing = new BytePairEncodingCore({
      bytePairRankDecoder: [[0xff], text, [0xf0], [0x90, 0x8c, 0x80]],
      tokenSplitRegex: /./gu,
    })
    const ids = Array.from({ length: 128 }, (_, index) => index % 2)
    expect(growing.decodeNative(ids)).toBe(('�' + text).repeat(64))
    expect(
      growing.decodeNative(
        Array.from({ length: 128 }, (_, index) => 2 + (index % 2)),
      ),
    ).toBe('𐌀'.repeat(64))
    expect(growing.decodeNative(ids)).toBe(('�' + text).repeat(64))
  })

  test('string-heavy arrays decode outlined byte runs and preserve boundaries', () => {
    const prefix = Array(128).fill(0)
    const ids = [
      ...prefix,
      1,
      11,
      2,
      3,
      4,
      0,
      ...Array.from({ length: 400 }, () => [1, 2, 3, 4]).flat(),
      0,
      8,
      0,
    ]
    expect(core.decodeNative(ids)).toBe(expected(ids))
    expect(core.decodeNative(new Uint32Array(ids))).toBe(expected(ids))
    expect(() => core.decodeNative([...prefix, 123456])).toThrow('Token 123456')
  })

  test('short UTF-8 paths enforce overlong, surrogate and scalar boundaries', () => {
    const raw = new BytePairEncodingCore({
      bytePairRankDecoder: Array.from({ length: 256 }, (_, byte) => [byte]),
      tokenSplitRegex: /./gu,
    })
    const cases = [
      [0],
      [0x7f],
      [0x80],
      [0xff],
      [0xc0, 0xaf],
      [0xc1, 0xbf],
      [0xc2, 0x80],
      [0xdf, 0xbf],
      [0xc3, 0x61],
      [0xe0, 0x9f, 0xbf],
      [0xe0, 0xa0, 0x80],
      [0xed, 0x9f, 0xbf],
      [0xed, 0xa0, 0x80],
      [0xef, 0xbb, 0xbf],
      [0xf0, 0x8f, 0xbf, 0xbf],
      [0xf0, 0x90, 0x80, 0x80],
      [0xf4, 0x8f, 0xbf, 0xbf],
      [0xf4, 0x90, 0x80, 0x80],
      [0xf5, 0x80, 0x80, 0x80],
      [0xf0],
      [0xf0, 0x90],
      [0xf0, 0x90, 0x80],
      [0x61, 0x62, 0x63, 0x64],
      [0xc3, 0xa9, 0xc3, 0xa9],
    ]
    for (const bytes of cases) {
      const expected = decoder.decode(new Uint8Array(bytes))
      expect(raw.decodeNative(bytes)).toBe(expected)
      expect(raw.decodeNative(new Uint32Array(bytes))).toBe(expected)
      expect(
        raw.decodeNative(
          (function* () {
            yield* bytes
          })(),
        ),
      ).toBe(expected)
    }
  })

  test('word copies exclude their padding and tolerate empty tokens', () => {
    const empty = new BytePairEncodingCore({
      bytePairRankDecoder: [[], [0xff]],
      tokenSplitRegex: /./gu,
    })
    expect(empty.decodeNative(Array(128).fill(0))).toBe('')
    expect(empty.decodeNative([...Array(127).fill(0), 1])).toBe('�')
  })

  test('incomplete bytes are flushed at the end of each independent call', () => {
    expect(core.decodeNative([1, 11, 2, 3, 4])).toBe('😀')
    expect(core.decodeNative([1])).toBe('�')
    expect(core.decodeNative([2, 3, 4])).toBe('���')
    expect(core.decodeNative([8, 7])).toBe('�é')
    expect(core.decodeNative([6])).toBe('\ufeff')
    expect(() => core.decodeNative([123456])).toThrow('Token 123456')
  })

  test.each([
    ['cl100k', cl100k],
    ['o200k', o200k],
  ] as const)(
    '%s generators maintain independent decoder state',
    async (_, encoding) => {
      // These characters need multiple raw-byte tokens on both encodings.
      const tokens = encoding.encode('𝄞')
      expect(tokens.length).toBeGreaterThan(1)
      const incomplete = tokens.slice(0, 1)
      const first = encoding.decodeGenerator(incomplete)
      const second = encoding.decodeGenerator(tokens)
      expect(first.next().value).toBe('�')
      expect([...second].join('')).toBe('𝄞')
      expect(encoding.decode(incomplete)).toBe('�')
      expect(encoding.decode(tokens)).toBe('𝄞')
      async function* source(ids: number[]) {
        yield* ids
      }
      const one = encoding.decodeAsync(source(incomplete))
      const two = encoding.decodeAsync(source(tokens))
      expect(await one).toBe('�')
      expect(await two).toBe('𝄞')
      const parts: string[] = []
      for await (const part of encoding.decodeAsyncGenerator(
        source(incomplete),
      ))
        parts.push(part)
      expect(parts.join('')).toBe('�')
    },
  )
})
