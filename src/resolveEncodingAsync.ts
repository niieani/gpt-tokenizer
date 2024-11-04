/* eslint-disable import/extensions */
import type { RawBytePairRanks } from './BytePairEncodingCore.js'
import type { EncodingName } from './mapping.js'

export const resolveEncodingAsync = async (
  encoding: EncodingName,
): Promise<RawBytePairRanks> => {
  switch (encoding) {
    case 'r50k_base':
      return import('./bpeRanks/r50k_base.js').then(
        ({ default: rawBytePairRanks }) => rawBytePairRanks,
      )
    case 'p50k_base':
    case 'p50k_edit':
      return import('./bpeRanks/p50k_base.js').then(
        ({ default: rawBytePairRanks }) => rawBytePairRanks,
      )
    case 'cl100k_base':
      return import('./bpeRanks/cl100k_base.js').then(
        ({ default: rawBytePairRanks }) => rawBytePairRanks,
      )
    case 'o200k_base':
      return import('./bpeRanks/o200k_base.js').then(
        ({ default: rawBytePairRanks }) => rawBytePairRanks,
      )
    default: {
      throw new Error(`Unknown encoding name: ${encoding}`)
    }
  }
}
