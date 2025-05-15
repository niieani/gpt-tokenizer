/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/cl100k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-3.5', () => bpeRanks, {name:"gpt-3.5-0301",slug:"gpt-3-5-0301",performance:1,latency:2,modalities:{input:["text"],output:["text"]},context_window:16385,max_output_tokens:4096,knowledge_cutoff:new Date(1630454400000),supported_features:["fine_tuning"],supported_endpoints:["chat_completions","responses"],reasoning_tokens:false,price_data:{main:{input:1.5,output:2},batch:{input:.75,output:1}}})
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
