/* eslint-disable no-param-reassign */
import { BytePairEncodingCore } from './BytePairEncodingCore.js'
import { escapeRegExp } from './escapeRegExp.js'
import {
  type EncodingName,
  type ModelName,
  modelToEncodingMap,
} from './mapping.js'
import {
  type GetMergeableRanksAsyncFn,
  type GetMergeableRanksFn,
  type ModelParams,
  getModelParams,
  getModelParamsAsync,
} from './modelParams.js'
import {
  EndOfPrompt,
  EndOfText,
  FimMiddle,
  FimPrefix,
  FimSuffix,
} from './specialTokens.js'
import { endsWithIncompleteUtfPairSurrogate } from './utfUtil.js'

export const DISALLOW_ALL_SPECIAL_TOKENS = 'all'

export class GptEncoding {
  static EndOfPrompt = EndOfPrompt
  static EndOfText = EndOfText
  static FimMiddle = FimMiddle
  static FimPrefix = FimPrefix
  static FimSuffix = FimSuffix

  decoder = new TextDecoder('utf8')
  private bytePairEncodingCoreProcessor: BytePairEncodingCore
  private specialTokenMapping: Map<string, number>

  private constructor({
    tokenSplitRegex,
    mergeableBytePairRanks,
    specialTokenMapping,
    expectedVocabularySize,
  }: ModelParams) {
    const maxTokenValue = Math.max(
      GptEncoding.getMaxValueFromMap(mergeableBytePairRanks),
      GptEncoding.getMaxValueFromMap(specialTokenMapping),
    )
    this.specialTokenMapping = specialTokenMapping

    if (expectedVocabularySize !== undefined) {
      if (
        mergeableBytePairRanks.size + specialTokenMapping.size !==
        expectedVocabularySize
      ) {
        throw new Error(
          'The number of mergeable tokens and special tokens must be equal to explicit_n_vocab.',
        )
      }

      if (maxTokenValue !== expectedVocabularySize - 1) {
        throw new Error(
          'The maximum token value must be equal to explicit_n_vocab - 1.',
        )
      }
    }

    this.bytePairEncodingCoreProcessor = new BytePairEncodingCore({
      bytePairEncoder: mergeableBytePairRanks,
      specialTokenEncoder: specialTokenMapping,
      tokenSplitRegex,
    })

    this.encode = this.encode.bind(this)
    this.decode = this.decode.bind(this)
    this.encodeGenerator = this.encodeGenerator.bind(this)
    this.decodeGenerator = this.decodeGenerator.bind(this)
    this.decodeAsyncGenerator = this.decodeAsyncGenerator.bind(this)
    this.isWithinTokenLimit = this.isWithinTokenLimit.bind(this)
  }

  static getEncodingApi(
    encodingName: EncodingName,
    getMergeableRanks: GetMergeableRanksFn,
  ): GptEncoding {
    const modelParams = getModelParams(encodingName, getMergeableRanks)
    return new GptEncoding(modelParams)
  }

  static getEncodingApiForModel(
    modelName: ModelName,
    getMergeableRanks: GetMergeableRanksFn,
  ): GptEncoding {
    const encodingName = modelToEncodingMap[modelName]
    return GptEncoding.getEncodingApi(encodingName, getMergeableRanks)
  }

  static async getEncodingApiAsync(
    encodingName: EncodingName,
    getMergeableRanks: GetMergeableRanksAsyncFn,
  ): Promise<GptEncoding> {
    const modelParams = await getModelParamsAsync(
      encodingName,
      getMergeableRanks,
    )
    return new GptEncoding(modelParams)
  }

  static async getEncodingApiForModelAsync(
    modelName: ModelName,
    getMergeableRanks: GetMergeableRanksAsyncFn,
  ): Promise<GptEncoding> {
    const encodingName = modelToEncodingMap[modelName]
    return GptEncoding.getEncodingApiAsync(encodingName, getMergeableRanks)
  }

  private static getMaxValueFromMap(map: Map<unknown, number>): number {
    let max = 0
    map.forEach((val) => {
      max = Math.max(max, val)
    })
    return max
  }

  private static specialTokenRegex(tokens: Set<string>): RegExp {
    const escapedTokens = [...tokens].map(escapeRegExp)
    const inner = escapedTokens.join('|')
    return new RegExp(`(${inner})`)
  }

  encodeGenerator(
    lineToEncode: string,
    allowedSpecial = new Set<string>(),
    disallowedSpecial: Set<string> = new Set<string>([
      DISALLOW_ALL_SPECIAL_TOKENS,
    ]),
  ): Generator<number[], number> {
    const specialTokensSet = new Set<string>(this.specialTokenMapping.keys())

    if (disallowedSpecial.has(DISALLOW_ALL_SPECIAL_TOKENS)) {
      disallowedSpecial = new Set<string>(specialTokensSet)
      disallowedSpecial.forEach((val) => allowedSpecial.delete(val))
    }

    if (allowedSpecial.has(DISALLOW_ALL_SPECIAL_TOKENS)) {
      allowedSpecial = specialTokensSet
    }

    if (disallowedSpecial.size > 0) {
      const regexPattern = GptEncoding.specialTokenRegex(disallowedSpecial)
      const match = lineToEncode.match(regexPattern)
      if (match !== null) {
        throw new Error(`Disallowed special token found: ${match[0]}`)
      }
    }

    return this.bytePairEncodingCoreProcessor.encodeNative(
      lineToEncode,
      allowedSpecial,
    )
  }

  encode(
    lineToEncode: string,
    allowedSpecial = new Set<string>(),
    disallowedSpecial: Set<string> = new Set<string>([
      DISALLOW_ALL_SPECIAL_TOKENS,
    ]),
  ): number[] {
    return [
      ...this.encodeGenerator(lineToEncode, allowedSpecial, disallowedSpecial),
    ].flat()
  }

  /**
   * @returns {false | number} false if token limit is exceeded, otherwise the number of tokens
   */
  isWithinTokenLimit(text: string, tokenLimit: number): false | number {
    const tokenGenerator = this.encodeGenerator(text)
    let count = 0
    for (const tokens of tokenGenerator) {
      count += tokens.length
      if (count > tokenLimit) {
        return false
      }
    }
    return count
  }

  *decodeGenerator(
    inputTokensToDecode: Iterable<number>,
  ): Generator<string, void> {
    const decodedByteGenerator =
      this.bytePairEncodingCoreProcessor.decodeNative(inputTokensToDecode)

    let buffer = ''

    for (const decodedPart of decodedByteGenerator) {
      buffer += this.decoder.decode(decodedPart, { stream: true })

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

  async *decodeAsyncGenerator(
    inputTokensToDecode: AsyncIterable<number>,
  ): AsyncGenerator<string, void> {
    const decodedByteGenerator =
      this.bytePairEncodingCoreProcessor.decodeNativeAsync(inputTokensToDecode)

    let buffer = ''

    for await (const decodedPart of decodedByteGenerator) {
      buffer += this.decoder.decode(decodedPart, { stream: true })

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

  decode(inputTokensToDecode: Iterable<number>): string {
    return [...this.decodeGenerator(inputTokensToDecode)].join('')
  }
}
