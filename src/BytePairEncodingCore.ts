/* eslint-disable no-continue */

import { compareUint8Arrays, isAscii, tryConvertToString } from './utfUtil.js'
import { escapeRegExp } from './util.js'

export type RawBytePairRanks = readonly (string | readonly number[])[]

export interface BytePairEncodingConfig {
  mergeableBytePairRanks: RawBytePairRanks
  specialTokenMapping?: Map<string, number>
  tokenSplitRegex: RegExp
}

export class BytePairEncodingCore {
  readonly bytePairEncoderSize: number
  private bytePairEncoder: RawBytePairRanks
  private bytePairEncoderSortedLookup: readonly [Uint8Array, number][]
  private bytePairRanksDecoder = new Map<number, Uint8Array>()
  private tokenSplitRegex: RegExp
  private specialTokensEncoder: Map<string, number>
  private specialTokensDecoder: Map<number, string>
  private specialTokenPatternRegex: RegExp
  private stringDecoder: Map<string, number>
  private textEncoder = new TextEncoder()

  constructor({
    mergeableBytePairRanks: bytePairEncoder,
    specialTokenMapping: specialTokenEncoder,
    tokenSplitRegex,
  }: BytePairEncodingConfig) {
    this.bytePairEncoder = bytePairEncoder
    this.stringDecoder = new Map<string, number>()

    // size without array holes (which may be present in the encoder)
    this.bytePairEncoderSize = Object.keys(bytePairEncoder).length
    const binaryLookup: [Uint8Array, number][] = []
    // forEach skips array holes:
    bytePairEncoder.forEach((value, rank) => {
      if (typeof value === 'string') {
        this.stringDecoder.set(value, rank)
        return
      }
      const byteArray = new Uint8Array(value)
      binaryLookup.push([byteArray, rank])
      this.bytePairRanksDecoder.set(rank, byteArray)
    })
    this.bytePairEncoderSortedLookup = binaryLookup.sort((a, b) =>
      compareUint8Arrays(a[0], b[0]),
    )
    this.specialTokensEncoder = specialTokenEncoder ?? new Map<string, number>()
    this.specialTokensDecoder = specialTokenEncoder
      ? new Map([...specialTokenEncoder].map(([key, value]) => [value, key]))
      : new Map<number, string>()
    this.tokenSplitRegex = tokenSplitRegex

    const parts = [...this.specialTokensEncoder.keys()].map(escapeRegExp)
    const joinedParts = parts.join('|')
    try {
      this.specialTokenPatternRegex = new RegExp(joinedParts)
    } catch {
      throw new Error('Invalid regular expression pattern.')
    }
  }

  getBpeRankFromString(key: string): number | undefined {
    return this.stringDecoder.get(key)
  }

  getBpeRankFromStringOrThrow(key: string): number {
    const value = this.getBpeRankFromString(key)
    if (value === undefined) {
      throw new Error(
        `The byte-pair encoding does not contain a value for: ${key}`,
      )
    }
    return value
  }

  getBpeRankFromBytes(key: Uint8Array): number | undefined {
    const keyAsString = tryConvertToString(key)

    if (keyAsString !== undefined) {
      return this.getBpeRankFromString(keyAsString)
    }

    // Perform binary search on the binary keys
    const index = this.binarySearch(key)
    if (index !== -1) {
      return this.bytePairEncoderSortedLookup[index]![1]
    }

    return undefined
  }

  getBpeRankFromBytesOrThrow(key: Uint8Array): number {
    const value = this.getBpeRankFromBytes(key)
    if (value === undefined) {
      throw new Error(
        `The byte-pair encoding does not contain a value for: ${key.toString()}`,
      )
    }
    return value
  }

