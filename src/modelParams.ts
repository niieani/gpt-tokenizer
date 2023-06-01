/* eslint-disable no-magic-numbers */
import { EncoderMap } from './EncoderMap.js'
import type { EncodingName, ModelName } from './mapping.js'
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

export interface EncodingParams {
  /**
   * The expected total number of tokens in the vocabulary, including both regular and special tokens.
   * This parameter is used to ensure that the combined number of regular and special tokens matches the expected total.
   */
  expectedVocabularySize?: number
  /**
   * A regular expression that is designed to tokenize or break up a text into parts
   * that can be contractions, letters, numbers, or other characters,
   * while handling line terminators and spaces in a specific manner.
   * It's complex due to its need to deal with a wide variety of cases in text processing.
   */
  tokenSplitRegex: RegExp
  mergeableBytePairRanks: EncoderMap
  specialTokenMapping: Map<string, number>
  modelName?: ModelName
}

const tokenSplitRegex =
  /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu

function R50KBase(mergeableBytePairRanks: EncoderMap): EncodingParams {
  return {
    expectedVocabularySize: 50_257,
    tokenSplitRegex,
    mergeableBytePairRanks,
    specialTokenMapping: new Map<string, number>([[EndOfText, 50_256]]),
  }
}

function P50KBase(mergeableBytePairRanks: EncoderMap): EncodingParams {
  return {
    expectedVocabularySize: 50_281,
    tokenSplitRegex,
    mergeableBytePairRanks,
    specialTokenMapping: new Map<string, number>([[EndOfText, 50_256]]),
  }
}

function P50KEdit(mergeableBytePairRanks: EncoderMap): EncodingParams {
  const specialTokenMapping = new Map<string, number>([
    [EndOfText, 50_256],
    [FimPrefix, 50_281],
    [FimMiddle, 50_282],
    [FimSuffix, 50_283],
  ])

  return {
    tokenSplitRegex,
    mergeableBytePairRanks,
    specialTokenMapping,
  }
}

function Cl100KBase(mergeableBytePairRanks: EncoderMap): EncodingParams {
  const specialTokenMapping = new Map<string, number>([
    [EndOfText, 100_257],
    [FimPrefix, 100_258],
    [FimMiddle, 100_259],
    [FimSuffix, 100_260],
    [ImStart, 100_264],
    [ImEnd, 100_265],
    [ImSep, 100_266],
    [EndOfPrompt, 100_276],
  ])

  return {
    tokenSplitRegex:
      /(?:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/giu,
    mergeableBytePairRanks,
    specialTokenMapping,
  }
}

export type GetMergeableRanksFn = (encodingName: EncodingName) => EncoderMap
export type GetMergeableRanksAsyncFn = (
  encodingName: EncodingName,
) => Promise<EncoderMap>

export function getEncodingParams(
  encodingName: EncodingName,
  getMergeableRanks: GetMergeableRanksFn,
): EncodingParams {
  const mergeableBytePairRanks = getMergeableRanks(encodingName)
  switch (encodingName.toLowerCase()) {
    case 'r50k_base':
      return R50KBase(mergeableBytePairRanks)

    case 'p50k_base':
      return P50KBase(mergeableBytePairRanks)

    case 'p50k_edit':
      return P50KEdit(mergeableBytePairRanks)

    case 'cl100k_base':
      return Cl100KBase(mergeableBytePairRanks)

    default:
      throw new Error(`Unknown encoding name: ${encodingName}`)
  }
}

export async function getModelParamsAsync(
  encodingName: EncodingName,
  getMergeableRanks: GetMergeableRanksAsyncFn,
): Promise<EncodingParams> {
  const mergeableBytePairRanks = await getMergeableRanks(encodingName)
  return getEncodingParams(encodingName, () => mergeableBytePairRanks)
}
