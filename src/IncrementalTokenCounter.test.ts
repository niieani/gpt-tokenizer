import { describe, expect, test } from 'vite-plus/test'
import { BytePairEncodingCore } from './BytePairEncodingCore.js'
import { DEFAULT_MERGE_CACHE_SIZE } from './constants.js'
import cl100k from './encoding/cl100k_base.js'
import gpt2 from './encoding/gpt2.js'
import harmony from './encoding/o200k_harmony.js'
import o200k, { createIncrementalCounter } from './encoding/o200k_base.js'
import p50k from './encoding/p50k_base.js'
import p50kEdit from './encoding/p50k_edit.js'
import r50k from './encoding/r50k_base.js'
import type { EncodeOptions } from './GptEncoding.js'
import { createCounter } from './IncrementalTokenCounter.js'
import { EndOfPrompt, EndOfText } from './specialTokens.js'

const encodings = { cl100k, o200k, harmony, r50k, p50k, p50kEdit, gpt2 }
const policies: [string, EncodeOptions | undefined][] = [
  ['default', undefined],
  ['all allowed', { allowedSpecial: 'all' }],
  ['ordinary special text', { disallowedSpecial: new Set() }],
  ['one allowed', { allowedSpecial: new Set([EndOfText]) }],
  [
    'explicit exclusions',
    {
      allowedSpecial: 'all',
      disallowedSpecial: new Set([EndOfText]),
    },
  ],
]

function result(fn: () => number): number | string {
  try {
    return fn()
  } catch (error) {
    if (!(error instanceof Error)) throw error
    return error.message
  }
}

describe.each(Object.entries(encodings))(
  '%s incremental counting',
  (_, encoding) => {
    test('append, replacement, deletion, update and reset', () => {
      const counter = encoding.createIncrementalCounter()
      expect(counter.count()).toBe(0)
      let text = 'Hello world'
      expect(counter.update(text)).toBe(encoding.countTokens(text))
      text += '!'
      expect(counter.append('!')).toBe(encoding.countTokens(text))
      text = 'Hello everyone!'
      expect(counter.applyEdit(6, 5, 'everyone')).toBe(
        encoding.countTokens(text),
      )
      text = 'everyone!'
      expect(counter.applyEdit(0, 6, '')).toBe(encoding.countTokens(text))
      expect(counter.update(text)).toBe(encoding.countTokens(text))
      expect(counter.applyEdit(text.length, 0, '')).toBe(counter.count())
      counter.reset()
      expect(counter.count()).toBe(0)
      expect(counter.append('again')).toBe(encoding.countTokens('again'))
      expect(counter.update('')).toBe(0)
    })

    test('every append boundary, including split surrogates and special tokens', () => {
      const samples = [
        "We're I'VE I'll 're 'v 'll fooBarBAZ ",
        'word   \r\n\n    next\t\tlast\n  ',
        '\u0085\u00a0\ufeff𠮷😀👩🏽‍💻 café e\u0301 中文 שלום',
        `left ${EndOfText} right ${EndOfPrompt}`,
        'ABC'.repeat(100) + ' next',
        ' '.repeat(100) + '\nnext',
      ]
      for (const sample of samples) {
        for (let split = 0; split <= sample.length; split++) {
          const counter = encoding.createIncrementalCounter({
            allowedSpecial: 'all',
          })
          counter.update(sample.slice(0, split))
          expect(
            counter.append(sample.slice(split)),
            JSON.stringify({ sample, split }),
          ).toBe(encoding.countTokens(sample, { allowedSpecial: 'all' }))
        }
      }
    })

    test.each(policies)('seeded edits match countTokens: %s', (_, options) => {
      const counter = encoding.createIncrementalCounter(options)
      let text =
        'Stable prefix with several words.\n'.repeat(30) +
        "I'v   \nABCdef 123456 中文 😀 tail"
      counter.update(text)
      let seed = 0x12345678
      const random = (limit: number) => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return seed % limit
      }
      const fragments = [
        '',
        ' ',
        '\n',
        '\r\n',
        '\t',
        'word',
        'ABCdef',
        "'",
        've',
        'll',
        '1234567',
        '中文',
        '😀',
        '\ud83d',
        '\ude00',
        '\u0085',
        '\ufeff',
        EndOfText,
        '<|endof',
        'text|>',
        EndOfPrompt,
      ]
      for (let i = 0; i < 400; i++) {
        const start = random(text.length + 1)
        const removed = random(Math.min(15, text.length - start) + 1)
        const inserted = fragments[random(fragments.length)]!
        const next =
          text.slice(0, start) + inserted + text.slice(start + removed)
        const expected = result(() => encoding.countTokens(next, options))
        const actual = result(() =>
          i % 3 === 0
            ? counter.update(next)
            : counter.applyEdit(start, removed, inserted),
        )
        expect(actual, JSON.stringify({ i, start, removed, inserted })).toBe(
          expected,
        )
        if (typeof expected === 'number') text = next
        expect(counter.count()).toBe(encoding.countTokens(text, options))
      }
    })

    test('creating and destroying specials across edit seams', () => {
      const counter = encoding.createIncrementalCounter({
        allowedSpecial: 'all',
      })
      for (let split = 0; split <= EndOfText.length; split++) {
        const left = EndOfText.slice(0, split)
        const right = EndOfText.slice(split)
        const before = `a long stable prefix with words ${left}X${right} suffix words`
        counter.update(before)
        const position = before.indexOf('X')
        const next = before.slice(0, position) + before.slice(position + 1)
        expect(counter.applyEdit(position, 1, '')).toBe(
          encoding.countTokens(next, { allowedSpecial: 'all' }),
        )
        expect(counter.applyEdit(position, 0, 'X')).toBe(
          encoding.countTokens(before, { allowedSpecial: 'all' }),
        )
      }
    })
  },
)

