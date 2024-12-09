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
import { CL_AND_O_TOKEN_SPLIT_PATTERN } from './constants.js'

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
    tokenSplitRegex: CL_AND_O_TOKEN_SPLIT_PATTERN,
    bytePairRankDecoder,
    specialTokensEncoder: specialTokenMapping,
  }
}
