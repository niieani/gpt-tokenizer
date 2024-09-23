import { fork } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { tokenizers } from './tokenizers.js'
import type { BenchmarkResult, WorkerInput } from './interfaces.js'
import chalk from 'chalk'
import Table from 'cli-table3'
import readline from 'readline'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// Utility function to calculate average
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}

// Define the number of executions for performance testing
const EXECUTIONS = 10000

// Define the number of iterations for averaging
const ITERATIONS = 3

// Function to run a single benchmark iteration in a child process
const runSingleBenchmark = (
  tokenizerIndex: number,
  executions: number,
): Promise<BenchmarkResult> => {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, 'benchmarkWorker.js')
    const child = fork(workerPath, [], {
      execArgv: ['--expose-gc'],
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })
    if (!child.pid) {
      reject(new Error('Failed to spawn child process'))
      return
    }
    const message: WorkerInput = { tokenizerIndex, executions }
    child.send(message)
    child.on('message', (msg: any) => {
      // Changed to any to avoid TypeScript issues
      if (msg.success && msg.data) {
        resolve(msg.data)
      } else if (msg.error) {
        reject(new Error(msg.error))
      } else {
        reject(new Error('Unknown error in worker'))
      }
    })
    child.on('error', (err) => {
      reject(err)
    })
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

