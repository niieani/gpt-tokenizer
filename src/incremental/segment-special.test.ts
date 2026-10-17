import { describe, expect, test } from 'vite-plus/test'
import cl100kBase from '../encoding/cl100k_base.js'
import o200k from '../encoding/o200k_base.js'
import { EndOfText } from '../specialTokens.js'
import { createIncrementalCounter } from './segment-special.js'

const ENCODINGS = [
  ['o200k_base', o200k],
  ['cl100k_base', cl100kBase],
] as const

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

interface Mirror {
  text: string
}

/**
 * Applies the same edit to a mirror string, the counter, and countTokens,
 * and asserts the counter agrees — including thrown errors. On a throw both
 * sides keep their previous state, mirroring countTokens's behavior.
 */
function applyAndExpect(
  counter: ReturnType<typeof createIncrementalCounter>,
  encoding: (typeof ENCODINGS)[number][1],
  mirror: Mirror,
  start: number,
  deleteCount: number,
  insert: string,
  encodeOptions?: { allowedSpecial?: Set<string> },
): void {
  const next =
    mirror.text.slice(0, start) +
    insert +
    mirror.text.slice(start + deleteCount)
  let expected: number | undefined
  let expectedError: string | undefined
  try {
    expected = encoding.countTokens(next, encodeOptions)
  } catch (error) {
    expectedError = errorMessage(error)
  }
  let actual: number | undefined
  let actualError: string | undefined
  try {
    actual = counter.applyEdit(start, deleteCount, insert)
  } catch (error) {
    actualError = errorMessage(error)
  }
  if (expectedError !== undefined || actualError !== undefined) {
    expect(actualError).toBe(expectedError)
    return
  }
  expect(actual).toBe(expected)
  expect(counter.count()).toBe(expected)
  mirror.text = next
}

