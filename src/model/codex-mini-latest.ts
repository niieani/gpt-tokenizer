/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../constants.js'
export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('codex-mini-latest', () => bpeRanks, {name:"codex-mini-latest",slug:"codex-mini-latest",performance:4,latency:3,modalities:{input:["text","image"],output:["text"]},context_window:200000,max_output_tokens:100000,knowledge_cutoff:new Date(1717200000000),supported_features:["streaming","structured_outputs","function_calling","image_input","prompt_caching","evals","stored_completions"],supported_endpoints:["responses"],reasoning_tokens:true})
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
