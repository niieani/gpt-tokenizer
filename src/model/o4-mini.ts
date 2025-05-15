/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('o4-mini', () => bpeRanks, {name:"o4-mini-2025-04-16",slug:"o4-mini-2025-04-16",performance:4,latency:3,modalities:{input:["text","image"],output:["text"]},context_window:200000,max_output_tokens:100000,knowledge_cutoff:new Date(1717200000000),supported_features:["streaming","structured_outputs","function_calling","file_search","file_uploads","image_input","prompt_caching","evals","stored_completions","fine_tuning"],supported_endpoints:["chat_completions","responses","batch","fine_tuning"],reasoning_tokens:true})
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
