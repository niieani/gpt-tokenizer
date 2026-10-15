import { describe, expect, test } from 'vite-plus/test'
import { BytePairEncodingCore } from './BytePairEncodingCore.js'
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

describe('synchronous piece iteration', () => {
  test('rejects non-global custom split patterns', () => {
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ['a'],
      tokenSplitRegex: /./u,
    })
    expect(() => core.encodeNative('a')).toThrow(TypeError)
    expect(() => core.countNative('a')).toThrow(TypeError)
  })

  test('advances zero-width matches in custom split patterns', () => {
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ['a', 'b'],
      tokenSplitRegex: /(?=b)|./gu,
    })
    expect(core.encodeNative('ab')).toEqual([0])
    expect(core.countNative('ab')).toBe(1)
    expect([...core.encodeNativeGenerator('ab')].flat()).toEqual([0])
  })

  test('does not disturb a suspended encoder generator', async () => {
    const { default: encoding } = await import('./encoding/o200k_base.js')
    const text = 'hello 👋 world 🌍\ufeff LongUnfamiliarWord12345'
    const expected = encoding.encode(text)
    const chunks = encoding.encodeGenerator(text)
    const first = chunks.next().value!
    expect(encoding.countTokens('another string 😀')).toBeGreaterThan(0)
    encoding.encode('interleaving more words')
    expect([first, ...chunks].flat()).toEqual(expected)
  })
})

describe('byte-rank lookup boundaries', () => {
  test('keeps byte ranks and partial UTF-8 merges exact', () => {
    const ranks: (string | number[])[] = Array.from({ length: 256 }, (_, i) =>
      i < 128 ? String.fromCharCode(i) : [i],
    )
    ranks.push([0xa9, 0xc3], [0xc3, 0xa9, 0xc3], [])
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ranks,
      tokenSplitRegex: /.+/gu,
      mergeCacheSize: 0,
    })
    expect(core.encodeNative('aéé')).toEqual([97, 257, 169])
    expect(core.encodeNative('\u007f\u0080\u07ff\u0800\u{10ffff}')).toEqual([
      127, 194, 128, 223, 191, 224, 160, 128, 244, 143, 191, 191,
    ])
  })
})

describe('merge cache size changes', () => {
  test('releases older cached pieces immediately when shrinking', () => {
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ['a', 'b', 'c'],
      tokenSplitRegex: /.+/gu,
      mergeCacheSize: 3,
    })
    core.encodeNative('ab')
    core.encodeNative('ac')
    core.encodeNative('bc')
    core.encodeNative('ab') // Reading a hit leaves insertion order intact.
    core.setMergeCacheSize(1)
    const cache = Reflect.get(core, 'mergeCache') as Map<string, number[]>
    expect([...cache.keys()]).toEqual(['bc'])
    expect(core.encodeNative('ab')).toEqual([0, 1])
    expect([...cache.keys()]).toEqual(['ab'])
    core.clearMergeCache()
    expect(cache.size).toBe(0)
    core.setMergeCacheSize(0)
    expect(Reflect.get(core, 'mergeCache')).toBeUndefined()
    core.setMergeCacheSize(1)
    expect(core.encodeNative('ac')).toEqual([0, 2])
  })
})

describe('bounded ASCII string merges', () => {
  test.each(['cl100k_base', 'o200k_base'])(
    '%s matches heap merging across ASCII bytes and tied candidates',
    async (name) => {
      const { default: encoding } =
        name === 'cl100k_base'
          ? await import('./encoding/cl100k_base.js')
          : await import('./encoding/o200k_base.js')
      const core = Reflect.get(encoding, 'bytePairEncodingCoreProcessor')
      const mergeAscii = Reflect.get(core, 'bytePairMergeAscii') as (
        input: string,
      ) => number[]
      const mergeBytes = Reflect.get(core, 'bytePairMerge') as (
        input: Uint8Array,
      ) => number[]
      const encoder = new TextEncoder()
      const samples = ['a'.repeat(64), '='.repeat(64), 'abab'.repeat(16)]
      let seed = 0x12345678
      for (let sample = 0; sample < 1000; sample++) {
        let text = ''
        for (let i = 0; i < sample % 65; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
          text += String.fromCharCode((seed >>> 24) & 127)
        }
        samples.push(text)
      }
      for (const text of samples) {
        expect(mergeAscii.call(core, text)).toEqual(
          mergeBytes.call(core, encoder.encode(text)),
        )
      }
    },
  )
})

