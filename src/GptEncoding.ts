/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-param-reassign */
import { BytePairEncodingCore, decoder } from './BytePairEncodingCore.js'
import {
  type ChatModelName,
  type ChatParameters,
  type EncodingName,
  type ModelName,
  chatModelParams,
  modelToEncodingMap,
} from './mapping.js'
import {
  type EncodingParams,
  type GetMergeableRanksAsyncFn,
  type GetMergeableRanksFn,
  getEncodingParams,
  getModelParamsAsync,
} from './modelParams.js'
import {
  EndOfPrompt,
  EndOfText,
  FimMiddle,
  FimPrefix,
  FimSuffix,
  ImEnd,
  ImSep,
  ImStart,
} from './specialTokens.js'
import { endsWithIncompleteUtfPairSurrogate } from './utfUtil.js'
import { getMaxValueFromMap, getSpecialTokenRegex } from './util.js'

export const ALL_SPECIAL_TOKENS = 'all'

export interface EncodeOptions {
  allowedSpecial?: Set<string>
  disallowedSpecial?: Set<string>
}

export interface ChatMessage {
  role?: 'system' | 'user' | 'assistant'
  name?: string
  content: string
}

export interface EncodeChatOptions {
  primeWithAssistantResponse?: string
}

interface SpecialTokenConfig {
  allowedSpecial: Set<string> | undefined
  regexPattern: RegExp | undefined
}

export class GptEncoding {
  static EndOfPrompt = EndOfPrompt
  static EndOfText = EndOfText
  static FimMiddle = FimMiddle
  static FimPrefix = FimPrefix
  static FimSuffix = FimSuffix

  modelName?: ModelName
  private bytePairEncodingCoreProcessor: BytePairEncodingCore
  private specialTokenMapping: Map<string, number>
  private specialTokensSet: Set<string>
  private allSpecialTokenRegex: RegExp
  private defaultSpecialTokenConfig: SpecialTokenConfig

  private constructor({
    mergeableBytePairRanks,
    specialTokenMapping,
    expectedVocabularySize,
    modelName,
    ...rest
  }: EncodingParams) {
    this.specialTokenMapping = specialTokenMapping
    this.specialTokensSet = new Set<string>(this.specialTokenMapping.keys())
    this.allSpecialTokenRegex = getSpecialTokenRegex(this.specialTokensSet)

    this.bytePairEncodingCoreProcessor = new BytePairEncodingCore({
      mergeableBytePairRanks,
      specialTokenMapping,
      ...rest,
    })
    this.defaultSpecialTokenConfig = this.processSpecialTokens()

    const maxTokenValue = Math.max(
      mergeableBytePairRanks.length - 1,
      getMaxValueFromMap(specialTokenMapping),
    )
    if (expectedVocabularySize !== undefined) {
      if (
        this.bytePairEncodingCoreProcessor.mergeableBytePairRankCount +
          specialTokenMapping.size !==
        expectedVocabularySize
      ) {
        throw new Error(
          'The number of mergeable tokens and special tokens must be equal to explicit_n_vocab.',
        )
      }

      if (maxTokenValue !== expectedVocabularySize - 1) {
        throw new Error(
          `The model encodings are invalid. The maximum token value must be equal to expectedVocabularySize - 1. Currently ${maxTokenValue}, expected ${
            expectedVocabularySize - 1
          }`,
        )
      }
    }

    this.encode = this.encode.bind(this)
    this.decode = this.decode.bind(this)
    this.encodeGenerator = this.encodeGenerator.bind(this)
    this.decodeGenerator = this.decodeGenerator.bind(this)
    this.decodeAsyncGenerator = this.decodeAsyncGenerator.bind(this)
    this.decodeAsync = this.decodeAsync.bind(this)
    this.isWithinTokenLimit = this.isWithinTokenLimit.bind(this)
    this.encodeChat = this.encodeChat.bind(this)
    this.encodeChatGenerator = this.encodeChatGenerator.bind(this)
    this.modelName = modelName
  }

