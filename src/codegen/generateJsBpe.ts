/* eslint-disable no-console */
import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'

type CallbackFunction = (filename: string) => Promise<void> | void
const DEBUG = process.env.DEBUG === 'true'

const processFilesInDirectory = async (
  directoryPath: string,
  fn: CallbackFunction,
): Promise<void> => {
  try {
    const files = await fs.readdir(directoryPath, { withFileTypes: true })

    for (const file of files) {
      // eslint-disable-next-line no-continue
      if (!file.isFile()) continue
      const filePath = path.join(directoryPath, file.name)
      // eslint-disable-next-line no-await-in-loop
      await fn(filePath)
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const textDecoder = new TextDecoder('utf8', { fatal: true })
const textEncoder = new TextEncoder()

function safeDecodeUtf8(bytes: Buffer): string | undefined {
  try {
    const v = textDecoder.decode(bytes)
    const encoded = textEncoder.encode(v)

    if (encoded.byteLength !== bytes.byteLength) {
      if (DEBUG) {
        console.log('Mismatch:', new Uint8Array(bytes), encoded)
      }
      return undefined
    }
    return v
  } catch {
    return undefined
  }
}

await processFilesInDirectory(
  path.join(__dirname, '../../data'),
  async (filePath) => {
    if (!filePath.endsWith('.tiktoken')) return

    const modelName = path.basename(filePath, '.tiktoken')
    console.log(`Processing ${modelName}`)
    const bpeFile = await fs.readFile(filePath, 'utf8')
    const lines = bpeFile.split('\n')
    const encoder = lines.slice(0, -1).map((x) => {
      const [token, rank] = x.split(' ')
      if (!token || token.length === 0 || !rank || rank.length === 0) {
        throw new Error(`Invalid token encoding: ${x}`)
      }

      const tokenArray = Buffer.from(token, 'base64')
      return [tokenArray, Number.parseInt(rank, 10)] as const
    })

    console.log(`${modelName} token count: ${encoder.length}`)

    const stringifiedBpeItems: string[] = []
    let lastRank = 0

    for (const [token, rank] of encoder) {
      const decoded = safeDecodeUtf8(token) ?? token

      // add array holes if rank is not consecutive
      let holesToInsert = rank - lastRank - 1
      while (holesToInsert-- > 0) {
        stringifiedBpeItems.push('')
      }

      const rankPrefix = DEBUG ? `\n/** ${rank} = */ ` : ''
      stringifiedBpeItems.push(
        rankPrefix +
          (typeof decoded === 'string'
            ? JSON.stringify(decoded)
            : `[${token.join(',')}]`),
      )

      lastRank = rank
    }

    // if the array is too large, Safari on iOS will throw RangeError: Maximum call stack size exceeded.
    // so we split the array into smaller chunks
    const chunkSize = 100_000
    const jsCodeConstsForEachChunk: string[] = []
    const chunks = stringifiedBpeItems.length / chunkSize
    for (let i = 0; i < chunks; i++) {
      jsCodeConstsForEachChunk.push(
        `const c${i} = [${stringifiedBpeItems.slice(
          i * chunkSize,
          (i + 1) * chunkSize,
        )}]`,
      )
    }
    // now let's create the code that will create a single array from the chunks using .concat
    const jsCodeBpeArray = `c0.concat(${jsCodeConstsForEachChunk
      .slice(1)
      .map((_, i) => `c${i + 1}`)
      .join(', ')})`

    // now reset the helper arrays to free up memory
    const jsCodeToResetHelperArrays = jsCodeConstsForEachChunk.map(
      (_, i) => `c${i}.length = 0;`,
    )

    await fs.mkdir(path.join(__dirname, '../bpeRanks'), { recursive: true })
    await fs.writeFile(
      path.join(__dirname, `../bpeRanks/${modelName}.js`),
      `/* eslint-disable */\n// @ts-nocheck\n// prettier-ignore
${jsCodeConstsForEachChunk.join('\n')}
/** @type {(string | number[])[]} */
const bpe = ${jsCodeBpeArray};
${jsCodeToResetHelperArrays.join('\n')}
export default bpe;`,
    )

    console.log(`Wrote ${modelName}.js`)
  },
)