  // Binary search on the binary keys
  binarySearch(key: Uint8Array): number {
    let low = 0
    let high = this.bytePairEncoderSortedLookup.length - 1

    while (low <= high) {
      // eslint-disable-next-line no-bitwise
      const mid = (low + high) >>> 1
      const midKey = this.bytePairEncoderSortedLookup[mid]![0]
      let cmp = 0
      for (let i = 0; i < Math.min(midKey.length, key.length); i++) {
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

  *encodeNative(
    text: string,
    allowedSpecial?: Set<string>,
  ): Generator<number[], number, undefined> {
    let startIndex = 0
    let lastTokenLength = 0

    while (true) {
      const nextSpecialStartIndex = this.findNextSpecialStartIndex(
        text,
        allowedSpecial,
        startIndex,
        this.specialTokenPatternRegex,
      )

      const endIndex =
        nextSpecialStartIndex !== undefined
          ? nextSpecialStartIndex
          : text.length

      const textSegment = text.slice(startIndex, endIndex - startIndex)

      for (const [match] of textSegment.matchAll(this.tokenSplitRegex)) {
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
        const specialToken = text.slice(Math.max(0, nextSpecialStartIndex))
        const specialTokenValue = this.specialTokensEncoder.get(specialToken)
        if (specialTokenValue === undefined) {
          throw new Error(
            `Special token "${specialToken}" is not in the special token encoder.`,
          )
        }
        yield [specialTokenValue]
        startIndex = nextSpecialStartIndex + specialToken.length
        lastTokenLength = 0
      } else {
        break
      }
    }

    return lastTokenLength
  }

  findNextSpecialStartIndex(
    text: string,
    allowedSpecial: Set<string> | undefined,
    startIndex: number,
    specialRegex: RegExp,
  ): number | undefined {
    let searchIndex = startIndex

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextSpecialMatch = specialRegex.exec(
        text.slice(Math.max(0, searchIndex)),
      )

      if (!nextSpecialMatch) {
        return undefined
      }

      const [specialToken] = nextSpecialMatch

      if (allowedSpecial?.has(specialToken)) {
        return nextSpecialMatch.index + searchIndex
      }

      searchIndex = nextSpecialMatch.index + searchIndex + 1
    }
  }

  *decodeNative(
    tokens: Iterable<number>,
  ): Generator<Uint8Array | string, void, void> {
    for (const token of tokens) {
      const tokenBytes = this.tryDecodeToken(token)
      if (tokenBytes) {
        yield tokenBytes
      }
    }
  }

  async *decodeNativeAsync(
    tokens: AsyncIterable<number>,
  ): AsyncGenerator<Uint8Array | string> {
    for await (const token of tokens) {
      const tokenBytesOrString = this.tryDecodeToken(token)
      if (tokenBytesOrString) {
        yield tokenBytesOrString
      }
    }
  }

  tryDecodeToken(tokenRank: number): Uint8Array | string | undefined {
    const value = this.bytePairEncoder[tokenRank]
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'object') {
      const fromBinary = this.bytePairRanksDecoder.get(tokenRank)
      if (fromBinary) {
        return fromBinary
      }
    }
    return this.specialTokensDecoder.get(tokenRank)
  }

  bytePairEncode(input: string): number[] {
    if (input.length === 1 && isAscii(input.codePointAt(0)!)) {
      return [this.getBpeRankFromStringOrThrow(input)]
    }

    const inputBytes = this.textEncoder.encode(input)

    return this.bytePairMerge(inputBytes, (start, end) => {
      const key = inputBytes.subarray(start, end)
      return this.getBpeRankFromBytesOrThrow(key)
    })
  }

  bytePairMerge(
    // Input array of bytes to process
    piece: Uint8Array,
    // Function to apply to each final segment after merging
    getByteForRange: (start: number, end: number) => number,
  ): number[] {
    // Create an array of partition objects. Each partition tracks the start index in 'piece'
    // and a rank value for adjacent pairs (initially set to positive infinity).
    const partitions = Array.from({ length: piece.length + 1 }, (_, i) => ({
      start: i,
      rank: Number.POSITIVE_INFINITY, // Rank starts at infinity (unmerged)
    }))

    // Helper function to get the rank of a byte pair starting at 'startIndex'.
    // 'skip' determines how far we look ahead (usually 0, for consecutive pairs).
    const getRank = (startIndex: number, skip: number): number | undefined => {
      if (startIndex + skip + 2 >= partitions.length) {
        // Avoid out-of-bounds errors, return undefined when no valid pair exists
        return undefined
      }

      // Get the byte pair by extracting a subarray starting at 'startIndex' and ending at
      // the start of the partition after 'skip + 2'.
      const key = piece.subarray(
        partitions[startIndex]!.start,
        partitions[startIndex + skip + 2]!.start,
      )

      // Retrieve the rank of this byte pair from the BPE rank function
      return this.getBpeRankFromBytes(key)
    }

    // Initialize the ranks for all adjacent pairs in the array
    for (let i = 0; i < partitions.length - 2; i++) {
      // Get the rank for the pair starting at index 'i'
      const rank = getRank(i, 0)
      if (rank !== undefined) {
        // Assign the rank to the partition at index 'i'
        partitions[i]!.rank = rank
      }
    }

    // Iteratively merge byte pairs until no more useful merges can be done
    while (partitions.length > 1) {
      let minRank = Number.POSITIVE_INFINITY
      let minRankIdx = 0

      // Find the partition with the minimum rank, i.e., the most important pair to merge next
      let i = 0
      for (const partition of partitions) {
        if (partition.rank < minRank) {
          minRank = partition.rank
          minRankIdx = i
        }
        i++
      }

      // If no valid pair is left to merge, exit the loop
      if (minRank === Number.POSITIVE_INFINITY) {
        break
      }

      // Update the rank of the partition after the merged one
      partitions[minRankIdx]!.rank =
        getRank(minRankIdx, 1) ?? Number.POSITIVE_INFINITY

      // Update the rank of the partition before the merged one (if exists)
      if (minRankIdx > 0) {
        partitions[minRankIdx - 1]!.rank =
          getRank(minRankIdx - 1, 1) ?? Number.POSITIVE_INFINITY
      }

      // Merge by removing the partition after the one we just merged
      partitions.splice(minRankIdx + 1, 1)
    }

    // Create the final output by applying the transform function to each partitioned range
    const output: number[] = []
    for (let i = 0; i < partitions.length - 1; i++) {
      output.push(
        getByteForRange(
          // start index
          partitions[i]!.start,
          // end index
          partitions[i + 1]!.start,
        ),
      )
    }

    return output
  }
}
