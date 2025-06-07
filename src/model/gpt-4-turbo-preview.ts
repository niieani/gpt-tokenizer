/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/cl100k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4-turbo-preview', () => bpeRanks, {name:"gpt-4-0125-preview",slug:"gpt-4-0125-preview",performance:2,latency:3,modalities:{input:["text"],output:["text"]},context_window:128000,max_output_tokens:4096,knowledge_cutoff:new Date(1701388800000),supported_features:["fine_tuning"],supported_endpoints:["chat_completions","responses","assistants"],reasoning_tokens:false,price_data:{main:{input:10,output:30},batch:{input:5,output:15}}})
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