// Function to load the latest benchmark results from the results directory
const loadLastResults = async (): Promise<BenchmarkResult[] | null> => {
  const resultsDir = path.resolve(__dirname, '..', 'results')
  try {
    const files = await fs.readdir(resultsDir, { withFileTypes: true })
    const jsonFiles = files.filter(
      (file) =>
        file.name.startsWith('benchmark-results-') &&
        file.name.endsWith('.json'),
    )
    if (jsonFiles.length === 0) return null
    // Get file stats and sort files by modification time descending
    const filesWithStats = await Promise.all(
      jsonFiles.map(async (file) => {
        const stat = await fs.stat(path.join(resultsDir, file.name))
        return { file, mtimeMs: stat.mtimeMs }
      }),
    )
    const sortedFiles = filesWithStats
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .map((fileWithStat) => fileWithStat.file.name)
    const latestFile = sortedFiles[0]
    const data = await fs.readFile(path.join(resultsDir, latestFile), 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.warn(chalk.yellow('No previous benchmark results found.'))
    return null
  }
}

// Function to display the benchmark results in a unified table with highlighted best and worst metrics
const displayUnifiedResults = (results: BenchmarkResult[]) => {
  if (results.length === 0) {
    console.log(chalk.yellow('No benchmark results to display.'))
    return
  }

  // Define the metrics and whether lower is better
  const metrics = {
    initTime: {
      label: 'Init Time (ms)',
      better: 'lower' as const,
      precision: 2,
    },
    initMemory: {
      label: 'Init Memory (MB)',
      better: 'lower' as const,
      precision: 2,
    },
    initMemoryRss: {
      label: 'Init Mem RSS (MB)',
      better: 'lower' as const,
      precision: 2,
    },
    encodeTimeAvg: {
      label: 'Encode Avg (ms)',
      better: 'lower' as const,
      precision: 4,
    }, // Increased precision
    decodeTimeAvg: {
      label: 'Decode Avg (ms)',
      better: 'lower' as const,
      precision: 4,
    }, // Increased precision
    memoryIncrease: {
      label: 'Memory Increase (MB)',
      better: 'lower' as const,
      precision: 2,
    },
  }

  // Initialize min and max for each metric
  const minMetrics: Record<string, number> = {}
  const maxMetrics: Record<string, number> = {}
  for (const key in metrics) {
    const values = results.map((r) => {
      switch (key) {
        case 'initTime':
          return r.initialization.timeMs
        case 'initMemory':
          return r.initialization.memoryMb
        case 'initMemoryRss':
          return r.initialization.memoryRssMb
        case 'encodeTimeAvg':
          return r.datasetsAverage?.encodeTimeMs || 0
        case 'decodeTimeAvg':
          return r.datasetsAverage?.decodeTimeMs || 0
        case 'memoryIncrease':
          return r.memoryChangeAfterRunMb
        default:
          return 0
      }
    })
    minMetrics[key] = Math.min(...values)
    maxMetrics[key] = Math.max(...values)
  }

  // Create the table
  const table = new Table({
    head: [
      chalk.blue('Package'),
      chalk.blue('Version'),
      chalk.green('Init\n(ms)'),
      chalk.green('Init\nMem ⬆'),
      chalk.green('Init\nMem RSS'),
      chalk.yellow('Encode\nAvg (ms)'),
      chalk.yellow('Decode\nAvg (ms)'),
      chalk.red('Memory\nIncrease'),
      chalk.red('Mem\nLeak?'),
    ],
    wordWrap: true,
  })

  results.forEach((res) => {
    // Prepare each metric with highlighting
    const row: string[] = [res.packageName, res.version]
    // Helper to apply highlighting and include change if present
    const applyHighlight = (
      value: number,
      key: keyof typeof metrics,
      change?: number,
    ): string => {
      let displayValue = `${value.toFixed(metrics[key].precision)}` // Use dynamic precision
      if (change !== undefined) {
        const sign = change >= 0 ? '+' : ''
        displayValue += `\n${sign}${change.toFixed(2)}%`
      }
      if (metrics[key].better === 'lower') {
        if (value === minMetrics[key]) {
          return chalk.bgGreen.black(displayValue)
        }
        if (value === maxMetrics[key]) {
          return chalk.bgRed.white(displayValue)
        }
      } else {
        // If higher is better, adjust accordingly
        if (value === maxMetrics[key]) {
          return chalk.bgGreen.black(displayValue)
        }
        if (value === minMetrics[key]) {
          return chalk.bgRed.white(displayValue)
        }
      }
      return displayValue
    }

    // Initialize change values if present
    const changes = res.change || {}
    row.push(
      applyHighlight(res.initialization.timeMs, 'initTime', changes.initTimeMs),
    )
    row.push(
      applyHighlight(
        res.initialization.memoryMb,
        'initMemory',
        changes.initMemoryMb,
      ),
    )
    row.push(
      applyHighlight(
        res.initialization.memoryRssMb,
        'initMemoryRss',
        changes.initMemoryRssMb,
      ),
    )
    row.push(
      applyHighlight(
        res.datasetsAverage?.encodeTimeMs || 0,
        'encodeTimeAvg',
        changes.encodeTimeMs,
      ),
    )
    row.push(
      applyHighlight(
        res.datasetsAverage?.decodeTimeMs || 0,
        'decodeTimeAvg',
        changes.decodeTimeMs,
      ),
    )
    row.push(
      applyHighlight(
        res.memoryChangeAfterRunMb,
        'memoryIncrease',
        changes.memoryChangeAfterRunMb,
      ),
    )
    row.push(
      res.memoryLeakWarning
        ? chalk.bgRed.white('Yes')
        : chalk.bgGreen.black('No'),
    )
    table.push(row)
  })

  console.log(table.toString())
}

// Function to run benchmarks for all tokenizers or a specific one
const runBenchmarks = async (
  specificTokenizerIndex: number | null = null,
): Promise<BenchmarkResult[]> => {
  const allResults: BenchmarkResult[] = []
  // Determine which tokenizers to benchmark
  const tokenizerIndices =
    specificTokenizerIndex !== null
      ? [specificTokenizerIndex]
      : tokenizers.map((_, index) => index)
  for (const tokenizerIndex of tokenizerIndices) {
    const tokenizer = tokenizers[tokenizerIndex]
    console.log(
      chalk.cyanBright(
        `\nBenchmarking ${tokenizer.packageName} v${tokenizer.version}...`,
      ),
    )
    const tokenizerResults: BenchmarkResult[] = []
    for (let i = 0; i < ITERATIONS; i++) {
      console.log(`  ${chalk.yellow(`Iteration ${i + 1}/${ITERATIONS}`)}`)
      try {
        const result = await runSingleBenchmark(tokenizerIndex, EXECUTIONS)
        tokenizerResults.push(result)
      } catch (error) {
        console.error(
          chalk.red(`  Error in iteration ${i + 1}:`),
          (error as Error).message,
        )
      }
    }
    if (tokenizerResults.length > 0) {
      // Aggregate results
      const aggregated: Omit<BenchmarkResult, 'datasetsAverage'> = {
        packageName: tokenizerResults[0].packageName,
        version: tokenizerResults[0].version,
        initialization: {
          timeMs: calculateAverage(
            tokenizerResults.map((r) => r.initialization.timeMs),
          ),
          memoryMb: calculateAverage(
            tokenizerResults.map((r) => r.initialization.memoryMb),
          ),
          memoryRssMb: calculateAverage(
            tokenizerResults.map((r) => r.initialization.memoryRssMb),
          ),
        },
        datasets: {},
        memoryChangeAfterRunMb: calculateAverage(
          tokenizerResults.map((r) => r.memoryChangeAfterRunMb),
        ),
        memoryLeakWarning: tokenizerResults.some((r) => r.memoryLeakWarning),
      }
      // Aggregate per-dataset results
      const datasetNames = Object.keys(tokenizerResults[0].datasets)
      for (const dataset of datasetNames) {
        const encodeTimes = tokenizerResults.map(
          (r) => r.datasets[dataset].encode.averageTimeMs,
        )
        const decodeTimes = tokenizerResults.map(
          (r) => r.datasets[dataset].decode.averageTimeMs,
        )
        const memoryChanges = tokenizerResults.map(
          (r) => r.datasets[dataset].memoryChangeAfterExecutionsMb,
        )
        aggregated.datasets[dataset] = {
          encode: {
            averageTimeMs: calculateAverage(encodeTimes),
          },
          decode: {
            averageTimeMs: calculateAverage(decodeTimes),
          },
          memoryChangeAfterExecutionsMb: calculateAverage(memoryChanges),
        }
      }
      // Calculate overall averages for display
      allResults.push({
        ...aggregated,
        datasetsAverage: {
          encodeTimeMs: calculateAverage(
            tokenizerResults.flatMap((r) =>
              Object.values(r.datasets).map((d) => d.encode.averageTimeMs),
            ),
          ),
          decodeTimeMs: calculateAverage(
            tokenizerResults.flatMap((r) =>
              Object.values(r.datasets).map((d) => d.decode.averageTimeMs),
            ),
          ),
        },
      })
    }
  }
  return allResults
}

// Function to save results to a JSON file
const saveResults = async (results: BenchmarkResult[]) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const resultsDir = path.resolve(__dirname, '..', 'results')
  await fs.mkdir(resultsDir, { recursive: true })
  const resultsPath = path.join(
    resultsDir,
    `benchmark-results-${timestamp}.json`,
  )
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2))
  console.log(chalk.green(`\nBenchmark results saved to ${resultsPath}`))
}

