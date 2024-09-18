/* eslint-disable import/extensions */
import encoder from '../encodings/cl100k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4-1106-preview', () => encoder)
const {
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
  toggleDecodeCache,
  encode,
  encodeGenerator,
  isWithinTokenLimit,
  encodeChat,
  encodeChatGenerator,
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
  toggleDecodeCache,
}
// eslint-disable-next-line import/no-default-export
export default api
