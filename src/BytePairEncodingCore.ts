import { EncoderMap } from './EncoderMap.js'
import { escapeRegExp } from './escapeRegExp.js'

export class BytePairEncodingCore {
  encoder: EncoderMap
  decoder: Map<number, Uint8Array>
  tokenSplitRegex: RegExp
  specialTokensEncoder: Map<string, number>
  specialTokensDecoder: Map<number, Uint8Array>
  specialTokenPatternRegex: RegExp

  textEncoder = new TextEncoder()

  constructor({
    bytePairEncoder,
    specialTokenEncoder,
    tokenSplitRegex,
  }: {
    bytePairEncoder: EncoderMap
    specialTokenEncoder?: Map<string, number>
    tokenSplitRegex: RegExp
  }) {
    this.encoder = bytePairEncoder ?? new EncoderMap()
    this.decoder = bytePairEncoder
      ? new Map([...bytePairEncoder].map(([key, value]) => [value, key]))
      : new Map<number, Uint8Array>()
    this.specialTokensEncoder = specialTokenEncoder ?? new Map<string, number>()
    this.specialTokensDecoder = specialTokenEncoder
      ? new Map(
          [...specialTokenEncoder].map(([key, value]) => [
            value,
            this.textEncoder.encode(key),
          ]),
        )
      : new Map<number, Uint8Array>()
    this.tokenSplitRegex = tokenSplitRegex

    const parts = [...this.specialTokensEncoder.keys()].map(escapeRegExp)
    const joinedParts = parts.join('|')
    try {
      this.specialTokenPatternRegex = new RegExp(joinedParts)
    } catch {
      throw new Error('Invalid regular expression pattern.')
    }
  }

  *encodeNative(
    text: string,
    allowedSpecial: Set<string>,
  ): Generator<number[], number> {
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
        const encodedPiece = this.textEncoder.encode(match)
        const token = this.encoder.get(encodedPiece)
        if (token !== undefined) {
          lastTokenLength = 1
          yield [token]
          // eslint-disable-next-line no-continue
          continue
        }

        const tokens = this.bytePairEncode(encodedPiece, this.encoder)
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
    allowedSpecial: Set<string>,
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

      if (allowedSpecial.has(specialToken)) {
        return nextSpecialMatch.index + searchIndex
      }

      searchIndex = nextSpecialMatch.index + searchIndex + 1
    }
  }

  *decodeNative(tokens: Iterable<number>): Generator<Uint8Array> {
    for (const token of tokens) {
      const tokenBytes = this.tryDecodeToken(token)
      if (tokenBytes) {
        yield tokenBytes
      }
    }
  }

  async *decodeNativeAsync(
    tokens: AsyncIterable<number>,
  ): AsyncGenerator<Uint8Array> {
    for await (const token of tokens) {
      const tokenBytes = this.tryDecodeToken(token)
      if (tokenBytes) {
        yield tokenBytes
      }
    }
  }

  tryDecodeToken(token: number): Uint8Array | undefined {
    return this.decoder.get(token) ?? this.specialTokensDecoder.get(token)
  }

  bytePairEncode(inputBytes: Uint8Array, bytePairRanks: EncoderMap): number[] {
    if (inputBytes.length === 1) {
      return [bytePairRanks.getOrThrow(inputBytes)]
    }

    return this.bytePairMerge(inputBytes, bytePairRanks, (pair) => {
      const key = inputBytes.slice(pair.start, pair.end)
      return bytePairRanks.getOrThrow(key)
    })
  }

  bytePairMerge(
    piece: Uint8Array,
    bytePairRanks: EncoderMap,
    transform: (pair: { start: number; end: number }) => number,
  ): number[] {
    const partitions = Array.from({ length: piece.length + 1 }, (_, i) => ({
      start: i,
      rank: Number.POSITIVE_INFINITY,
    }))

    const getRank = (startIndex: number, skip: number): number | undefined => {
      if (startIndex + skip + 2 >= partitions.length) {
        return undefined
      }

      const key = piece.slice(
        partitions[startIndex]!.start,
        partitions[startIndex + skip + 2]!.start,
      )
      return bytePairRanks.get(key)
    }

    for (let i = 0; i < partitions.length - 2; i++) {
      const rank = getRank(i, 0)
      if (rank !== undefined) {
        partitions[i]!.rank = rank
      }
    }

    while (partitions.length > 1) {
      let minRank = Number.POSITIVE_INFINITY
      let minRankIdx = 0

      let i = 0
      for (const partition of partitions) {
        if (partition.rank < minRank) {
          minRank = partition.rank
          minRankIdx = i
        }
        i++
      }

      if (minRank === Number.POSITIVE_INFINITY) {
        break
      }

      partitions[minRankIdx]!.rank =
        getRank(minRankIdx, 1) ?? Number.POSITIVE_INFINITY

      if (minRankIdx > 0) {
        partitions[minRankIdx - 1]!.rank =
          getRank(minRankIdx - 1, 1) ?? Number.POSITIVE_INFINITY
      }

      partitions.splice(minRankIdx + 1, 1)
    }

    const output: number[] = []
    for (let i = 0; i < partitions.length - 1; i++) {
      output.push(
        transform({
          start: partitions[i]!.start,
          end: partitions[i + 1]!.start,
        }),
      )
    }

    return output
  }
}
