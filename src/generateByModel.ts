import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { modelToEncodingMap } from './mapping.js'

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url))

await Promise.all(
  Object.entries(modelToEncodingMap).map(async ([modelName, encoding]) => {
    await fs.mkdir(path.join(__dirname, 'model'), { recursive: true })
    await fs.writeFile(
      path.join(__dirname, `model/${modelName}.ts`),
      `export * from '../encoding/${encoding}.js'\n`,
    )

    // eslint-disable-next-line no-console
    console.log(`encoding/${modelName}.js`)
  }),
)
