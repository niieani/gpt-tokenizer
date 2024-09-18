/* eslint-disable import/extensions */
import encoder from '../encodings/cl100k_base.js'
import { GptEncoding } from '../GptEncoding.js'

export * from '../specialTokens.js'

const api = GptEncoding.getEncodingApi('cl100k_base', () => encoder)
const {
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
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
}
// eslint-disable-next-line import/no-default-export
export default api
