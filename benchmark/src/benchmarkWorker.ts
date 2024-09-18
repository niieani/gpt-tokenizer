// benchmarkWorker.ts
import type {
  BenchmarkResult,
  WorkerInput,
  WorkerOutput,
} from './interfaces.js'
import { datasets } from './datasets.js'
import { performance } from 'perf_hooks'
import { memoryUsage } from 'process'
import { tokenizers } from './tokenizers.js'

const runWorker = async (message: WorkerInput) => {
  const { tokenizerIndex, executions } = message
  const tokenizer = tokenizers[tokenizerIndex]
  const result: BenchmarkResult = {
    packageName: tokenizer.packageName,
    version: tokenizer.version,
    initialization: { timeMs: 0, memoryMb: 0, memoryRssMb: 0 },
    datasets: {},
    memoryChangeAfterRunMb: 0,
    memoryLeakWarning: false,
    datasetsAverage: { encodeTimeMs: 0, decodeTimeMs: 0 },
  }
  const encodeTimes: number[] = new Array(executions)
  const decodeTimes: number[] = new Array(executions)
  try {
    const initMemoryUsageBefore = memoryUsage()
    const initStart = performance.now()
    const tokenizerModule = await tokenizer.load()
    const initEnd = performance.now()

    // Invoke garbage collection
    if (global.gc) {
      global.gc()
    }

    const initMemoryUsageAfter = memoryUsage()
    const initTime = initEnd - initStart
    const initMemory =
      initMemoryUsageAfter.heapUsed - initMemoryUsageBefore.heapUsed
    const initMemoryTotal = initMemoryUsageAfter.rss - initMemoryUsageBefore.rss
    result.initialization = {
      timeMs: parseFloat(initTime.toFixed(2)),
      memoryMb: parseFloat((initMemory / 1024 / 1024).toFixed(2)),
      memoryRssMb: parseFloat((initMemoryTotal / 1024 / 1024).toFixed(2)),
    }

    // Prepare datasets
    const testData = Object.entries(datasets)
    for (const [name, text] of testData) {
      // Warm-up encode and decode
      let encodedTokens: number[] | Uint8Array = []
      for (let i = 0; i < 50; i++) {
        encodedTokens = tokenizerModule.encode(text)
        tokenizerModule.decode(encodedTokens)
      }

      // Encode benchmark
      for (let i = 0; i < executions; i++) {
        const start = performance.now()
        encodedTokens = tokenizerModule.encode(text)
        const end = performance.now()
        encodeTimes[i] = end - start
      }
      const avgEncodeTime = encodeTimes.reduce((a, b) => a + b, 0) / executions

      // Decode benchmark
      let decodedText: string = ''
      for (let i = 0; i < executions; i++) {
        const start = performance.now()
        decodedText = tokenizerModule.decode(encodedTokens)
        const end = performance.now()
        decodeTimes[i] = end - start
      }
      const avgDecodeTime = decodeTimes.reduce((a, b) => a + b, 0) / executions

      // Verify correctness
      if (decodedText !== text) {
        console.warn(
          `Warning: Decoded text does not match original for dataset ${name}. \nExpected:\n${text}\nGot:\n${decodedText}`,
        )
      }

      // Invoke garbage collection
      if (global.gc) {
        global.gc()
      }

      // Measure memory after executions
      const memoryUsageAfter = memoryUsage()
      const memoryUsed =
        memoryUsageAfter.heapUsed - initMemoryUsageAfter.heapUsed
      result.datasets[name] = {
        encode: {
          averageTimeMs: parseFloat(avgEncodeTime.toFixed(4)),
        },
        decode: {
          averageTimeMs: parseFloat(avgDecodeTime.toFixed(4)),
        },
        memoryChangeAfterExecutionsMb: parseFloat(
          (memoryUsed / 1024 / 1024).toFixed(2),
        ),
      }
    }

    // Overall memory leak detection
    const finalMemoryUsage = memoryUsage()
    const totalMemoryIncrease =
      finalMemoryUsage.heapUsed - initMemoryUsageAfter.heapUsed
    result.memoryChangeAfterRunMb = parseFloat(
      (totalMemoryIncrease / 1024 / 1024).toFixed(2),
    )
    result.memoryLeakWarning = totalMemoryIncrease > 1 * 1024 * 1024 // 1 MB threshold

    // Send the result back to the parent process
    const output: WorkerOutput = {
      success: true,
      data: result,
    }
    process.send?.(output)
  } catch (error) {
    const output: WorkerOutput = {
      success: false,
      error: (error as Error).message,
    }
    process.send?.(output)
  } finally {
    process.exit()
  }
}

if (process.argv.length > 2) {
  runWorker({ executions: 100000, tokenizerIndex: tokenizers.length - 1 })
} else {
  process.on('message', runWorker)
}
