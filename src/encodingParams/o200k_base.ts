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
import { O200K_TOKEN_SPLIT_REGEX } from './constants.js'

const O200K_BASE_SPECIAL_TOKEN_ENTRIES = [
  [EndOfText, 199_999],
  [FimPrefix, 200_000],
  [FimMiddle, 200_001],
  [FimSuffix, 200_002],
  [ImStart, 200_003],
  [ImEnd, 200_004],
  [ImSep, 200_005],
  [EndOfPrompt, 200_006],
] as const satisfies readonly (readonly [string, number])[]

export const createO200KSpecialTokenMap = () =>
  new Map<string, number>(O200K_BASE_SPECIAL_TOKEN_ENTRIES)

export function O200KBase(
  bytePairRankDecoder: RawBytePairRanks,
): EncodingParams {
  return {
    tokenSplitRegex: O200K_TOKEN_SPLIT_REGEX,
    bytePairRankDecoder,
    specialTokensEncoder: createO200KSpecialTokenMap(),
  }
}
