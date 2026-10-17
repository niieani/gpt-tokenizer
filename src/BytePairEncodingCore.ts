import { DEFAULT_MERGE_CACHE_SIZE } from './constants.js'
import {
  compareUint8Arrays,
  isAscii,
  startsWithByteOrderMark,
  tryConvertToString,
} from './utfUtil.js'
import { escapeRegExp } from './util.js'

export type RawBytePairRanks = readonly (string | readonly number[])[]

export interface BytePairEncodingConfig {
  bytePairRankDecoder: RawBytePairRanks
  specialTokensEncoder?: Map<string, number>
  tokenSplitRegex: RegExp
  /**
   * LRU cache for merged tokens pairs.
   * Increasing this value should make encoding similar strings faster,
   * but will consume more memory.
   * @default 100000
   */
  mergeCacheSize?: number
}

const emptyBuffer = new Uint8Array(0)

// `ignoreBOM: true` keeps a leading U+FEFF in the decoded output.
export const decoder = new TextDecoder('utf8', { ignoreBOM: true })

export class BytePairEncodingCore {
  readonly mergeableBytePairRankCount: number
  /**
   * an array where the index is the BPE rank,
   * and the value is the string or the array of bytes that it decodes to
   * it may contain holes if token is unused
   */
  private bytePairRankDecoder: RawBytePairRanks
  private bytePairNonUtfRankDecoder = new Map<number, Uint8Array>()
  private bytePairNonUtfSortedEncoder: readonly [Uint8Array, number][]
  /**
   * a reverse map of the bytePairRankDecoder,
   * where the key is the string and the value is the rank
   * values that cannot be represented as a string are present in `bytePairNonUtfSortedEncoder`
   */
  private bytePairStringRankEncoder: Map<string, number>
  private tokenSplitRegex: RegExp
  private specialTokensEncoder: Map<string, number>
  private specialTokensDecoder: Map<number, string>
  private specialTokenPatternRegex: RegExp
  private textEncoder = new TextEncoder()
  private mergeCache?: Map<string, number[]>
  private mergeCacheSize: number

  constructor({
    bytePairRankDecoder,
    specialTokensEncoder,
    tokenSplitRegex,
    mergeCacheSize = DEFAULT_MERGE_CACHE_SIZE,
  }: BytePairEncodingConfig) {
    this.bytePairRankDecoder = bytePairRankDecoder
    this.bytePairStringRankEncoder = new Map<string, number>()
    this.mergeCacheSize = mergeCacheSize
    if (mergeCacheSize > 0) {
      this.mergeCache = new Map()
    }

    // size without array holes (which may be present in the encoder)
    this.mergeableBytePairRankCount = Object.keys(bytePairRankDecoder).length
    const binaryLookup: [Uint8Array, number][] = []
    // forEach skips array holes:
    bytePairRankDecoder.forEach((value, rank) => {
      if (typeof value === 'string') {
        this.bytePairStringRankEncoder.set(value, rank)
        return
      }
      const byteArray = new Uint8Array(value)
      binaryLookup.push([byteArray, rank])
      this.bytePairNonUtfRankDecoder.set(rank, byteArray)
      if (startsWithByteOrderMark(byteArray)) {
        // The rank tables keep tokens that start with a UTF-8 byte order mark
        // (EF BB BF) as raw bytes, because a plain decode would strip the mark.
        // They are still valid UTF-8, so they must also be reachable through
        // the string lookup that getBpeRankFromBytes uses for valid UTF-8.
        const asString = tryConvertToString(byteArray)
        if (asString !== undefined) {
          this.bytePairStringRankEncoder.set(asString, rank)
        }
      }
    })
    this.bytePairNonUtfSortedEncoder = binaryLookup.sort((a, b) =>
      compareUint8Arrays(a[0], b[0]),
    )
    this.specialTokensEncoder =
      specialTokensEncoder ?? new Map<string, number>()
    this.specialTokensDecoder = specialTokensEncoder
      ? new Map([...specialTokensEncoder].map(([key, value]) => [value, key]))
      : new Map<number, string>()
    this.tokenSplitRegex = tokenSplitRegex

    const escapedSpecialTokens = [...this.specialTokensEncoder.keys()].map(
      escapeRegExp,
    )
    const allSpecialTokensRegex = escapedSpecialTokens.join('|')
    try {
      this.specialTokenPatternRegex = new RegExp(allSpecialTokensRegex, 'g')
    } catch {
      throw new Error('Invalid regular expression pattern.')
    }
  }