test('named export is bound and counters are independent', () => {
  const first = createIncrementalCounter()
  const second = createIncrementalCounter()
  first.append('hello')
  second.append('world')
  first.reset()
  expect(second.count()).toBe(o200k.countTokens('world'))
})

test('rejects invalid ranges without changing state', () => {
  const counter = createIncrementalCounter()
  counter.update('hello')
  for (const [start, removed] of [
    [-1, 0],
    [0, -1],
    [6, 0],
    [4, 2],
    [0.5, 0],
    [0, 0.5],
    [NaN, 0],
    [0, Infinity],
    [Number.MAX_SAFE_INTEGER + 1, 0],
  ]) {
    expect(() => counter.applyEdit(start!, removed!, 'x')).toThrow(RangeError)
    expect(counter.count()).toBe(o200k.countTokens('hello'))
  }
  expect(counter.append(' world')).toBe(o200k.countTokens('hello world'))
})

test('snapshots policy sets and rejects conflicting options', () => {
  const allowedSpecial = new Set([EndOfText])
  const counter = createIncrementalCounter({ allowedSpecial })
  allowedSpecial.clear()
  expect(counter.append(EndOfText)).toBe(1)
  const disallowedSpecial = new Set<string>()
  const ordinary = createIncrementalCounter({ disallowedSpecial })
  disallowedSpecial.add('all')
  expect(ordinary.append(EndOfText)).toBe(
    o200k.countTokens(EndOfText, { disallowedSpecial: new Set() }),
  )
  expect(() =>
    createIncrementalCounter({
      allowedSpecial: 'all',
      disallowedSpecial: 'all',
    }),
  ).toThrow('allowedSpecial and disallowedSpecial cannot both be set to "all".')
})

test('a rejected edit preserves both text and boundaries', () => {
  const counter = createIncrementalCounter()
  const original = 'stable words before <|endofXtext|> after'
  counter.update(original)
  const position = original.indexOf('X')
  expect(() => counter.applyEdit(position, 1, '')).toThrow(
    `Disallowed special token found: ${EndOfText}`,
  )
  expect(counter.count()).toBe(o200k.countTokens(original))
  expect(() => counter.update(EndOfText)).toThrow()
  expect(counter.append(' next')).toBe(o200k.countTokens(original + ' next'))
})

