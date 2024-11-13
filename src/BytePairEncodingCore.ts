/* eslint-disable no-continue */

import { compareUint8Arrays, isAscii, tryConvertToString } from './utfUtil.js'
import { escapeRegExp } from './util.js'

export type RawBytePairRanks = readonly (string | readonly number[])[]

export interface BytePairEncodingConfig {
  bytePairRankDecoder: RawBytePairRanks
  specialTokensEncoder?: Map<string, number>
  tokenSplitRegex: RegExp
}

const emptyBuffer = new Uint8Array(0)

export const decoder = new TextDecoder('utf8')

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

  constructor({
    bytePairRankDecoder,
    specialTokensEncoder,
    tokenSplitRegex,
  }: BytePairEncodingConfig) {
    this.bytePairRankDecoder = bytePairRankDecoder
    this.bytePairStringRankEncoder = new Map<string, number>()

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
      this.specialTokenPatternRegex = new RegExp(allSpecialTokensRegex)
    } catch {
      throw new Error('Invalid regular expression pattern.')
    }
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

      const textBeforeSpecial = text.slice(startIndex, endIndex)

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

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextSpecialMatch = this.findNextSpecialToken(
        text,
        allowedSpecial,
        startIndex,
      )
      const nextSpecialStartIndex = nextSpecialMatch?.[0]

      const endIndex = nextSpecialStartIndex ?? text.length

      const textBeforeSpecial = text.slice(startIndex, endIndex)

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
      // eslint-disable-next-line no-bitwise
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
    let searchIndex = startIndex

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextSpecialMatch = this.specialTokenPatternRegex.exec(
        text.slice(Math.max(0, searchIndex)),
      )

      if (!nextSpecialMatch) {
        return undefined
      }

      const specialToken = nextSpecialMatch[0]

      if (allowedSpecial?.has(specialToken)) {
        const specialTokenStartIndex = nextSpecialMatch.index + searchIndex
        return [specialTokenStartIndex, specialToken]
      }

      searchIndex = nextSpecialMatch.index + searchIndex + 1
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

  private bytePairEncode(input: string): number[] {
    if (input.length === 1 && isAscii(input.codePointAt(0)!)) {
      return [this.getBpeRankFromStringOrThrow(input)]
    }

    const inputBytes = this.textEncoder.encode(input)

    return this.bytePairMerge(inputBytes)
  }

  private bytePairMerge(
    // Input array of bytes to process
    piece: Uint8Array,
  ): number[] {
    // 'starts' holds the start indices of each partition
    const starts: number[] = []
    // 'ranks' holds the BPE ranks of each partition pair
    const ranks: number[] = []

    // Helper function to get the rank of a byte pair starting at 'startIndex'
    const getRank = (
      startIndex: number,
      pairStart = starts[startIndex],
      pairEnd = starts[startIndex + 2],
    ): number => {
      if (pairEnd === undefined) {
        // No valid pair exists
        return Number.POSITIVE_INFINITY
      }

      // Extract the byte pair
      const key = piece.subarray(pairStart, pairEnd)

      // Retrieve the BPE rank of this byte pair (if it exists)
      const rank = this.getBpeRankFromBytes(key)
      return rank ?? Number.POSITIVE_INFINITY
    }

    // Initialize the 'starts' array with all possible start indices
    for (let i = 0; i <= piece.length; i++) {
      starts.push(i)
      if (i < piece.length - 1) {
        // Initialize the BPE values for all adjacent pairs
        ranks.push(getRank(i, i, i + 2))
      } else {
        // Initialize BPE values to infinity for the last pair
        ranks.push(Number.POSITIVE_INFINITY)
      }
    }

    // Iteratively merge byte pairs until no more useful merges can be done
    while (starts.length > 1) {
      let lowestRank = Number.POSITIVE_INFINITY
      let lowestPartitionIndex = -1

      // Find the partition with the minimum rank
      for (let i = 0; i < ranks.length - 1; i++) {
        const rank = ranks[i]!
        if (rank < lowestRank) {
          lowestRank = rank
          lowestPartitionIndex = i
        }
      }

      // If no valid pair is left to merge, exit the loop
      if (
        lowestRank === Number.POSITIVE_INFINITY ||
        lowestPartitionIndex === -1
      ) {
        break
      }

      // Merge the pair at 'lowestPartitionIndex' by removing the next start index
      starts.splice(lowestPartitionIndex + 1, 1)
      // Remove the BPE value of the merged pair
      ranks.splice(lowestPartitionIndex, 1)

      // Update the current merged pair's rank
      ranks[lowestPartitionIndex] = getRank(lowestPartitionIndex)

      // Update the rank of the previous pair, if it exists
      if (lowestPartitionIndex > 0) {
        ranks[lowestPartitionIndex - 1] = getRank(lowestPartitionIndex - 1)
      }
    }

    // Create the final output by applying the transform function to each partitioned range
    const output: number[] = []
    for (let i = 0; i < starts.length - 1; i++) {
      const pairStart = starts[i]
      const pairEnd = starts[i + 1]
      const bpeValue = this.getBpeRankFromBytesOrThrow(
        piece.subarray(pairStart, pairEnd),
      )
      output.push(bpeValue)
    }
    return output
  }
}
