/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('o3-mini', () => bpeRanks, {name:"o3-mini-2025-01-31",slug:"o3-mini-2025-01-31",performance:4,latency:3,modalities:{input:["text"],output:["text"]},context_window:200000,max_output_tokens:100000,knowledge_cutoff:new Date(1696118400000),supported_features:["streaming","structured_outputs","function_calling","file_search","file_uploads"],supported_endpoints:["chat_completions","responses","assistants","batch"],reasoning_tokens:true})
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