test('large replacements do not exceed the JavaScript argument limit', () => {
  const counter = createIncrementalCounter()
  const large = 'a b '.repeat(70_000)
  expect(counter.update(large)).toBe(o200k.countTokens(large))
  expect(counter.update('small')).toBe(o200k.countTokens('small'))
})

test.each(Object.entries(encodings))(
  '%s edits around regex boundaries',
  (_, encoding) => {
    const prefix = 'unchanged prefix words '.repeat(4)
    const samples = [
      "word 'v 'll I'VE ABCdef",
      'word     \n\n    next',
      'word\r\n\t  ',
      'word///\n123456789 next',
      'word 😀中文\u0085\ufeff next',
    ]
    for (const sample of samples) {
      const original = prefix + sample + ' unchanged suffix words'
      for (let at = 0; at <= sample.length; at++) {
        for (const insert of ['', 'x', ' ', '\n', "'ve", '\ud83d']) {
          for (const removed of [0, Math.min(3, sample.length - at)]) {
            const counter = encoding.createIncrementalCounter()
            counter.update(original)
            const start = prefix.length + at
            const next =
              original.slice(0, start) +
              insert +
              original.slice(start + removed)
            expect(
              counter.applyEdit(start, removed, insert),
              JSON.stringify({ sample, at, insert, removed }),
            ).toBe(encoding.countTokens(next))
          }
        }
      }
    }
  },
)

test('interleaves counters, generators and merge-cache changes', () => {
  const first = createIncrementalCounter()
  const second = createIncrementalCounter({ allowedSpecial: 'all' })
  const text = 'words with 😀 and Unicode16 \u{1c89}\u{10d50} suffix'
  const expected = o200k.encode(text)
  const generator = o200k.encodeGenerator(text)
  const head = generator.next().value!
  first.update(text)
  second.update(EndOfText)
  o200k.clearMergeCache()
  o200k.setMergeCacheSize(0)
  try {
    expect(first.append(' next')).toBe(o200k.countTokens(text + ' next'))
    expect(second.append(text)).toBe(
      o200k.countTokens(EndOfText + text, { allowedSpecial: 'all' }),
    )
    expect([head, ...generator].flat()).toEqual(expected)
  } finally {
    o200k.setMergeCacheSize(DEFAULT_MERGE_CACHE_SIZE)
    o200k.clearMergeCache()
  }
})

test('custom patterns conservatively rebuild, including lookbehind', () => {
  const core = new BytePairEncodingCore({
    bytePairRankDecoder: [
      ...Array.from({ length: 128 }, (_, i) => String.fromCharCode(i)),
      'bb',
    ],
    tokenSplitRegex: /(?<=a)bb|./gu,
  })
  const counter = core.createIncrementalCounter(undefined, () => {})
  for (const text of ['abb abb', 'acb abb', 'abb acb', '', 'abb']) {
    expect(counter.update(text)).toBe(core.countNative(text))
  }
})

test('reuses both sides of an edit and bounds the number of recounted pieces', () => {
  let visits = 0
  const counter = createCounter({
    *scan(text, start) {
      for (const match of text.slice(start).matchAll(/ ?[a-z]+/g)) {
        visits++
        yield { end: start + match.index + match[0].length, count: 1 }
      }
    },
    canRestart: () => true,
    validate: () => {},
    restartMargin: 0,
    canReuseSuffix: true,
  })
  const original = 'word '.repeat(10_000).trimEnd()
  expect(counter.update(original)).toBe(10_000)
  visits = 0
  expect(counter.applyEdit(25_000, 4, 'longer')).toBe(10_000)
  expect(visits).toBeLessThan(5)
  visits = 0
  expect(counter.append(' tail')).toBe(10_001)
  expect(visits).toBeLessThan(5)
})
