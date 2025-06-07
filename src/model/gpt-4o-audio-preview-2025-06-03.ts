/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4o-audio-preview-2025-06-03', () => bpeRanks, {name:"gpt-4o-audio-preview-2025-06-03",slug:"gpt-4o-audio-preview-2025-06-03",performance:3,latency:3,modalities:{input:["text","audio"],output:["text","audio"]},context_window:128000,max_output_tokens:16384,knowledge_cutoff:new Date(1696118400000),supported_features:["streaming","function_calling"],supported_endpoints:["chat_completions"],reasoning_tokens:false,price_data:{main:{input:10,output:30},batch:{input:5,output:15}}})
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