  setMergeCacheSize(newSize: number): void {
    if (this.mergeCacheSize === 0 && newSize > 0) {
      this.mergeCache = new Map()
    }
    this.mergeCacheSize = newSize
    if (newSize === 0) {
      this.mergeCache = undefined
    }
  }

  /**
   * Additive helper for incremental token counting: returns the token-split
   * regex used by encodeNative/countNative. Callers must not mutate it;
   * String.prototype.matchAll clones the regex internally, so sharing it is safe.
   */
  getTokenSplitRegex(): RegExp {
    return this.tokenSplitRegex
  }

  /**
   * Additive helper for incremental token counting: returns the special tokens
   * configured for this encoding, in the order used to build the internal
   * special-token scan regex.
   */
  getSpecialTokens(): readonly string[] {
    return [...this.specialTokensEncoder.keys()]
  }

  /**
   * Additive helper for incremental token counting: finds the next allowed
   * special token at or after `startIndex`, mirroring the private scan used by
   * encodeNative/countNative. Returns `[startIndex, token]` or undefined.
   */
  findNextAllowedSpecialToken(
    text: string,
    allowedSpecial: Set<string> | undefined,
    startIndex: number,
  ): [startIndex: number, token: string] | undefined {
    return this.findNextSpecialToken(text, allowedSpecial, startIndex)
  }

  /**
   * Additive helper for incremental token counting: counts the tokens of a
   * single token-split piece exactly like the per-piece loop in countNative.
   */
  countSplitPiece(piece: string): number {
    const token = this.getBpeRankFromString(piece)
    if (token !== undefined) {
      return 1
    }
    return this.bytePairEncode(piece).length
  }

  clearMergeCache(): void {
    this.mergeCache?.clear()
  }

  *encodeNativeGenerator(
    text: string,
    allowedSpecial?: Set<string>,
  ): Generator<number[], number, undefined> {
    let startIndex = 0
    let lastTokenLength = 0

    while (true) {
      const nextSpecialMatch = this.findNextSpecialToken(
        text,
        allowedSpecial,
        startIndex,
      )
      const nextSpecialStartIndex = nextSpecialMatch?.[0]

      const endIndex = nextSpecialStartIndex ?? text.length

      const textBeforeSpecial =
        startIndex === 0 && endIndex === text.length
          ? text
          : text.slice(startIndex, endIndex)

      for (const [match] of textBeforeSpecial.matchAll(this.tokenSplitRegex)) {
        const token = this.getBpeRankFromString(match)
        if (token !== undefined) {
          lastTokenLength = 1
          yield [token]

          continue
        }

        const tokens = this.bytePairEncode(match)
        lastTokenLength = tokens.length
        yield tokens
      }

      if (nextSpecialStartIndex !== undefined) {
        const specialToken = nextSpecialMatch![1]
        const specialTokenValue = this.specialTokensEncoder.get(specialToken)
        if (specialTokenValue === undefined) {
          throw new Error(
            `Special token "${specialToken}" is not in the special token encoder.`,
          )
        }
        yield [specialTokenValue]
        startIndex = nextSpecialStartIndex + specialToken.length
        lastTokenLength = 1
      } else {
        break
      }
    }

    return lastTokenLength
  }

