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

export function Cl100KBase(
  bytePairRankDecoder: RawBytePairRanks,
): EncodingParams {
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
    bytePairRankDecoder,
    specialTokensEncoder: specialTokenMapping,
  }
}