function buildProse(length: number): string {
  const words = [
    'the',
    'quick',
    'brown',
    'fox',
    'jumps',
    'over',
    'a',
    'lazy',
    'dog',
    'hello',
    'world',
    'token',
    'counting',
    'with',
    'incremental',
    'segments',
  ]
  let text = ''
  let index = 0
  while (text.length < length) {
    text += words[index % words.length]!
    if ((index + 1) % 17 === 0) {
      text += '\n'
    } else {
      text += ' '
    }
    index++
  }
  return text.slice(0, length)
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('incremental token counter (segment-special)', () => {
  test.each(ENCODINGS)('%s: empty string', (_name, encoding) => {
    const counter = createIncrementalCounter(encoding)
    expect(counter.update('')).toBe(0)
    expect(counter.count()).toBe(0)
    expect(counter.applyEdit(0, 0, '')).toBe(0)
    expect(counter.count()).toBe(encoding.countTokens(''))
  })

  test.each(ENCODINGS)(
    '%s: ascii append, delete, middle substitution',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const mirror: Mirror = { text: 'Hello world' }
      expect(counter.update(mirror.text)).toBe(
        encoding.countTokens(mirror.text),
      )

      applyAndExpect(counter, encoding, mirror, mirror.text.length, 0, ' again')
      applyAndExpect(counter, encoding, mirror, 0, 5, 'Goodbye')
      applyAndExpect(counter, encoding, mirror, 6, 5, 'there')
      applyAndExpect(counter, encoding, mirror, 3, 4, '')
      applyAndExpect(counter, encoding, mirror, 0, 0, 'Well, ')
      expect(counter.count()).toBe(encoding.countTokens(mirror.text))
    },
  )

  test.each(ENCODINGS)(
    '%s: edits at index 0 and at the end',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const mirror: Mirror = { text: 'The first token matters.' }
      counter.update(mirror.text)

      applyAndExpect(counter, encoding, mirror, 0, 3, 'A')
      applyAndExpect(counter, encoding, mirror, 0, 0, '"')
      applyAndExpect(counter, encoding, mirror, 1, 1, 'h')
      applyAndExpect(
        counter,
        encoding,
        mirror,
        mirror.text.length,
        0,
        ' Indeed.',
      )
      applyAndExpect(counter, encoding, mirror, mirror.text.length - 2, 2, '!')
      applyAndExpect(
        counter,
        encoding,
        mirror,
        mirror.text.length,
        5,
        ' (past the end clamps)',
      )
      expect(counter.count()).toBe(encoding.countTokens(mirror.text))
    },
  )

  test.each(ENCODINGS)(
    '%s: emoji and CJK surrogate pairs',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const mirror: Mirror = { text: 'Hi 😀世界 bar 🎉🇺🇸 end' }
      counter.update(mirror.text)

      // Insert between two emoji (between surrogate pairs).
      applyAndExpect(counter, encoding, mirror, 4, 0, '😀')
      // Delete exactly one surrogate half, splitting a pair.
      applyAndExpect(counter, encoding, mirror, 3, 1, '')
      // Replace across a surrogate boundary.
      applyAndExpect(counter, encoding, mirror, 2, 3, '世')
      // Append and prepend CJK.
      applyAndExpect(
        counter,
        encoding,
        mirror,
        mirror.text.length,
        0,
        '日本語です',
      )
      applyAndExpect(counter, encoding, mirror, 0, 0, '始まり')
      // Delete a whole emoji.
      const emojiIndex = mirror.text.indexOf('😀')
      applyAndExpect(counter, encoding, mirror, emojiIndex, 2, '')
      expect(counter.count()).toBe(encoding.countTokens(mirror.text))
    },
  )

  test.each(ENCODINGS)(
    '%s: whitespace insertion and deletion (lookahead and $ branch)',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const mirror: Mirror = { text: 'word   tail' }
      counter.update(mirror.text)

      // Insert whitespace into a run: exercises \p{White_Space}+(?!\P{White_Space})
      // regrouping, where the last whitespace char joins the next piece.
      applyAndExpect(counter, encoding, mirror, 6, 0, '  ')
      applyAndExpect(counter, encoding, mirror, 5, 1, '')
      applyAndExpect(counter, encoding, mirror, 4, 2, '\n')
      applyAndExpect(counter, encoding, mirror, 4, 0, '\t')
      // The trailing $ branch (cl100k has \p{White_Space}+$): append after a
      // trailing whitespace run and destroy/recreate the end anchor.
      applyAndExpect(counter, encoding, mirror, mirror.text.length, 0, '   ')
      applyAndExpect(counter, encoding, mirror, mirror.text.length, 0, 'x')
      applyAndExpect(counter, encoding, mirror, mirror.text.length - 4, 4, '')
      applyAndExpect(counter, encoding, mirror, mirror.text.length, 0, '\n\n')
      applyAndExpect(counter, encoding, mirror, mirror.text.length - 2, 2, 'y')
      // Whitespace-run probes past an edit: o200k's \p{White_Space}*[\r\n]+ can
      // probe to the end of its whitespace run, so edits after the newline must
      // invalidate the run piece before it.
      const nlProbe: Mirror = { text: 'aaa  \n   bbb' }
      counter.update(nlProbe.text)
      applyAndExpect(counter, encoding, nlProbe, 8, 1, '')
      applyAndExpect(counter, encoding, nlProbe, 8, 0, '\n')
      applyAndExpect(counter, encoding, nlProbe, 6, 2, '')
      applyAndExpect(counter, encoding, nlProbe, 5, 1, 'x')
      expect(counter.count()).toBe(encoding.countTokens(nlProbe.text))
    },
  )

  test.each(ENCODINGS)(
    '%s: long stable prefix with small suffix edits',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const mirror: Mirror = { text: buildProse(6000) }
      expect(counter.update(mirror.text)).toBe(
        encoding.countTokens(mirror.text),
      )
      for (let i = 0; i < 20; i++) {
        applyAndExpect(
          counter,
          encoding,
          mirror,
          mirror.text.length - 10,
          10,
          ` suffix edit ${i} `,
        )
      }
      for (let i = 0; i < 10; i++) {
        applyAndExpect(
          counter,
          encoding,
          mirror,
          mirror.text.length,
          0,
          'more ',
        )
      }
      expect(counter.count()).toBe(encoding.countTokens(mirror.text))
    },
  )

  test.each(ENCODINGS)(
    '%s: long stable suffix with small prefix edits',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const mirror: Mirror = { text: buildProse(6000) }
      counter.update(mirror.text)
      for (let i = 0; i < 20; i++) {
        applyAndExpect(counter, encoding, mirror, 10, 8, `word${i}`)
      }
      applyAndExpect(counter, encoding, mirror, 0, 0, 'START ')
      applyAndExpect(counter, encoding, mirror, 0, 6, '')
      expect(counter.count()).toBe(encoding.countTokens(mirror.text))
    },
  )

  test.each(ENCODINGS)(
    '%s: full-text update replaces tracked text',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      counter.update(buildProse(2000))
      const next = buildProse(1500) + ' tail changes'
      expect(counter.update(next)).toBe(encoding.countTokens(next))
      expect(counter.count()).toBe(encoding.countTokens(next))
      const shorter = 'tiny'
      expect(counter.update(shorter)).toBe(encoding.countTokens(shorter))
      expect(counter.update('')).toBe(0)
    },
  )

  test.each(ENCODINGS)('%s: reset clears tracked text', (_name, encoding) => {
    const counter = createIncrementalCounter(encoding)
    counter.update(buildProse(500))
    counter.reset()
    expect(counter.count()).toBe(0)
    expect(counter.count()).toBe(encoding.countTokens(''))
    const mirror: Mirror = { text: 'fresh start' }
    expect(counter.update(mirror.text)).toBe(encoding.countTokens(mirror.text))
    applyAndExpect(counter, encoding, mirror, 0, 5, 'quick')
  })

  test.each(ENCODINGS)(
    '%s: default special-token policy matches countTokens including errors',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const mirror: Mirror = { text: 'plain user text' }
      counter.update(mirror.text)

      // update() with a disallowed special throws identically.
      let expectedError: string | undefined
      try {
        encoding.countTokens(`a${EndOfText}b`)
      } catch (error) {
        expectedError = errorMessage(error)
      }
      expect(expectedError).toBeDefined()
      let actualError: string | undefined
      try {
        counter.update(`a${EndOfText}b`)
      } catch (error) {
        actualError = errorMessage(error)
      }
      expect(actualError).toBe(expectedError)

      // applyEdit() that would introduce one throws identically and keeps state.
      actualError = undefined
      try {
        counter.applyEdit(5, 0, EndOfText)
      } catch (error) {
        actualError = errorMessage(error)
      }
      expect(actualError).toBe(expectedError)
      expect(counter.count()).toBe(encoding.countTokens(mirror.text))

      // Building one by deleting the gap between fragments also throws.
      counter.update(`<|endoftext${'GAP'}|>rest`)
      try {
        // 'GAP' sits at index 11, right after '<|endoftext'.
        counter.applyEdit(11, 3, '')
      } catch (error) {
        actualError = errorMessage(error)
      }
      expect(actualError).toBe(expectedError)
      // Counter still usable afterwards (still tracking the GAP text).
      const gapMirror: Mirror = { text: `<|endoftext${'GAP'}|>rest` }
      applyAndExpect(counter, encoding, gapMirror, 0, 0, 'still ')
    },
  )

  test.each(ENCODINGS)(
    '%s: allowed specials opt-in with edits around them',
    (_name, encoding) => {
      const allowedSpecial = new Set([EndOfText])
      const options = { allowedSpecial }
      const counter = createIncrementalCounter(encoding, { allowedSpecial })
      const mirror: Mirror = {
        text: `Intro text. ${EndOfText} After the special, user text goes here.`,
      }
      expect(counter.update(mirror.text)).toBe(
        encoding.countTokens(mirror.text, options),
      )

      // Edit only the user text after the special.
      const afterSpecial = mirror.text.indexOf(EndOfText) + EndOfText.length
      applyAndExpect(
        counter,
        encoding,
        mirror,
        afterSpecial + 1,
        4,
        'USER',
        options,
      )
      // Append at the very end (far from the special).
      applyAndExpect(
        counter,
        encoding,
        mirror,
        mirror.text.length,
        0,
        ' tail',
        options,
      )
      // Insert another special mid-text.
      applyAndExpect(
        counter,
        encoding,
        mirror,
        afterSpecial + 10,
        0,
        EndOfText,
        options,
      )
      // Delete an entire special.
      const first = mirror.text.indexOf(EndOfText)
      applyAndExpect(
        counter,
        encoding,
        mirror,
        first,
        EndOfText.length,
        '',
        options,
      )
      // Delete part of a special (the rest becomes plain text).
      const second = mirror.text.indexOf(EndOfText)
      applyAndExpect(counter, encoding, mirror, second + 3, 4, '', options)
      // Insert text strictly inside a special, splitting it.
      const third = mirror.text.indexOf('<|endoftext')
      if (third >= 0) {
        applyAndExpect(counter, encoding, mirror, third + 4, 0, 'X', options)
      }
      // Create a special by deleting the gap between fragments.
      // 'A' is at 0, '<|endoftext' spans 1..11, 'GAPGAP' starts at 12.
      const gap: Mirror = { text: `A<|endoftext${'GAPGAP'}|>B` }
      expect(counter.update(gap.text)).toBe(
        encoding.countTokens(gap.text, options),
      )
      applyAndExpect(counter, encoding, gap, 12, 6, '', options)
      // Create a special by inserting its completion.
      const partial: Mirror = { text: 'x<|endoftext y' }
      counter.update(partial.text)
      applyAndExpect(counter, encoding, partial, 11, 0, '|>', options)
      // Replace across a special with a longer plain text.
      const across: Mirror = { text: `before${EndOfText}after` }
      counter.update(across.text)
      applyAndExpect(
        counter,
        encoding,
        across,
        4,
        across.text.length - 8,
        'plain bridge ',
        options,
      )
      expect(counter.count()).toBe(encoding.countTokens(across.text, options))
    },
  )

  test.each(ENCODINGS)(
    '%s: 200 seeded random edits match countTokens',
    (_name, encoding) => {
      const counter = createIncrementalCounter(encoding)
      const rng = mulberry32(0xc0ffee + (_name === 'o200k_base' ? 1 : 2))
      const words = [
        'alpha',
        'beta',
        'gamma',
        'delta',
        'token',
        'count',
        'merge',
        'cache',
        'value',
        'test',
      ]
      const exotic = [
        '😀',
        '🎉',
        '世界',
        '日本語',
        'こんにちは',
        'naïve',
        '𝄞',
        '🇺🇸',
        '中文',
      ]
      const whitespace = [
        ' ',
        '  ',
        '   ',
        '\t',
        '\n',
        '\n\n',
        '\r\n',
        '  \n',
        '\u00a0',
        '\u2028',
        '  \r\n  ',
      ]
      const pick = <T>(items: readonly T[]): T =>
        items[Math.floor(rng() * items.length)]!
      const randomFragment = (): string => {
        const roll = rng()
        if (roll < 0.5) {
          return pick(words) + (rng() < 0.85 ? ' ' : '')
        }
        if (roll < 0.65) {
          return pick(exotic)
        }
        if (roll < 0.8) {
          return pick(whitespace)
        }
        if (roll < 0.92) {
          return `'${pick(['s', 't', 're', 've', 'll', 'd'])}`
        }
        if (roll < 0.97) {
          return rng() < 0.5 ? '<|e' : '<|'
        }
        // Occasionally a real special token: must throw identically.
        return EndOfText
      }

      let base = ''
      while (base.length < 4000) {
        base += randomFragment()
      }
      base = `${base.split(EndOfText).join('')}\n   `

      const mirror: Mirror = { text: base }
      expect(counter.update(mirror.text)).toBe(
        encoding.countTokens(mirror.text),
      )

      for (let i = 0; i < 200; i++) {
        const start = Math.floor(rng() * (mirror.text.length + 1))
        const roll = rng()
        if (roll < 0.4) {
          applyAndExpect(counter, encoding, mirror, start, 0, randomFragment())
        } else if (roll < 0.7) {
          applyAndExpect(
            counter,
            encoding,
            mirror,
            start,
            1 + Math.floor(rng() * 12),
            '',
          )
        } else {
          applyAndExpect(
            counter,
            encoding,
            mirror,
            start,
            1 + Math.floor(rng() * 8),
            randomFragment(),
          )
        }
      }
      expect(counter.count()).toBe(encoding.countTokens(mirror.text))
    },
  )
})
