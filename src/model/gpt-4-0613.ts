/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/cl100k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4-0613', () => bpeRanks, {name:"gpt-4-0613",slug:"gpt-4-0613",performance:2,latency:3,modalities:{input:["text"],output:["text"]},context_window:8192,max_output_tokens:8192,knowledge_cutoff:new Date(1701388800000),supported_features:["fine_tuning","streaming"],supported_endpoints:["chat_completions","responses","assistants","batch","fine_tuning"],reasoning_tokens:false,price_data:{main:{input:30,output:60},batch:{input:15,output:30}}})
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
