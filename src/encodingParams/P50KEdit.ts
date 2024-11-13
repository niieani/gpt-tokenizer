/* eslint-disable no-magic-numbers */
import type { RawBytePairRanks } from '../BytePairEncodingCore.js'
import { type EncodingParams, tokenSplitRegex } from '../modelParams.js'
import { EndOfText, FimMiddle, FimPrefix, FimSuffix } from '../specialTokens.js'

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
    tokenSplitRegex,
    bytePairRankDecoder,
    specialTokensEncoder: specialTokenMapping,
  }
}
