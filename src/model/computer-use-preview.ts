/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('computer-use-preview', () => bpeRanks, {name:"computer-use-preview-2025-03-11",slug:"computer-use-preview-2025-03-11",performance:2,latency:2,modalities:{input:["text","image"],output:["text"]},context_window:8192,max_output_tokens:1024,knowledge_cutoff:new Date(1696118400000),supported_features:["function_calling"],supported_endpoints:["responses","batch"],reasoning_tokens:true,price_data:{main:{input:3,output:12},batch:{input:1.5,output:6}}})
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
