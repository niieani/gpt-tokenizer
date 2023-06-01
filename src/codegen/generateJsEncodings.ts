import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'

type CallbackFunction = (filename: string) => Promise<void> | void

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

await processFilesInDirectory(
  path.join(__dirname, '../../data'),
  async (filePath) => {
    if (!filePath.endsWith('.tiktoken')) return

    const modelName = path.basename(filePath, '.tiktoken')
    const bpeFile = await fs.readFile(filePath, 'utf8')
    const lines = bpeFile.split('\n')
    const encoder = lines.slice(0, -1).map((x) => {
      const [token, rank] = x.split(' ')
      return [token, Number.parseInt(rank!, 10)]
    })

    await fs.mkdir(path.join(__dirname, '../encodings'), { recursive: true })
    await fs.writeFile(
      path.join(__dirname, `../encodings/${modelName}.js`),
      `/* eslint-disable */\n// @ts-nocheck\n// prettier-ignore\n/** @type {[string, number][]} */\nconst encoder = ${JSON.stringify(
        encoder,
      )};\nexport default encoder;`,
    )

    // eslint-disable-next-line no-console
    console.log(`Wrote ${modelName}.js`)
  },
)
