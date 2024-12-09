/* eslint-disable no-magic-numbers */
import type { RawBytePairRanks } from '../BytePairEncodingCore.js'
import { type EncodingParams } from '../modelParams.js'
import { EndOfText } from '../specialTokens.js'
import { R50K_TOKEN_SPLIT_REGEX } from './constants.js'

export function R50KBase(
  bytePairRankDecoder: RawBytePairRanks,
): EncodingParams {
  return {
    expectedVocabularySize: 50_257,
    tokenSplitRegex: R50K_TOKEN_SPLIT_REGEX,
    bytePairRankDecoder,
    specialTokensEncoder: new Map<string, number>([[EndOfText, 50_256]]),
  }
}