  encodeNative(text: string, allowedSpecial?: Set<string>): number[] {
    let startIndex = 0
    const tokensArray: number[] = [] // Flat list to collect the tokens

    while (true) {
      const nextSpecialMatch = this.findNextSpecialToken(
        text,
        allowedSpecial,
        startIndex,
      )
      const nextSpecialStartIndex = nextSpecialMatch?.[0]

      const endIndex = nextSpecialStartIndex ?? text.length

      const textBeforeSpecial =
        startIndex === 0 && endIndex === text.length
          ? text
          : text.slice(startIndex, endIndex)

      for (const [match] of textBeforeSpecial.matchAll(this.tokenSplitRegex)) {
        const token = this.getBpeRankFromString(match)
        if (token !== undefined) {
          tokensArray.push(token)

          continue
        }

        const tokens = this.bytePairEncode(match)
        tokensArray.push(...tokens)
      }

      if (nextSpecialStartIndex !== undefined) {
        const specialToken = nextSpecialMatch![1]
        const specialTokenValue = this.specialTokensEncoder.get(specialToken)
        if (specialTokenValue === undefined) {
          throw new Error(
            `Special token "${specialToken}" is not in the special token encoder.`,
          )
        }
        tokensArray.push(specialTokenValue)
        startIndex = nextSpecialStartIndex + specialToken.length
      } else {
        break
      }
    }

    return tokensArray
  }

  countNative(text: string, allowedSpecial?: Set<string>): number {
    let startIndex = 0
    let tokensCount = 0

    while (true) {
      const nextSpecialMatch = this.findNextSpecialToken(
        text,
        allowedSpecial,
        startIndex,
      )
      const nextSpecialStartIndex = nextSpecialMatch?.[0]

      const endIndex = nextSpecialStartIndex ?? text.length

      const textBeforeSpecial =
        startIndex === 0 && endIndex === text.length
          ? text
          : text.slice(startIndex, endIndex)

      for (const [match] of textBeforeSpecial.matchAll(this.tokenSplitRegex)) {
        const token = this.getBpeRankFromString(match)
        if (token !== undefined) {
          tokensCount++

          continue
        }

        const tokens = this.bytePairEncode(match)
        tokensCount += tokens.length
      }

      if (nextSpecialStartIndex !== undefined) {
        const specialToken = nextSpecialMatch![1]
        const specialTokenValue = this.specialTokensEncoder.get(specialToken)
        if (specialTokenValue === undefined) {
          throw new Error(
            `Special token "${specialToken}" is not in the special token encoder.`,
          )
        }
        tokensCount++
        startIndex = nextSpecialStartIndex + specialToken.length
      } else {
        break
      }
    }

    return tokensCount
  }

  *decodeNativeGenerator(
    tokens: Iterable<number>,
  ): Generator<Uint8Array | string, void, void> {
    for (const token of tokens) {
      const tokenBytes = this.tryDecodeToken(token)
      if (tokenBytes) {
        yield tokenBytes
      }
    }
  }

  decodeNative(tokens: Iterable<number>): string {
    let decoded = ''
    let intBuffer = emptyBuffer

    for (const token of tokens) {
      const tokenBytes = this.tryDecodeToken(token)
      if (tokenBytes === undefined) {
        throw new Error(`Token ${token} is not in the byte pair encoder.`)
      }
      if (typeof tokenBytes === 'string') {
        if (intBuffer !== emptyBuffer) {
          decoded += decoder.decode(intBuffer, { stream: true })
          intBuffer = emptyBuffer
        }
        decoded += tokenBytes
      } else {
        const newBuffer = new Uint8Array(intBuffer.length + tokenBytes.length)
        newBuffer.set(intBuffer)
        newBuffer.set(tokenBytes, intBuffer.length)
        intBuffer = newBuffer
      }
    }

    if (intBuffer !== emptyBuffer) {
      decoded += decoder.decode(intBuffer, { stream: true })
    }
    return decoded
  }

  async *decodeNativeAsyncIterable(
    tokens: AsyncIterable<number>,
  ): AsyncGenerator<Uint8Array | string> {
    for await (const token of tokens) {
      const tokenBytesOrString = this.tryDecodeToken(token)
      if (tokenBytesOrString) {
        yield tokenBytesOrString
      }
    }
  }

