import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export type { IncrementalTokenCounter } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'

const api = GptEncoding.getEncodingApi('o200k_base', () => bpeRanks)
const {
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
  encode,
  encodeGenerator,
  isWithinTokenLimit,
  countTokens,
  createIncrementalCounter,
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
  createIncrementalCounter,
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
export default api
