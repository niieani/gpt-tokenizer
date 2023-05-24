/* eslint-disable import/extensions */
import { convertTokenBytePairEncodingFromTuples } from './convertTokenBytePairEncodingFromTuples.js'
import type { EncoderMap } from './EncoderMap.js'
import type { EncodingName } from './mapping.js'

export const resolveEncodingAsync = async (
  encoding: EncodingName,
): Promise<EncoderMap> => {
  switch (encoding) {
    case 'r50k_base':
      return convertTokenBytePairEncodingFromTuples(
        await import('./encodings/r50k_base.js').then(
          ({ default: encodingTuples }) => encodingTuples,
        ),
      )
    case 'p50k_base':
    case 'p50k_edit':
      return convertTokenBytePairEncodingFromTuples(
        await import('./encodings/p50k_base.js').then(
          ({ default: encodingTuples }) => encodingTuples,
        ),
      )
    case 'cl100k_base':
      return convertTokenBytePairEncodingFromTuples(
        await import('./encodings/cl100k_base.js').then(
          ({ default: encodingTuples }) => encodingTuples,
        ),
      )
    default: {
      throw new Error(`Unknown encoding name: ${encoding}`)
    }
  }
}
