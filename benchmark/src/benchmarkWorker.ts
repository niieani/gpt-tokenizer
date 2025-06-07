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
  const { tokenizerIndex, executionsMultiplier } = message
  const tokenizer = tokenizers[tokenizerIndex]
  const result: BenchmarkResult = {
    packageName: tokenizer.packageName,
    version: tokenizer.version,
    initialization: { timeMs: 0, memoryMb: 0, memoryRssMb: 0 },
    datasets: {},
    memoryChangeAfterRunMb: 0,
    memoryLeakWarning: false,
    datasetsAverage: { encodeTimeMs: 0, decodeTimeMs: 0, countTimeMs: 0 },
  }
  const testData = Object.entries(datasets)

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
    for (const [name, data] of testData) {
      // Calculate actual execution counts
      const encodeExecs = Math.max(
        1,
        Math.round(data.encodeExecutionsCount * executionsMultiplier),
      )
      const decodeExecs = Math.max(
        1,
        Math.round(data.decodeExecutionsCount * executionsMultiplier),
      )
      const countExecs = Math.max(
        1,
        Math.round(data.countTokensExecutionsCount * executionsMultiplier),
      )

      // Warm-up encode, decode and countTokens (using 5% of execution count)
      let encodedTokens: number[] | Uint8Array = []
      const warmUpCount = Math.max(1, Math.round(encodeExecs * 0.05))
      for (let i = 0; i < warmUpCount; i++) {
        encodedTokens = tokenizerModule.encode(data.text)
        tokenizerModule.decode(encodedTokens)
        tokenizerModule.countTokens(data.text)
      }

      // Encode benchmark
      const encodeTimes: number[] = new Array(encodeExecs)
      for (let i = 0; i < encodeExecs; i++) {
        const start = performance.now()
        encodedTokens = tokenizerModule.encode(data.text)
        const end = performance.now()
        encodeTimes[i] = end - start
      }
      const avgEncodeTime = encodeTimes.reduce((a, b) => a + b, 0) / encodeExecs

      // Decode benchmark
      const decodeTimes: number[] = new Array(decodeExecs)
      let decodedText: string = ''
      for (let i = 0; i < decodeExecs; i++) {
        const start = performance.now()
        decodedText = tokenizerModule.decode(encodedTokens)
        const end = performance.now()
        decodeTimes[i] = end - start
      }
      const avgDecodeTime = decodeTimes.reduce((a, b) => a + b, 0) / decodeExecs

      // Count tokens benchmark
      const countTokensTimes: number[] = new Array(countExecs)
      for (let i = 0; i < countExecs; i++) {
        const start = performance.now()
        tokenizerModule.countTokens(data.text)
        const end = performance.now()
        countTokensTimes[i] = end - start
      }
      const avgCountTokensTime =
        countTokensTimes.reduce((a, b) => a + b, 0) / countExecs

      // Verify correctness
      if (decodedText !== data.text) {
        console.warn(
          `Warning: Decoded text does not match original for dataset ${name}. \nExpected:\n${data.text}\nGot:\n${decodedText}`,
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
        countTokens: {
          averageTimeMs: parseFloat(avgCountTokensTime.toFixed(4)),
        },
        memoryChangeAfterExecutionsMb: parseFloat(
          (memoryUsed / 1024 / 1024).toFixed(2),
        ),
      }
    }

    // Calculate dataset averages
    const datasetCount = Object.keys(result.datasets).length
    const encodeTimeSum = Object.values(result.datasets).reduce(
      (sum, dataset) => sum + dataset.encode.averageTimeMs,
      0,
    )
    const decodeTimeSum = Object.values(result.datasets).reduce(
      (sum, dataset) => sum + dataset.decode.averageTimeMs,
      0,
    )
    const countTimeSum = Object.values(result.datasets).reduce(
      (sum, dataset) => sum + dataset.countTokens.averageTimeMs,
      0,
    )

    result.datasetsAverage = {
      encodeTimeMs: parseFloat((encodeTimeSum / datasetCount).toFixed(4)),
      decodeTimeMs: parseFloat((decodeTimeSum / datasetCount).toFixed(4)),
      countTimeMs: parseFloat((countTimeSum / datasetCount).toFixed(4)),
    }

    // Overall memory leak detection
    const finalMemoryUsage = memoryUsage()
    const totalMemoryIncrease =
      finalMemoryUsage.heapUsed - initMemoryUsageAfter.heapUsed
    result.memoryChangeAfterRunMb = parseFloat(
      (totalMemoryIncrease / 1024 / 1024).toFixed(2),
    )
    result.memoryLeakWarning = totalMemoryIncrease > 10 * 1024 * 1024 // 10 MB threshold

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
  runWorker({
    executionsMultiplier: 1,
    tokenizerIndex: tokenizers.length - 1,
  })
} else {
  process.on('message', runWorker)
}
