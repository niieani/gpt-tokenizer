// interfaces.ts
export interface TokenizerBenchmark<T extends number[] | Uint8Array = any> {
  packageName: string
  version: string
  load: () => Promise<{
    encode: (input: string) => T
    decode: (tokens: T) => string
  }>
}

export interface WorkerInput {
  tokenizerIndex: number
  executions: number
}

export interface WorkerOutput {
  success: boolean
  data?: BenchmarkResult
  error?: string
}

export interface BenchmarkResult {
  packageName: string
  version: string
  initialization: {
    timeMs: number
    memoryMb: number
    memoryRssMb: number
  }
  datasets: Record<string, DatasetResult>
  memoryChangeAfterRunMb: number
  memoryLeakWarning: boolean
  datasetsAverage: {
    encodeTimeMs: number
    decodeTimeMs: number
  }
  // For re-run rows, keep track of the change
  change?: {
    initTimeMs?: number
    initMemoryMb?: number
    initMemoryRssMb?: number
    encodeTimeMs?: number
    decodeTimeMs?: number
    memoryChangeAfterRunMb?: number
  }
}

interface DatasetResult {
  encode: {
    averageTimeMs: number
  }
  decode: {
    averageTimeMs: number
  }
  memoryChangeAfterExecutionsMb: number
}
