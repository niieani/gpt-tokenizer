import type {
  BytePairEncodingConfig,
  RawBytePairRanks,
} from './BytePairEncodingCore.js'
import { Cl100KBase } from './encodingParams/cl100k_base.js'
import { O200KBase } from './encodingParams/o200k_base.js'
import { P50KBase } from './encodingParams/p50k_base.js'
import { P50KEdit } from './encodingParams/p50k_edit.js'
import { R50KBase } from './encodingParams/r50k_base.js'
import type { EncodingName, ModelName } from './mapping.js'
import type { ModelSpec } from './modelTypes.js'

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
  modelSpec?: ModelSpec
}

export type GetMergeableRanksFn = (
  encodingName: EncodingName,
) => RawBytePairRanks

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
