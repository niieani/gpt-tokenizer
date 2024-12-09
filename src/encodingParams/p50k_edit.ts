/* eslint-disable no-magic-numbers */
import type { RawBytePairRanks } from '../BytePairEncodingCore.js'
import { type EncodingParams } from '../modelParams.js'
import { EndOfText, FimMiddle, FimPrefix, FimSuffix } from '../specialTokens.js'
import { R50K_TOKEN_SPLIT_REGEX } from './constants.js'

export function P50KEdit(
  bytePairRankDecoder: RawBytePairRanks,
): EncodingParams {
  const specialTokenMapping = new Map<string, number>([
    [EndOfText, 50_256],
    [FimPrefix, 50_281],
    [FimMiddle, 50_282],
    [FimSuffix, 50_283],
  ])

  return {
    tokenSplitRegex: R50K_TOKEN_SPLIT_REGEX,
    bytePairRankDecoder,
    specialTokensEncoder: specialTokenMapping,
  }
}
