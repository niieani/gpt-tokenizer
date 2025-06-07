/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('o1-mini', () => bpeRanks, {name:"o1-mini-2024-09-12",slug:"o1-mini-2024-09-12",performance:3,latency:2,modalities:{input:["text"],output:["text"]},context_window:128000,max_output_tokens:65536,knowledge_cutoff:new Date(1696118400000),supported_features:["streaming","file_search","file_uploads"],supported_endpoints:["chat_completions","assistants"],reasoning_tokens:true,price_data:{main:{input:10,output:30},batch:{input:5,output:15}}})
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
