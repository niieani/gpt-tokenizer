/* eslint-disable import/extensions */
import bpeRanks from '../bpeRanks/cl100k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-3.5-turbo-finetune', () => bpeRanks)
const {
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
  encode,
  encodeGenerator,
  isWithinTokenLimit,
  encodeChat,
  encodeChatGenerator,
  vocabularySize,
} = api
export {
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
  encode,
  encodeChat,
  encodeChatGenerator,
  encodeGenerator,
  isWithinTokenLimit,
  vocabularySize,
}
// eslint-disable-next-line import/no-default-export
export default api