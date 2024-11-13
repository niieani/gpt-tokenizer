/* eslint-disable no-magic-numbers */
import type { RawBytePairRanks } from '../BytePairEncodingCore.js'
import type { EncodingParams } from '../modelParams.js'
import {
  EndOfPrompt,
  EndOfText,
  FimMiddle,
  FimPrefix,
  FimSuffix,
  ImEnd,
  ImSep,
  ImStart,
} from '../specialTokens.js'

export function O200KBase(
  bytePairRankDecoder: RawBytePairRanks,
): EncodingParams {
  const specialTokenMapping = new Map<string, number>([
    [EndOfText, 199_999],
    [FimPrefix, 200_000],
    [FimMiddle, 200_001],
    [FimSuffix, 200_002],
    [ImStart, 200_003],
    [ImEnd, 200_004],
    [ImSep, 200_005],
    [EndOfPrompt, 200_006],
  ])

  return {
    tokenSplitRegex:
      /(?:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/giu,
    bytePairRankDecoder,
    specialTokensEncoder: specialTokenMapping,
  }
}
