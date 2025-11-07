/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-param-reassign */
import { BytePairEncodingCore, decoder } from './BytePairEncodingCore.js'
import { ALL_SPECIAL_TOKENS } from './constants.js'
import {
  type ChatCompletionRequest,
  type ChatMessage,
  type EncodeChatOptions,
  type HarmonyTerminator,
  computeChatCompletionTokenCount,
} from './functionCalling.js'
import {
  type ChatModelName,
  type ChatParameters,
  type EncodingName,
  type ModelName,
  chatModelParams,
  DEFAULT_ENCODING,
  modelToEncodingMap,
} from './mapping.js'
import {
  type ChatFormatter,
  type EncodingParams,
  type GetMergeableRanksFn,
  getEncodingParams,
} from './modelParams.js'
import type { ModelSpec, PriceData } from './modelTypes.js'
import {
  EndOfPrompt,
  EndOfText,
  FimMiddle,
  FimPrefix,
  FimSuffix,
  HarmonyCall,
  HarmonyChannel,
  HarmonyConstrain,
  HarmonyEnd,
  HarmonyMessage,
  HarmonyReturn,
  HarmonyStart,
  ImEnd,
  ImSep,
  ImStart,
} from './specialTokens.js'
import { endsWithIncompleteUtfPairSurrogate } from './utfUtil.js'
import { getMaxValueFromMap, getSpecialTokenRegex } from './util.js'

export type {
  ChatCompletionArrayProperty,
  ChatCompletionBooleanProperty,
  ChatCompletionFunctionCallOption,
  ChatCompletionFunctionDefinition,
  ChatCompletionFunctionParameters,
  ChatCompletionFunctionProperty,
  ChatCompletionFunctionType,
  ChatCompletionNullProperty,
  ChatCompletionNumberProperty,
  ChatCompletionObjectProperty,
  ChatCompletionRequest,
  ChatCompletionStringProperty,
  ChatMessage,
  ChatMessageFunctionCall,
  EncodeChatOptions,
  HarmonyTerminator,
} from './functionCalling.js'

export interface CostEstimate {
  input?: number
  output?: number
  /** batch API input cost */
  batchInput?: number
  /** batch API output cost */
  batchOutput?: number
  /** cached input cost */
  cachedInput?: number
  /** training cost per million tokens */
  training?: number
}

export interface EncodeOptions {
  /**
   * A list of special tokens that are allowed in the input.
   * If set to 'all', all special tokens are allowed except those in disallowedSpecial.
   * @default undefined
   */
  allowedSpecial?: Set<string> | typeof ALL_SPECIAL_TOKENS
  /**
   * A list of special tokens that are disallowed in the input.
   * If set to 'all', all special tokens are disallowed except those in allowedSpecial.
   * @default 'all'
   */
  disallowedSpecial?: Set<string> | typeof ALL_SPECIAL_TOKENS
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
  modelSpec?: ModelSpec
  private bytePairEncodingCoreProcessor: BytePairEncodingCore
  private specialTokensEncoder: Map<string, number>
  private specialTokensSet: Set<string>
  private allSpecialTokenRegex: RegExp
  private defaultSpecialTokenConfig: SpecialTokenConfig
  private chatFormatter: ChatFormatter

  countChatCompletionTokens?: (request: ChatCompletionRequest) => number

  readonly vocabularySize: number