// Function to find the index of 'gpt-tokenizer' version 3
const findGptTokenizerV3Index = (): number => {
  return tokenizers.findIndex(
    (t) => t.packageName === 'gpt-tokenizer' && t.version === 'local',
  )
}

// Function to handle watch mode using keypress events
const watchMode = async (previousResults: BenchmarkResult[] | null) => {
  let currentResults = previousResults || []
  displayUnifiedResults(currentResults)
  // Instructions
  console.log(chalk.blue('\nWatch Mode Controls:'))
  console.log(chalk.blue('  Press Enter to re-run "gpt-tokenizer" v3.'))
  console.log(chalk.blue('  Press "d" to re-run ALL benchmarks.'))
  console.log(chalk.blue('  Press CTRL+C to exit.\n'))

  // Enable keypress events
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  // Listen for keypresses
  process.stdin.on('keypress', async (str, key) => {
    if (key.sequence === '\r') {
      // Enter key pressed - Re-run 'gpt-tokenizer' version 3
      const tokenizerIndex = findGptTokenizerV3Index()
      if (tokenizerIndex === -1) {
        console.error(chalk.red('Tokenizer "gpt-tokenizer" v3 not found.'))
        return
      }
      const tokenizer = tokenizers[tokenizerIndex]
      console.log(
        chalk.cyanBright(
          `\nRe-running benchmark for ${tokenizer.packageName} v${tokenizer.version}...`,
        ),
      )
      const tokenizerResults: BenchmarkResult[] = []
      for (let i = 0; i < ITERATIONS; i++) {
        console.log(`  ${chalk.yellow(`Iteration ${i + 1}/${ITERATIONS}`)}`)
        try {
          const result = await runSingleBenchmark(tokenizerIndex, EXECUTIONS)
          tokenizerResults.push(result)
        } catch (error) {
          console.error(
            chalk.red(`  Error in iteration ${i + 1}:`),
            (error as Error).message,
          )
        }
      }
      if (tokenizerResults.length > 0) {
        // Aggregate new results
        const newAggregated: BenchmarkResult = {
          packageName: tokenizerResults[0].packageName,
          version: tokenizerResults[0].version,
          initialization: {
            timeMs: calculateAverage(
              tokenizerResults.map((r) => r.initialization.timeMs),
            ),
            memoryMb: calculateAverage(
              tokenizerResults.map((r) => r.initialization.memoryMb),
            ),
            memoryRssMb: calculateAverage(
              tokenizerResults.map((r) => r.initialization.memoryRssMb),
            ),
          },
          datasets: {},
          memoryChangeAfterRunMb: calculateAverage(
            tokenizerResults.map((r) => r.memoryChangeAfterRunMb),
          ),
          memoryLeakWarning: tokenizerResults.some((r) => r.memoryLeakWarning),
          datasetsAverage: {
            encodeTimeMs: calculateAverage(
              tokenizerResults.flatMap((r) =>
                Object.values(r.datasets).map((d) => d.encode.averageTimeMs),
              ),
            ),
            decodeTimeMs: calculateAverage(
              tokenizerResults.flatMap((r) =>
                Object.values(r.datasets).map((d) => d.decode.averageTimeMs),
              ),
            ),
          },
        }
        // Aggregate per-dataset results
        const datasetNames = Object.keys(tokenizerResults[0].datasets)
        for (const dataset of datasetNames) {
          const encodeTimes = tokenizerResults.map(
            (r) => r.datasets[dataset].encode.averageTimeMs,
          )
          const decodeTimes = tokenizerResults.map(
            (r) => r.datasets[dataset].decode.averageTimeMs,
          )
          const memoryChanges = tokenizerResults.map(
            (r) => r.datasets[dataset].memoryChangeAfterExecutionsMb,
          )
          newAggregated.datasets[dataset] = {
            encode: {
              averageTimeMs: calculateAverage(encodeTimes),
            },
            decode: {
              averageTimeMs: calculateAverage(decodeTimes),
            },
            memoryChangeAfterExecutionsMb: calculateAverage(memoryChanges),
          }
        }
        // Calculate changes compared to the last run (if available)
        const existingResults = currentResults.filter(
          (r) =>
            r.packageName === newAggregated.packageName &&
            r.version.startsWith(newAggregated.version),
        )
        let changes: BenchmarkResult['change'] | undefined = undefined
        if (existingResults.length > 0) {
          const lastResult = existingResults[existingResults.length - 1]
          changes = {
            initTimeMs:
              ((newAggregated.initialization.timeMs -
                lastResult.initialization.timeMs) /
                (lastResult.initialization.timeMs || 1)) *
              100,
            initMemoryMb:
              ((newAggregated.initialization.memoryMb -
                lastResult.initialization.memoryMb) /
                (lastResult.initialization.memoryMb || 1)) *
              100,
            initMemoryRssMb:
              ((newAggregated.initialization.memoryRssMb -
                lastResult.initialization.memoryRssMb) /
                (lastResult.initialization.memoryRssMb || 1)) *
              100,
            encodeTimeMs:
              (((newAggregated.datasetsAverage?.encodeTimeMs || 0) -
                (lastResult.datasetsAverage?.encodeTimeMs || 0)) /
                (lastResult.datasetsAverage?.encodeTimeMs || 1)) *
              100,
            decodeTimeMs:
              (((newAggregated.datasetsAverage?.decodeTimeMs || 0) -
                (lastResult.datasetsAverage?.decodeTimeMs || 0)) /
                (lastResult.datasetsAverage?.decodeTimeMs || 1)) *
              100,
            memoryChangeAfterRunMb:
              ((newAggregated.memoryChangeAfterRunMb -
                lastResult.memoryChangeAfterRunMb) /
                (lastResult.memoryChangeAfterRunMb || 1)) *
              100,
          }
        }

        // Create re-run result with "Re-run" label in the version
        const reRunResult: BenchmarkResult = {
          ...newAggregated,
          version: `${newAggregated.version} (Re-run)`, // Move "Re-run" label to Version
          change: changes,
        }

        // Filter out old re-run results if there are already two
        const existingReRuns = currentResults.filter(
          (r) =>
            r.packageName === reRunResult.packageName &&
            r.version.includes('(Re-run)'),
        )
        if (existingReRuns.length >= 2) {
          // Remove the oldest re-run
          const oldestReRun = existingReRuns[0]
          currentResults = currentResults.filter((r) => r !== oldestReRun)
        }

        // Add the new re-run result
        currentResults.push(reRunResult)
        console.log(chalk.green('Benchmark re-run and added to the results.'))

        // Refresh the display
        displayUnifiedResults(currentResults)
        // Save updated results
        await saveResults(currentResults)
      }
    } else if (key.sequence.toLowerCase() === 'd') {
      // 'd' key pressed - Re-run ALL benchmarks
      console.log(chalk.cyanBright('\nRe-running all benchmarks...'))
      try {
        const newResults = await runBenchmarks()
        // Replace current results
        currentResults = newResults
        // Display the updated results with highlighting
        displayUnifiedResults(currentResults)
        // Save updated results
        await saveResults(currentResults)
        console.log(
          chalk.green('All benchmarks re-run and updated results saved.'),
        )
      } catch (error) {
        console.error(
          chalk.red('Error during re-running all benchmarks:'),
          (error as Error).message,
        )
      }
    } else if (key.sequence === '\u0003') {
      // CTRL+C pressed - Exit
      console.log(chalk.blue('\nExiting watch mode.'))
      cleanup()
      process.exit(0)
    }
  })

  // Function to cleanup and restore terminal state
  const cleanup = () => {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false)
    }
    // Restore the cursor
    process.stdout.write('\x1B[?25h')
  }

  // Handle process exit events to ensure cleanup
  process.on('SIGINT', () => {
    console.log(chalk.blue('\nExiting watch mode.'))
    cleanup()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    console.log(chalk.blue('\nExiting watch mode.'))
    cleanup()
    process.exit(0)
  })
}

// Function to execute the benchmark runner
const execute = async () => {
  // Attempt to load previous results
  const previousResults = await loadLastResults()
  if (previousResults && Array.isArray(previousResults)) {
    console.log(chalk.green('Loaded previous benchmark results.'))
    // Enter watch mode with loaded results
    await watchMode(previousResults)
  } else {
    console.log(
      chalk.yellow('No valid previous results found. Running benchmarks...'),
    )
    // Run initial benchmarks
    const initialResults = await runBenchmarks()
    // Save initial results
    await saveResults(initialResults)
    // Enter watch mode with initial results
    await watchMode(initialResults)
  }
}

// Execute the benchmark runner
execute().catch((error) => {
  console.error(chalk.red('Benchmarking failed:'), error)
  process.exit(1)
})
