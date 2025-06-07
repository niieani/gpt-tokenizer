/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4o-mini-2024-07-18', () => bpeRanks, {name:"gpt-4o-mini-2024-07-18",slug:"gpt-4o-mini-2024-07-18",performance:2,latency:4,modalities:{input:["text","image"],output:["text"]},context_window:128000,max_output_tokens:16384,knowledge_cutoff:new Date(1696118400000),supported_features:["streaming","function_calling","fine_tuning","file_search","file_uploads","web_search","structured_outputs","image_input"],supported_endpoints:["chat_completions","responses","assistants","batch","fine_tuning"],reasoning_tokens:false})
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
