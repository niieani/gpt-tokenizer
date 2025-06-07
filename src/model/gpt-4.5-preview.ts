/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4.5-preview', () => bpeRanks, {name:"gpt-4.5-preview-2025-02-27",slug:"gpt-4.5-preview-2025-02-27",performance:4,latency:3,modalities:{input:["text","image"],output:["text"]},context_window:128000,max_output_tokens:16384,knowledge_cutoff:new Date(1696118400000),supported_features:["function_calling","structured_outputs","streaming","system_messages","evals","prompt_caching","image_input"],supported_endpoints:["chat_completions","responses","assistants","batch"],reasoning_tokens:false})
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
