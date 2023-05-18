/* eslint-disable import/extensions */
import { convertTokenBytePairEncodingFromTuples } from './convertTokenBytePairEncodingFromTuples.js'
import type { EncoderMap } from './EncoderMap.js'
import cl100k from './encodings/cl100k_base.js'
import p50k from './encodings/p50k_base.js'
import r50k from './encodings/r50k_base.js'
import type { EncodingName } from './mapping.js'

export const resolveEncoding = (encoding: EncodingName): EncoderMap => {
  switch (encoding) {
    case 'r50k_base':
      return convertTokenBytePairEncodingFromTuples(r50k)
    case 'p50k_base':
    case 'p50k_edit':
      return convertTokenBytePairEncodingFromTuples(p50k)
    case 'cl100k_base':
      return convertTokenBytePairEncodingFromTuples(cl100k)
    default: {
      throw new Error(`Unknown encoding name: ${encoding}`)
    }
  }
}
