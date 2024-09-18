/* eslint-disable import/extensions */
import encoder from '../encodings/o200k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../specialTokens.js'
// prettier-ignore
const api = GptEncoding.getEncodingApiForModel('gpt-4o-mini-2024-07-18', () => encoder)
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
