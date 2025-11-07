/* eslint-disable no-magic-numbers */
import type { RawBytePairRanks } from '../BytePairEncodingCore.js'
import type { EncodingParams } from '../modelParams.js'
import {
  EndOfPrompt,
  EndOfText,
  HarmonyCall,
  HarmonyChannel,
  HarmonyConstrain,
  HarmonyEnd,
  HarmonyMessage,
  HarmonyReturn,
  HarmonyStart,
  HarmonyStartOfText,
} from '../specialTokens.js'
import { O200K_TOKEN_SPLIT_REGEX } from './constants.js'

const RESERVED_TOKEN_RANGE_START = 200_013
const RESERVED_TOKEN_RANGE_END = 201_088 // exclusive upper bound per tiktoken

const STATIC_SPECIAL_TOKEN_ENTRIES = [
  [HarmonyStartOfText, 199_998],
  [EndOfText, 199_999],
  ['<|reserved_200000|>', 200_000],
  ['<|reserved_200001|>', 200_001],
  [HarmonyReturn, 200_002],
  [HarmonyConstrain, 200_003],
  ['<|reserved_200004|>', 200_004],
  [HarmonyChannel, 200_005],
  [HarmonyStart, 200_006],
  [HarmonyEnd, 200_007],
  [HarmonyMessage, 200_008],
  ['<|reserved_200009|>', 200_009],
  ['<|reserved_200010|>', 200_010],
  ['<|reserved_200011|>', 200_011],
  [HarmonyCall, 200_012],
] as const satisfies readonly (readonly [string, number])[]

export function O200KHarmony(
  bytePairRankDecoder: RawBytePairRanks,
): EncodingParams {
  const specialTokensEncoder = new Map<string, number>(
    STATIC_SPECIAL_TOKEN_ENTRIES,
  )

  for (
    let tokenId = RESERVED_TOKEN_RANGE_START;
    tokenId < RESERVED_TOKEN_RANGE_END;
    tokenId += 1
  ) {
    specialTokensEncoder.set(`<|reserved_${tokenId}|>`, tokenId)
  }

  specialTokensEncoder.set(EndOfPrompt, 200_018)

  return {
    tokenSplitRegex: O200K_TOKEN_SPLIT_REGEX,
    bytePairRankDecoder,
    specialTokensEncoder,
    chatFormatter: 'harmony',
  }
}