  private constructor({
    bytePairRankDecoder: mergeableBytePairRanks,
    specialTokensEncoder,
    expectedVocabularySize,
    modelName,
    modelSpec,
    chatFormatter,
    ...rest
  }: EncodingParams) {
    this.specialTokensEncoder = specialTokensEncoder
    this.specialTokensSet = new Set<string>(this.specialTokensEncoder.keys())
    this.allSpecialTokenRegex = getSpecialTokenRegex(this.specialTokensSet)

    this.bytePairEncodingCoreProcessor = new BytePairEncodingCore({
      bytePairRankDecoder: mergeableBytePairRanks,
      specialTokensEncoder,
      ...rest,
    })
    this.defaultSpecialTokenConfig = this.processSpecialTokens()

    const maxTokenValue = Math.max(
      mergeableBytePairRanks.length - 1,
      getMaxValueFromMap(specialTokensEncoder),
    )

    this.vocabularySize =
      this.bytePairEncodingCoreProcessor.mergeableBytePairRankCount +
      specialTokensEncoder.size

    if (expectedVocabularySize !== undefined) {
      if (this.vocabularySize !== expectedVocabularySize) {
        throw new Error(
          'The number of mergeable tokens and special tokens must be equal to expectedVocabularySize.',
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
    this.countTokens = this.countTokens.bind(this)
    this.setMergeCacheSize = this.setMergeCacheSize.bind(this)
    this.clearMergeCache = this.clearMergeCache.bind(this)
    this.estimateCost = this.estimateCost.bind(this)
    if (modelSpec?.supported_features?.includes('function_calling')) {
      this.countChatCompletionTokens =
        this.countChatCompletionTokensInternal.bind(this)
    }
    this.modelName = modelName
    this.modelSpec = modelSpec
    this.chatFormatter = chatFormatter ?? 'chatml'
  }

  private *encodeHarmonyChatGenerator(
    chat: Iterable<ChatMessage>,
    encodeOptions?: EncodeOptions & EncodeChatOptions,
  ): Generator<number[], void, undefined> {
    const harmonyStart = this.specialTokensEncoder.get(HarmonyStart)
    const harmonyMessage = this.specialTokensEncoder.get(HarmonyMessage)
    const harmonyEnd = this.specialTokensEncoder.get(HarmonyEnd)
    const harmonyReturn = this.specialTokensEncoder.get(HarmonyReturn)
    const harmonyCall = this.specialTokensEncoder.get(HarmonyCall)
    const harmonyChannel = this.specialTokensEncoder.get(HarmonyChannel)
    const harmonyConstrain = this.specialTokensEncoder.get(HarmonyConstrain)

    if (
      harmonyStart === undefined ||
      harmonyMessage === undefined ||
      harmonyEnd === undefined ||
      harmonyReturn === undefined ||
      harmonyCall === undefined ||
      harmonyChannel === undefined ||
      harmonyConstrain === undefined
    ) {
      throw new Error('Harmony chat format requires dedicated special tokens.')
    }

    const encodeHeaderText = (text: string): number[] =>
      text.length > 0 ? this.encode(text) : []

    const resolveTerminatorToken = (terminator?: HarmonyTerminator): number => {
      switch (terminator) {
        case '<|return|>':
          return harmonyReturn
        case '<|call|>':
          return harmonyCall
        // eslint-disable-next-line unicorn/no-useless-switch-case
        case '<|end|>':
        default:
          return harmonyEnd
      }
    }

    for (const message of chat) {
      if (message.content === undefined) {
        throw new Error('Content must be defined for all messages.')
      }

      const roleOrName = message.name ?? message.role ?? 'user'
      yield [harmonyStart]
      yield encodeHeaderText(roleOrName)

      const recipientInRole =
        message.recipient &&
        (message.recipientPlacement === 'role' || !message.channel)
      const recipientInChannel = message.recipient && !recipientInRole

      if (recipientInRole) {
        yield encodeHeaderText(` to=${message.recipient}`)
      }

      if (message.channel) {
        yield [harmonyChannel]
        yield encodeHeaderText(message.channel)
        if (recipientInChannel) {
          yield encodeHeaderText(` to=${message.recipient}`)
        }
      }

      if (message.constraint) {
        yield [harmonyConstrain]
        yield encodeHeaderText(message.constraint)
      }

      yield [harmonyMessage]
      yield* this.encodeGenerator(message.content, encodeOptions)
      yield [resolveTerminatorToken(message.terminator)]
    }

    const assistantPrime =
      encodeOptions?.primeWithAssistantResponse ?? 'assistant'

    if (assistantPrime.length > 0) {
      yield [harmonyStart]
      yield encodeHeaderText(assistantPrime)
    }
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
    modelSpec: ModelSpec,
  ): GptEncoding {
    const encodingName = modelToEncodingMap[modelName] ?? DEFAULT_ENCODING
    const modelParams = getEncodingParams(encodingName, getMergeableRanks)
    return new GptEncoding({ ...modelParams, modelName, modelSpec })
  }

  private processSpecialTokens({
    allowedSpecial,
    disallowedSpecial,
  }: EncodeOptions = {}): SpecialTokenConfig {
    let regexPattern: RegExp | undefined

    if (
      allowedSpecial === ALL_SPECIAL_TOKENS ||
      allowedSpecial?.has(ALL_SPECIAL_TOKENS)
    ) {
      allowedSpecial = new Set(this.specialTokensSet)
      const allowedSpecialSet = allowedSpecial
      if (disallowedSpecial === ALL_SPECIAL_TOKENS) {
        throw new Error(
          'allowedSpecial and disallowedSpecial cannot both be set to "all".',
        )
      }
      if (typeof disallowedSpecial === 'object') {
        // remove any special tokens that are disallowed
        disallowedSpecial.forEach((val) => allowedSpecialSet.delete(val))
      } else {
        // all special tokens are allowed, and no 'disallowedSpecial' is provided
        disallowedSpecial = new Set()
      }
    }

    if (
      !disallowedSpecial ||
      disallowedSpecial === ALL_SPECIAL_TOKENS ||
      disallowedSpecial.has(ALL_SPECIAL_TOKENS)
    ) {
      // by default, all special tokens are disallowed
      disallowedSpecial = new Set(this.specialTokensSet)
      const disallowedSpecialSet = disallowedSpecial
      if (allowedSpecial?.size) {
        allowedSpecial.forEach((val) => disallowedSpecialSet.delete(val))
        // disallowed takes precedence over allowed
        disallowedSpecial.forEach((val) => allowedSpecial.delete(val))
        if (disallowedSpecial.size > 0) {
          regexPattern = getSpecialTokenRegex(disallowedSpecial)
        }
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
   * @param encodeOptions Options controlling how special tokens are handled.
   */
  *encodeChatGenerator(
    chat: Iterable<ChatMessage>,
    model = this.modelName,
    encodeOptions?: EncodeOptions & EncodeChatOptions,
  ): Generator<number[], void, undefined> {
    if (!model) {
      throw new Error(
        'Model name must be provided either during initialization or passed in to the method.',
      )
    }

    const params: ChatParameters | undefined =
      chatModelParams[model as ChatModelName]
    if (!params) {
      throw new Error(`Model '${model}' does not support chat.`)
    }

    if (this.chatFormatter === 'harmony') {
      yield* this.encodeHarmonyChatGenerator(chat, encodeOptions)
      return
    }

    const chatStartToken = this.specialTokensEncoder.get(ImStart)
    const chatEndToken = this.specialTokensEncoder.get(ImEnd)

    if (chatStartToken === undefined || chatEndToken === undefined) {
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
      yield* this.encodeGenerator(content, encodeOptions)
      yield [chatEndToken]
      yield encodedMessageSeparator
    }

    // every reply is primed with <|start|>assistant<|message|>
    const assistantPrime =
      encodeOptions?.primeWithAssistantResponse ?? 'assistant'
    if (assistantPrime.length > 0) {
      yield [chatStartToken]
      yield* this.encodeGenerator(assistantPrime, encodeOptions)
    }
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
   * @param encodeOptions Options controlling how special tokens are handled.
   */
  encodeChat(
    chat: readonly ChatMessage[],
    model = this.modelName,
    encodeOptions?: EncodeOptions & EncodeChatOptions,
  ): number[] {
    return [...this.encodeChatGenerator(chat, model, encodeOptions)].flat()
  }

  /**
   * Checks whether the provided input stays within the provided token limit.
   * @param input The string or chat messages to evaluate.
   * @param tokenLimit The maximum allowed number of tokens.
   * @param encodeOptions Options controlling how special tokens are handled.
   * @returns {false | number} false if token limit is exceeded, otherwise the number of tokens
   */
  isWithinTokenLimit(
    input: string | Iterable<ChatMessage>,
    tokenLimit: number,
    encodeOptions?: EncodeOptions,
  ): false | number {
    const tokenGenerator =
      typeof input === 'string'
        ? this.encodeGenerator(input, encodeOptions)
        : this.encodeChatGenerator(input, undefined, encodeOptions)
    let count = 0
    for (const tokens of tokenGenerator) {
      count += tokens.length
      if (count > tokenLimit) {
        return false
      }
    }
    return count
  }

  /**
   * Counts the number of tokens in the input.
   * @param input The string or chat messages to evaluate.
   * @param encodeOptions Options controlling how special tokens are handled.
   * @returns {number} The number of tokens.
   */
  countTokens(
    input: string | Iterable<ChatMessage>,
    encodeOptions?: EncodeOptions,
  ): number {
    if (typeof input === 'string') {
      const specialTokenConfig = encodeOptions
        ? this.processSpecialTokens(encodeOptions)
        : this.defaultSpecialTokenConfig

      if (specialTokenConfig.regexPattern) {
        const match = input.match(specialTokenConfig.regexPattern)
        if (match !== null) {
          throw new Error(`Disallowed special token found: ${match[0]}`)
        }
      }

      return this.bytePairEncodingCoreProcessor.countNative(
        input,
        specialTokenConfig.allowedSpecial,
      )
    }

    const tokenGenerator = this.encodeChatGenerator(
      input,
      undefined,
      encodeOptions,
    )
    let count = 0
    for (const tokens of tokenGenerator) {
      count += tokens.length
    }
    return count
  }

  private countStringTokens(text: string): number {
    if (!text) {
      return 0
    }

    return this.bytePairEncodingCoreProcessor.countNative(text)
  }

  private countChatCompletionTokensInternal(
    request: ChatCompletionRequest,
  ): number {
    return computeChatCompletionTokenCount(request, (text) =>
      this.countStringTokens(text),
    )
  }

  setMergeCacheSize(size: number): void {
    this.bytePairEncodingCoreProcessor.setMergeCacheSize(size)
  }

  clearMergeCache(): void {
    this.bytePairEncodingCoreProcessor.clearMergeCache()
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

  /**
   * Estimates the cost of processing a given token count using the model's pricing.
   *
   * @param tokenCount - The number of tokens to estimate cost for
   * @returns Cost estimate object with applicable price components (input, output, batchInput, batchOutput)
   */
  estimateCost(tokenCount: number, modelSpec = this.modelSpec): PriceData {
    if (!modelSpec) {
      throw new Error(
        'Model spec must be provided either during initialization or passed in to the method.',
      )
    }

    if (!modelSpec.price_data) {
      throw new Error(
        `No cost information available for model: ${modelSpec.name}`,
      )
    }

    const priceDataPerMillion = modelSpec.price_data
    const result: PriceData = {}

    // Calculate cost per token and multiply by token count
    // eslint-disable-next-line no-magic-numbers
    const millionTokens = tokenCount / 1_000_000

    if (priceDataPerMillion.main) {
      result.main = {
        input:
          priceDataPerMillion.main.input &&
          priceDataPerMillion.main.input * millionTokens,
        output:
          priceDataPerMillion.main.output &&
          priceDataPerMillion.main.output * millionTokens,
        cached_input:
          priceDataPerMillion.main.cached_input &&
          priceDataPerMillion.main.cached_input * millionTokens,
        cached_output:
          priceDataPerMillion.main.cached_output &&
          priceDataPerMillion.main.cached_output * millionTokens,
      }
    }

    if (priceDataPerMillion.batch) {
      result.batch = {
        input:
          priceDataPerMillion.batch.input &&
          priceDataPerMillion.batch.input * millionTokens,
        output:
          priceDataPerMillion.batch.output &&
          priceDataPerMillion.batch.output * millionTokens,
        cached_input:
          priceDataPerMillion.batch.cached_input &&
          priceDataPerMillion.batch.cached_input * millionTokens,
        cached_output:
          priceDataPerMillion.batch.cached_output &&
          priceDataPerMillion.batch.cached_output * millionTokens,
      }
    }

    return result
  }
}
