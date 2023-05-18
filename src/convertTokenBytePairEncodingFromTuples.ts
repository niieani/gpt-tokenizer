import { base64 } from 'rfc4648'
import { EncoderMap } from './EncoderMap.js'

export function convertTokenBytePairEncodingFromTuples(
  tuples: readonly [tokenBase64: string, rank: number][],
): EncoderMap {
  const encoder = tuples.flatMap(([token, rank]) => {
    if (!token || token.length === 0) return []
    return [[base64.parse(token), rank]] as const
  })
  return new EncoderMap(encoder)
}

export function convertTokenBytePairEncodingFromTiktokenFile(input: string) {
  const lines = input.split('\n')
  const encoder = lines.flatMap((x) => {
    if (x.length === 0) return []
    const [token, rank] = x.split(' ')
    if (!token || token.length === 0 || !rank || rank.length === 0) return []
    return [[base64.parse(token), Number.parseInt(rank, 10)]] as const
  })
  return new EncoderMap(encoder)
}
