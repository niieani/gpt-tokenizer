/* eslint-disable unicorn/prefer-spread */
/* eslint-disable unicorn/prefer-code-point */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import bpeRanksData from '../data/bpeRanks.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import encoderData from '../data/encoder.json'
import {
  dictZip,
  getCharCode,
  getCharFromCode,
  getPairs,
  range,
  splitToken,
} from './utils'

const encoder: Record<string, number> = encoderData
const bpeRanks: Record<string, number> = bpeRanksData

const decoder: Record<number, string> = dictZip(
  Object.values(encoder),
  Object.keys(encoder),
)

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

// eslint-disable-next-line no-magic-numbers
const UPPER_BYTE_VALUE = 2 ** 8

function createByteToUnicodeMap(): Map<number, string> {
  const asciiRange = range(getCharCode('!'), getCharCode('~') + 1)
  const latin1Range1 = range(getCharCode('¡'), getCharCode('¬') + 1)
  const latin1Range2 = range(getCharCode('®'), getCharCode('ÿ') + 1)

  const initialCodePoints = [...asciiRange, ...latin1Range1, ...latin1Range2]
  const mappedCodePoints = [...initialCodePoints]

  let newCodePointOffset = 0
  for (let byteValue = 0; byteValue < UPPER_BYTE_VALUE; byteValue++) {
    if (!initialCodePoints.includes(byteValue)) {
      initialCodePoints.push(byteValue)
      mappedCodePoints.push(UPPER_BYTE_VALUE + newCodePointOffset)
      newCodePointOffset += 1
    }
  }

  const unicodeChars = mappedCodePoints.map(getCharFromCode)
  return new Map(initialCodePoints.map((x, i) => [x, unicodeChars[i]!]))
}

const pat =
  /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu

const byteEncoder = createByteToUnicodeMap()
const byteDecoder: Map<string, number> = new Map(
  [...byteEncoder].map(([k, v]) => [v, k]),
)

function bpe(token: string, cache: Map<string, string> = new Map()): string {
  if (cache.has(token)) {
    return cache.get(token)!
  }

  let word = splitToken(token)
  let pairs = getPairs(word)

  if (pairs.length === 0) {
    return token
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const minPairs: Map<number, [string, string]> = new Map()
    pairs.forEach((pair) => {
      const rank = bpeRanks[pair.join(',')]
      minPairs.set(
        // eslint-disable-next-line no-magic-numbers
        typeof rank === 'undefined' || Number.isNaN(rank) ? 10e10 : rank,
        pair,
      )
    })
    const keys = [...minPairs.keys()]

    const bigram = minPairs.get(Math.min(...keys))

    if (!bigram || !(bigram.join(',') in bpeRanks)) {
      break
    }

    const [first, second] = bigram
    let newWord: string[] = []
    let i = 0

    while (i < word.length) {
      const j = word.indexOf(first, i)
      if (j === -1) {
        newWord = newWord.concat(word.slice(i))
        break
      }
      newWord = newWord.concat(word.slice(i, j))
      i = j

      if (word[i] === first && i < word.length - 1 && word[i + 1] === second) {
        newWord.push(first + second)
        i += 2
      } else {
        newWord.push(word[i]!)
        i += 1
      }
    }

    word = newWord
    if (word.length === 1) {
      break
    } else {
      pairs = getPairs(word)
    }
  }

  const result = word.join(' ')
  cache.set(token, result)

  return result
}

function* encodeGenerator(
  text: string,
  cache: Map<string, string> = new Map(),
): Generator<number[], void, undefined> {
  for (let [token] of text.matchAll(pat)) {
    token = [...textEncoder.encode(token)]
      .map((x) => byteEncoder.get(x) ?? '')
      .join('')

    const newTokens = bpe(token, cache)
      .split(' ')
      .map((x) => encoder[x]!)

    yield newTokens
  }
}

/**
 * @returns {false | number} false if token limit is exceeded, otherwise the number of tokens
 */
export function isWithinTokenLimit(
  text: string,
  tokenLimit: number,
  cache: Map<string, string> = new Map(),
): false | number {
  const tokenGenerator = encodeGenerator(text, cache)
  let count = 0
  for (const tokens of tokenGenerator) {
    count += tokens.length
    if (count > tokenLimit) {
      return false
    }
  }
  return count
}

export function encode(
  text: string,
  cache: Map<string, string> = new Map(),
): number[] {
  return [...encodeGenerator(text, cache)].flat(1)
}

export function decodeToken(token: number): string {
  const decodedToken = decoder[token]
  if (typeof decodedToken === 'undefined') {
    return ''
  }
  const decodedBytes = splitToken(decodedToken).map((x) => byteDecoder.get(x)!)
  return textDecoder.decode(new Uint8Array(decodedBytes), {
    stream: true,
  })
}

const HIGH_SURROGATE_START = 55_296
const HIGH_SURROGATE_END = 56_319
export function endsWithIncompleteUtfPairSurrogate(string: string): boolean {
  if (string.length === 0) return false
  // Check if the last character is a high surrogate
  const lastCharCode = string.charCodeAt(string.length - 1)
  return (
    lastCharCode >= HIGH_SURROGATE_START && lastCharCode <= HIGH_SURROGATE_END
  )
}

export function* decodeGenerator(
  tokens: Iterable<number>,
): Generator<string, void, undefined> {
  let buffer = ''

  for (const token of tokens) {
    buffer += decodeToken(token)

    if (buffer.length === 0 || endsWithIncompleteUtfPairSurrogate(buffer)) {
      // Keep the high surrogate in the buffer and continue with the next token
      // eslint-disable-next-line no-continue
      continue
    } else {
      yield buffer
      // reset buffer
      buffer = ''
    }
  }

  // Yield any remaining characters in the buffer
  if (buffer.length > 0) {
    yield buffer
  }
}

/**
 * Decode tokens asynchronously and yield the decoded strings, one by one.
 * Will not yield for tokens that include a high surrogate, but wait for the next token.
 * @param {AsyncIterable<number>} tokens
 * @returns {AsyncGenerator<string, void, undefined>}
 */
export async function* decodeAsyncGenerator(
  tokens: AsyncIterable<number>,
): AsyncGenerator<string, void, undefined> {
  let buffer = ''

  for await (const token of tokens) {
    buffer += decodeToken(token)

    if (buffer.length === 0 || endsWithIncompleteUtfPairSurrogate(buffer)) {
      // Keep the high surrogate in the buffer and continue with the next token
      // eslint-disable-next-line no-continue
      continue
    } else {
      yield buffer
      // reset buffer
      buffer = ''
    }
  }

  // Yield any remaining characters in the buffer
  if (buffer.length > 0) {
    yield buffer
  }
}

export function decode(tokens: number[]): string {
  return [...decodeGenerator(tokens)].join('')
}
