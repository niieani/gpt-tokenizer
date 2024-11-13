import type {
  BytePairEncodingConfig,
  RawBytePairRanks,
} from './BytePairEncodingCore.js'
import { Cl100KBase } from './encodingParams/Cl100KBase.js'
import { O200KBase } from './encodingParams/O200KBase.js'
import { P50KBase } from './encodingParams/P50KBase.js'
import { P50KEdit } from './encodingParams/P50KEdit.js'
import { R50KBase } from './encodingParams/R50KBase.js'
import type { EncodingName, ModelName } from './mapping.js'

export interface EncodingParams extends BytePairEncodingConfig {
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
  specialTokensEncoder: Map<string, number>
  modelName?: ModelName
}

export const tokenSplitRegex =
  /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu

export type GetMergeableRanksFn = (
  encodingName: EncodingName,
) => RawBytePairRanks
export type GetMergeableRanksAsyncFn = (
  encodingName: EncodingName,
) => Promise<RawBytePairRanks>

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

    case 'o200k_base':
      return O200KBase(mergeableBytePairRanks)

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