  private getBpeRankFromString(key: string): number | undefined {
    return this.bytePairStringRankEncoder.get(key)
  }

  private getBpeRankFromStringOrThrow(key: string): number {
    const value = this.getBpeRankFromString(key)
    if (value === undefined) {
      throw new Error(
        `The byte-pair encoding does not contain a value for: ${key}`,
      )
    }
    return value
  }

  private getBpeRankFromBytes(key: Uint8Array): number | undefined {
    const keyAsString = tryConvertToString(key)

    if (keyAsString !== undefined) {
      return this.getBpeRankFromString(keyAsString)
    }

    // Perform binary search on the binary keys
    const index = this.binarySearch(key)
    if (index !== -1) {
      return this.bytePairNonUtfSortedEncoder[index]![1]
    }

    return undefined
  }

  private getBpeRankFromBytesOrThrow(key: Uint8Array): number {
    const value = this.getBpeRankFromBytes(key)
    if (value === undefined) {
      throw new Error(
        `The byte-pair encoding does not contain a value for: ${key.toString()}`,
      )
    }
    return value
  }

  // Binary search on the binary keys
  private binarySearch(key: Uint8Array): number {
    let low = 0
    let high = this.bytePairNonUtfSortedEncoder.length - 1

    while (low <= high) {
      const mid = (low + high) >>> 1
      const midKey = this.bytePairNonUtfSortedEncoder[mid]![0]
      let cmp = 0
      const maxLength = Math.min(midKey.length, key.length)
      for (let i = 0; i < maxLength; i++) {
        cmp = midKey[i]! - key[i]!
        if (cmp !== 0) break
      }
      if (cmp === 0) {
        cmp = midKey.length - key.length
      }
      if (cmp === 0) {
        return mid
      }
      if (cmp < 0) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return -1
  }

  private findNextSpecialToken(
    text: string,
    allowedSpecial: Set<string> | undefined,
    startIndex: number,
  ): [startIndex: number, token: string] | undefined {
    if (!allowedSpecial?.size) {
      return undefined
    }

    let searchIndex = startIndex

    while (true) {
      this.specialTokenPatternRegex.lastIndex = searchIndex
      const nextSpecialMatch = this.specialTokenPatternRegex.exec(text)

      if (!nextSpecialMatch) {
        return undefined
      }

      const specialToken = nextSpecialMatch[0]

      if (allowedSpecial.has(specialToken)) {
        return [nextSpecialMatch.index, specialToken]
      }

      searchIndex = nextSpecialMatch.index + 1
    }
  }

  private tryDecodeToken(tokenRank: number): Uint8Array | string | undefined {
    const value = this.bytePairRankDecoder[tokenRank]
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'object') {
      const fromBinary = this.bytePairNonUtfRankDecoder.get(tokenRank)
      if (fromBinary) {
        return fromBinary
      }
    }
    return this.specialTokensDecoder.get(tokenRank)
  }

  private addToMergeCache(key: string, value: number[]): void {
    if (!this.mergeCache) return

    if (this.mergeCache.size >= this.mergeCacheSize) {
      // Remove least recently used item (first item)
      const firstKey = this.mergeCache.keys().next().value!
      this.mergeCache.delete(firstKey)
    }
    this.mergeCache.set(key, value)
  }

  private bytePairEncode(input: string): number[] {
    if (input.length === 1 && isAscii(input.codePointAt(0)!)) {
      return [this.getBpeRankFromStringOrThrow(input)]
    }

    if (this.mergeCache?.has(input)) {
      const result = this.mergeCache.get(input)!
      // Move to end to mark as recently used
      this.mergeCache.delete(input)
      this.mergeCache.set(input, result)
      return result
    }

    const inputBytes = this.textEncoder.encode(input)
    const result = this.bytePairMerge(inputBytes)
    this.addToMergeCache(input, result)
    return result
  }

