/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4o-mini-2024-07-18', () => bpeRanks)
const {
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
  encode,
  encodeGenerator,
  isWithinTokenLimit,
  countTokens,
  encodeChat,
  encodeChatGenerator,
  vocabularySize,
  setMergeCacheSize,
  clearMergeCache,
  estimateCost,
} = api
export {
  clearMergeCache,
  countTokens,
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
  encode,
  encodeChat,
  encodeChatGenerator,
  encodeGenerator,
  estimateCost,
  isWithinTokenLimit,
  setMergeCacheSize,
  vocabularySize,
}
// eslint-disable-next-line import/no-default-export
export default api
