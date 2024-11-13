/* eslint-disable no-magic-numbers */
import type { RawBytePairRanks } from '../BytePairEncodingCore.js'
import { type EncodingParams, tokenSplitRegex } from '../modelParams.js'
import { EndOfText } from '../specialTokens.js'

export function P50KBase(
  bytePairRankDecoder: RawBytePairRanks,
): EncodingParams {
  return {
    expectedVocabularySize: 50_281,
    tokenSplitRegex,
    bytePairRankDecoder,
    specialTokensEncoder: new Map<string, number>([[EndOfText, 50_256]]),
  }
}
