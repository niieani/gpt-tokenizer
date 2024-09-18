import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { base64 } from 'rfc4648'

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
    // eslint-disable-next-line no-console
    console.error('An error occurred:', error)
  }
}

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function safeDecodeUtf8(bytes: Uint8Array): string | undefined {
  const textDecoder = new TextDecoder('utf8', { fatal: true })
  console.log('Decoding:', bytes)
  try {
    const v = textDecoder.decode(bytes)
    console.log('Decoded:', bytes, v)
    return v
  } catch {
    console.log('Failed to decode:', bytes)
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
      const tokenArray = base64.parse(token)
      return [tokenArray, Number.parseInt(rank, 10)] as const
    })

    const jsCodeBpeArray = encoder.reduce(
      (acc, [token, rank]) => {
        const decoded = safeDecodeUtf8(token) ?? token
        return {
          string: `${acc.string}${','.repeat(rank - acc.lastRank)}${
            DEBUG ? `\n/** ${rank} = */` : ''
          }${
            typeof decoded === 'string'
              ? JSON.stringify(decoded)
              : `[${token.join(',')}]`
          }`,
          lastRank: rank,
        }
      },
      { string: '', lastRank: 0 },
    ).string
    const firstTokenRank = encoder[0]?.[1] ?? 0

    await fs.mkdir(path.join(__dirname, '../encodings'), { recursive: true })
    await fs.writeFile(
      path.join(__dirname, `../encodings/${modelName}.js`),
      `/* eslint-disable */\n// @ts-nocheck\n// prettier-ignore\nconst U = Uint8Array;\n/** @type {Uint8Array[]} */\nconst encoder = [${','.repeat(
        firstTokenRank,
      )}${jsCodeBpeArray}];\nexport default encoder;`,
    )

    // eslint-disable-next-line no-console
    console.log(`Wrote ${modelName}.js`)
  },
)