  static getEncodingApi(
    encodingName: EncodingName,
    getMergeableRanks: GetMergeableRanksFn,
  ): GptEncoding {
    const modelParams = getEncodingParams(encodingName, getMergeableRanks)
    return new GptEncoding(modelParams)
  }

  static getEncodingApiForModel(
    modelName: ModelName,
    getMergeableRanks: GetMergeableRanksFn,
  ): GptEncoding {
    const encodingName = modelToEncodingMap[modelName]
    const modelParams = getEncodingParams(encodingName, getMergeableRanks)
    return new GptEncoding({ ...modelParams, modelName })
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
    const modelParams = await getModelParamsAsync(
      encodingName,
      getMergeableRanks,
    )
    return new GptEncoding({ ...modelParams, modelName })
  }

  private processSpecialTokens({
    allowedSpecial,
    disallowedSpecial,
  }: EncodeOptions = {}): SpecialTokenConfig {
    let regexPattern: RegExp | undefined

    if (allowedSpecial?.has(ALL_SPECIAL_TOKENS)) {
      allowedSpecial = new Set(this.specialTokensSet)
    }

    if (!disallowedSpecial || disallowedSpecial.has(ALL_SPECIAL_TOKENS)) {
      // by default, all special tokens are disallowed
      disallowedSpecial = new Set(this.specialTokensSet)
      if (allowedSpecial?.size) {
        allowedSpecial.forEach((val) => disallowedSpecial!.delete(val))
        disallowedSpecial.forEach((val) => allowedSpecial.delete(val))
        regexPattern = getSpecialTokenRegex(disallowedSpecial)
      } else {
        regexPattern = this.allSpecialTokenRegex
      }
    }

    return { allowedSpecial, regexPattern }
  }

  encodeGenerator(
    lineToEncode: string,
    encodeOptions?: EncodeOptions,
  ): Generator<number[], number, undefined> {
    const specialTokenConfig = encodeOptions
      ? this.processSpecialTokens(encodeOptions)
      : this.defaultSpecialTokenConfig

    if (specialTokenConfig.regexPattern) {
      const match = lineToEncode.match(specialTokenConfig.regexPattern)
      if (match !== null) {
        throw new Error(`Disallowed special token found: ${match[0]}`)
      }
    }

    return this.bytePairEncodingCoreProcessor.encodeNativeGenerator(
      lineToEncode,
      specialTokenConfig.allowedSpecial,
    )
  }

  encode(lineToEncode: string, encodeOptions?: EncodeOptions): number[] {
    // const encodedTokens: number[] = []
    // for (const tokens of this.encodeGenerator(lineToEncode, encodeOptions)) {
    //   encodedTokens.push(...tokens)
    // }
    // return encodedTokens
    const specialTokenConfig = encodeOptions
      ? this.processSpecialTokens(encodeOptions)
      : this.defaultSpecialTokenConfig

    if (specialTokenConfig.regexPattern) {
      const match = lineToEncode.match(specialTokenConfig.regexPattern)
      if (match !== null) {
        throw new Error(`Disallowed special token found: ${match[0]}`)
      }
    }

    return this.bytePairEncodingCoreProcessor.encodeNative(
      lineToEncode,
      specialTokenConfig.allowedSpecial,
    )
  }

