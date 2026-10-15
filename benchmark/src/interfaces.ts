export type Encoding = 'cl100k_base' | 'o200k_base'
export type Tokens = number[] | Uint32Array | Int32Array
export interface Tokenizer {
  encode: (text: string) => Tokens | Promise<Tokens>
  decode: (tokens: Tokens) => string | Promise<string>
  countTokens: (text: string) => number | Promise<number>
  free?: () => void
}
export interface Adapter {
  id: string
  packageName: string
  version: string
  encodings: Encoding[]
  async?: boolean
  load: (encoding: Encoding) => Promise<Tokenizer>
}
export interface WorkerInput {
  id: string
  encoding: Encoding
  mode: 'verify' | 'measure'
  minMs: number
  warmupMs?: number
  warmupCalls?: number
}
export interface Memory {
  heapUsed: number
  rss: number
  external: number
  arrayBuffers: number
}
export interface Timing {
  ms: number
  calls: number
  elapsedMs: number
  warmup?: { ms: number; calls: number; elapsedMs: number }
}
export interface Sample {
  id: string
  encoding: Encoding
  initialization: { ms: number; memory: Memory }
  datasets: Record<string, Record<'encode' | 'decode' | 'count', Timing>>
  retained: Memory
  peakRssMiB: number
  checksum: number
}
export interface Check {
  dataset: string
  tokens: number
  actualTokens: number
  firstDifference: number
  expectedToken?: number
  actualToken?: number
  roundTrip: boolean
  count: boolean
  error?: string
}
export interface Verification {
  id: string
  encoding: Encoding
  checks: Check[]
  passed: boolean
}
