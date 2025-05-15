/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4.1-nano-2025-04-14', () => bpeRanks, {name:"gpt-4.1-nano-2025-04-14",slug:"gpt-4.1-nano-2025-04-14",performance:2,latency:5,modalities:{input:["text","image"],output:["text"]},context_window:1047576,max_output_tokens:32768,knowledge_cutoff:new Date(1717200000000),supported_features:["streaming","function_calling","file_search","file_uploads","structured_outputs","image_input","prompt_caching","fine_tuning"],supported_endpoints:["chat_completions","responses","assistants","batch","fine_tuning"],reasoning_tokens:false})
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