describe('unified vocabulary and bounded piece cache', () => {
  test('cached pieces never become vocabulary ranks during later merges', () => {
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ['a', 'b', 'c', 'bc'],
      tokenSplitRegex: /.+/gu,
      mergeCacheSize: 2,
    })
    expect(core.encodeNative('ab')).toEqual([0, 1])
    expect(core.encodeNative('abc')).toEqual([0, 3])
    expect(core.countNative('ab')).toBe(2)
    const encoded = core.encodeNative('ab')
    encoded[0] = 999
    expect(core.encodeNative('ab')).toEqual([0, 1])
    core.setMergeCacheSize(1)
    expect(core.encodeNative('abc')).toEqual([0, 3])
    core.clearMergeCache()
    const lookup = Reflect.get(core, 'bytePairStringRankEncoder') as Map<
      string,
      number | number[]
    >
    expect([...lookup.entries()]).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
      ['bc', 3],
    ])
    core.setMergeCacheSize(0)
    expect(core.encodeNative('abc')).toEqual([0, 3])
    expect(lookup.size).toBe(4)
  })

  test('eviction and disable remove every merged lookup entry', () => {
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ['a', 'b', 'c'],
      tokenSplitRegex: /.+/gu,
      mergeCacheSize: 1,
    })
    const lookup = Reflect.get(core, 'bytePairStringRankEncoder') as Map<
      string,
      number | number[]
    >
    core.encodeNative('ab')
    core.encodeNative('ac')
    expect(lookup.has('ab')).toBe(false)
    expect(lookup.get('ac')).toEqual([0, 2])
    core.setMergeCacheSize(0)
    expect(lookup.has('ac')).toBe(false)
    expect(lookup.size).toBe(3)
  })
})

test('streams large inputs without changing encode or count results', () => {
  const core = new BytePairEncodingCore({
    bytePairRankDecoder: ['a', '😀', 'b', ' '],
    tokenSplitRegex: /./gu,
    mergeCacheSize: 0,
  })
  const repetitions = 262_145
  const text = 'a😀b '.repeat(repetitions)
  const encoded = core.encodeNative(text)
  expect(encoded).toHaveLength(repetitions * 4)
  expect(encoded.slice(0, 8)).toEqual([0, 1, 2, 3, 0, 1, 2, 3])
  expect(encoded.slice(-4)).toEqual([0, 1, 2, 3])
  expect(core.countNative(text)).toBe(repetitions * 4)
})

describe('FIFO ring cache lifecycle', () => {
  test('keeps insertion order through wrap, hits, shrink and growth', () => {
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ['a', 'b', 'c', 'd'],
      tokenSplitRegex: /.+/gu,
      mergeCacheSize: 2,
    })
    const cache = Reflect.get(core, 'mergeCache') as Map<string, number[]>
    for (const text of ['ab', 'ac', 'ad', 'ba', 'bc']) core.encodeNative(text)
    expect([...cache.keys()]).toEqual(['ba', 'bc'])
    core.encodeNative('ba')
    expect([...cache.keys()]).toEqual(['ba', 'bc'])
    core.setMergeCacheSize(1)
    expect([...cache.keys()]).toEqual(['bc'])
    core.setMergeCacheSize(3)
    for (const text of ['cd', 'ca', 'cb']) core.encodeNative(text)
    expect([...cache.keys()]).toEqual(['cd', 'ca', 'cb'])
    const lookup = Reflect.get(core, 'bytePairStringRankEncoder') as Map<
      string,
      number | number[]
    >
    expect(lookup.has('bc')).toBe(false)
    expect(lookup.size).toBe(7)
    expect(Reflect.get(core, 'mergeCacheKeys')).toHaveLength(3)
  })

  test('resets ring ownership across suspended generators, clear and disable', () => {
    const core = new BytePairEncodingCore({
      bytePairRankDecoder: ['a', 'b', 'c'],
      tokenSplitRegex: /[a-z]+/gu,
      mergeCacheSize: 2,
    })
    const generator = core.encodeNativeGenerator('ab ac ba bc')
    expect(generator.next().value).toEqual([0, 1])
    core.encodeNative('ca cb ab')
    core.clearMergeCache()
    core.setMergeCacheSize(0)
    core.setMergeCacheSize(1)
    expect([...generator]).toEqual([
      [0, 2],
      [1, 0],
      [1, 2],
    ])
    const cache = Reflect.get(core, 'mergeCache') as Map<string, number[]>
    expect([...cache.keys()]).toEqual(['bc'])
    expect(Reflect.get(core, 'mergeCacheKeys')).toEqual(['bc'])
    core.clearMergeCache()
    expect(Reflect.get(core, 'mergeCacheKeys')).toEqual([])
    expect(Reflect.get(core, 'mergeCacheHead')).toBe(0)
    core.encodeNative('ab ac')
    expect([...cache.keys()]).toEqual(['ac'])
  })
})

test('generator chunks cannot poison cached pieces through caller mutation', () => {
  const core = new BytePairEncodingCore({
    bytePairRankDecoder: ['a', 'b', 'c'],
    tokenSplitRegex: /[a-z]+/gu,
    mergeCacheSize: 2,
  })
  const text = 'ab ac'
  const expected = core.encodeNative(text)
  const generator = core.encodeNativeGenerator(text)
  const first = generator.next().value!
  if (!Array.isArray(first)) throw new Error('Expected a generator chunk')
  first[0] = 999
  for (const chunk of generator) chunk.push(999)
  expect(core.encodeNative(text)).toEqual(expected)
  expect(core.countNative(text)).toBe(expected.length)
  expect([...core.encodeNativeGenerator(text)].flat()).toEqual(expected)
  core.setMergeCacheSize(1)
  core.clearMergeCache()
  expect(core.encodeNative(text)).toEqual(expected)
  expect([...core.encodeNativeGenerator(text)].flat()).toEqual(expected)
})
