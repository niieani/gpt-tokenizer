/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('o3', () => bpeRanks, {name:"o3-2025-04-16",slug:"o3-2025-04-16",performance:5,latency:1,modalities:{input:["text","image"],output:["text"]},context_window:200000,max_output_tokens:100000,knowledge_cutoff:new Date(1717200000000),supported_features:["streaming","structured_outputs","file_search","function_calling","file_uploads","image_input","prompt_caching","evals","stored_completions"],supported_endpoints:["chat_completions","responses","batch"],reasoning_tokens:true,price_data:{main:{input:2,cached_output:.5,output:8},batch:{input:1,output:4}}})
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