  private bytePairMerge(
    // Input array of bytes to process
    piece: Uint8Array,
  ): number[] {
    const { length } = piece
    // Partitions form a linked list over byte offsets: a live partition starting at
    // offset 'i' spans [i, next[i]). 'pairRanks[i]' is the rank of merging it with
    // the partition after it. Merges come off a min-heap ordered by (rank, offset),
    // which picks the same pair as scanning for the lowest rank, leftmost first,
    // without rescanning the piece after every merge.
    const next = new Int32Array(length + 1)
    const previous = new Int32Array(length + 1)
    const pairRanks = new Float64Array(length + 1)
    const live = new Uint8Array(length + 1)

    const getPairRank = (startIndex: number): number => {
      const middle = next[startIndex]!
      if (middle >= length) return Number.POSITIVE_INFINITY
      const rank = this.getBpeRankFromBytes(
        piece.subarray(startIndex, next[middle]!),
      )
      return rank ?? Number.POSITIVE_INFINITY
    }

    // Heap entries are packed as [rank, startIndex] pairs in a flat array
    const heap: number[] = []
    const isLower = (a: number, b: number) =>
      heap[a]! < heap[b]! ||
      (heap[a] === heap[b] && heap[a + 1]! < heap[b + 1]!)
    const swap = (a: number, b: number) => {
      const rank = heap[a]!
      const startIndex = heap[a + 1]!
      heap[a] = heap[b]!
      heap[a + 1] = heap[b + 1]!
      heap[b] = rank
      heap[b + 1] = startIndex
    }
    const push = (rank: number, startIndex: number) => {
      heap.push(rank, startIndex)
      let index = heap.length - 2
      while (index > 0) {
        const parent = (((index >> 1) - 1) >> 1) << 1
        if (!isLower(index, parent)) break
        swap(index, parent)
        index = parent
      }
    }
    const pop = () => {
      const last = heap.length - 2
      swap(0, last)
      const rank = heap[last]!
      const startIndex = heap[last + 1]!
      heap.length = last
      let index = 0
      while (true) {
        const left = index * 2 + 2
        const right = left + 2
        let lowest = index
        if (left < heap.length && isLower(left, lowest)) lowest = left
        if (right < heap.length && isLower(right, lowest)) lowest = right
        if (lowest === index) break
        swap(index, lowest)
        index = lowest
      }
      return [rank, startIndex] as const
    }

    for (let i = 0; i <= length; i++) {
      next[i] = i + 1
      previous[i] = i - 1
      live[i] = 1
    }
    for (let i = 0; i < length - 1; i++) {
      pairRanks[i] = getPairRank(i)
      if (pairRanks[i] !== Number.POSITIVE_INFINITY) push(pairRanks[i]!, i)
    }

    // Iteratively merge byte pairs until no more useful merges can be done
    while (heap.length > 0) {
      const [rank, startIndex] = pop()
      // Skip entries made stale by an earlier merge
      if (!live[startIndex] || pairRanks[startIndex] !== rank) continue

      // Merge the partition at 'startIndex' with the one after it
      const merged = next[startIndex]!
      live[merged] = 0
      next[startIndex] = next[merged]!
      previous[next[merged]!] = startIndex

      pairRanks[startIndex] = getPairRank(startIndex)
      if (pairRanks[startIndex] !== Number.POSITIVE_INFINITY) {
        push(pairRanks[startIndex]!, startIndex)
      }

      const before = previous[startIndex]!
      if (before >= 0) {
        pairRanks[before] = getPairRank(before)
        if (pairRanks[before] !== Number.POSITIVE_INFINITY) {
          push(pairRanks[before]!, before)
        }
      }
    }

    // Create the final output by applying the transform function to each partitioned range
    const output: number[] = []
    for (let i = 0; i < length; i = next[i]!) {
      output.push(this.getBpeRankFromBytesOrThrow(piece.subarray(i, next[i]!)))
    }
    return output
  }
}
