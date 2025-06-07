/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('o1-pro', () => bpeRanks, {name:"o1-pro-2025-03-19",slug:"o1-pro-2025-03-19",performance:4,latency:1,modalities:{input:["text","image"],output:["text"]},context_window:200000,max_output_tokens:100000,knowledge_cutoff:new Date(1696118400000),supported_features:["structured_outputs","function_calling","image_input"],supported_endpoints:["responses","batch"],reasoning_tokens:true,price_data:{main:{input:150,output:600},batch:{input:75,output:300}}})
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
