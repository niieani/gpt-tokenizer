/* eslint-disable import/extensions */
import cl100k from './bpeRanks/cl100k_base.js'
import o200k from './bpeRanks/o200k_base.js'
import p50k from './bpeRanks/p50k_base.js'
import r50k from './bpeRanks/r50k_base.js'
import type { RawBytePairRanks } from './BytePairEncodingCore.js'
import type { EncodingName } from './mapping.js'

export const resolveEncoding = (encoding: EncodingName): RawBytePairRanks => {
  switch (encoding) {
    case 'r50k_base':
      return r50k
    case 'p50k_base':
    case 'p50k_edit':
      return p50k
    case 'cl100k_base':
      return cl100k
    case 'o200k_base':
      return o200k
    default: {
      throw new Error(`Unknown encoding name: ${encoding}`)
    }
  }
}