  /**
   * Progressively tokenizes an OpenAI chat.
   * Warning: gpt-3.5-turbo and gpt-4 chat format may change over time.
   * Returns tokens assuming the 'gpt-3.5-turbo-0301' / 'gpt-4-0314' format.
   * Based on OpenAI's guidelines: https://github.com/openai/openai-python/blob/main/chatml.md
   * Also mentioned in section 6 of this document: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
   */
  *encodeChatGenerator(
    chat: Iterable<ChatMessage>,
    model = this.modelName,
  ): Generator<number[], void, undefined> {
    if (!model) {
      throw new Error(
        'Model name must be provided either during initialization or passed in to the method.',
      )
    }

    const params: ChatParameters | undefined =
      chatModelParams[model as ChatModelName]
    const chatStartToken = this.specialTokenMapping.get(ImStart)
    const chatEndToken = this.specialTokenMapping.get(ImEnd)

    if (!params || chatStartToken === undefined || chatEndToken === undefined) {
      throw new Error(`Model '${model}' does not support chat.`)
    }
    const allowedSpecial = new Set([ImSep])
    const { messageSeparator, roleSeparator } = params
    const encodedMessageSeparator =
      messageSeparator.length > 0 ? this.encode(messageSeparator) : []
    const encodedRoleSeparator =
      roleSeparator.length > 0
        ? this.encode(roleSeparator, { allowedSpecial })
        : []
    const nameCache = new Map<string, number[]>()

    for (const { role = 'system', name = role, content } of chat) {
      if (content === undefined) {
        throw new Error('Content must be defined for all messages.')
      }

      yield [chatStartToken]
      const encodedName = nameCache.get(name) ?? this.encode(name)
      nameCache.set(name, encodedName)
      yield encodedName
      if (encodedRoleSeparator.length > 0) {
        yield encodedRoleSeparator
      }
      yield* this.encodeGenerator(content)
      yield [chatEndToken]
      yield encodedMessageSeparator
    }

    // every reply is primed with <|start|>assistant<|message|>
    yield [chatStartToken]
    yield* this.encodeGenerator('assistant')
    if (encodedRoleSeparator.length > 0) {
      yield encodedRoleSeparator
    }
  }

  /**
   * Encodes a chat into a single array of tokens.
   * Warning: gpt-3.5-turbo and gpt-4 chat format may change over time.
   * Returns tokens assuming the 'gpt-3.5-turbo-0301' / 'gpt-4-0314' format.
   * Based on OpenAI's guidelines: https://github.com/openai/openai-python/blob/main/chatml.md
   * Also mentioned in section 6 of this document: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
   */
  encodeChat(chat: readonly ChatMessage[], model = this.modelName): number[] {
    return [...this.encodeChatGenerator(chat, model)].flat()
  }

  /**
   * @returns {false | number} false if token limit is exceeded, otherwise the number of tokens
   */
  isWithinTokenLimit(
    input: string | Iterable<ChatMessage>,
    tokenLimit: number,
  ): false | number {
    const tokenGenerator =
      typeof input === 'string'
        ? this.encodeGenerator(input)
        : this.encodeChatGenerator(input)
    let count = 0
    for (const tokens of tokenGenerator) {
      count += tokens.length
      if (count > tokenLimit) {
        return false
      }
    }
    return count
  }

  decode(inputTokensToDecode: Iterable<number>): string {
    return this.bytePairEncodingCoreProcessor.decodeNative(inputTokensToDecode)
  }

  *decodeGenerator(
    inputTokensToDecode: Iterable<number>,
  ): Generator<string, void, void> {
    const decodedByteGenerator =
      this.bytePairEncodingCoreProcessor.decodeNativeGenerator(
        inputTokensToDecode,
      )

    let buffer = ''

    for (const decodedPart of decodedByteGenerator) {
      buffer +=
        typeof decodedPart === 'string'
          ? decodedPart
          : decoder.decode(decodedPart, { stream: true })

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
      this.bytePairEncodingCoreProcessor.decodeNativeAsyncIterable(
        inputTokensToDecode,
      )

    let buffer = ''

    for await (const decodedPart of decodedByteGenerator) {
      buffer +=
        typeof decodedPart === 'string'
          ? decodedPart
          : decoder.decode(decodedPart, { stream: true })

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

  async decodeAsync(
    inputTokensToDecode: AsyncIterable<number>,
  ): Promise<string> {
    const decodedByteGenerator =
      this.bytePairEncodingCoreProcessor.decodeNativeAsyncIterable(
        inputTokensToDecode,
      )

    let buffer = ''

    for await (const decodedPart of decodedByteGenerator) {
      buffer +=
        typeof decodedPart === 'string'
          ? decodedPart
          : decoder.decode(decodedPart, { stream: true })
    }

    return buffer
  }
}
