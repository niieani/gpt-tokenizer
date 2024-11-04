import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { chatModelParams, modelToEncodingMap } from '../mapping.js'

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const chatModels = Object.keys(chatModelParams)

const template = await fs.readFile(
  path.join(__dirname, '../encoding/cl100k_base.ts'),
  'utf8',
)

await Promise.all(
  Object.entries(modelToEncodingMap).map(async ([modelName, encoding]) => {
    await fs.mkdir(path.join(__dirname, '../model'), { recursive: true })
    const isChatModel = chatModels.includes(modelName)

    const content = isChatModel
      ? template
          .replace(
            `getEncodingApi('cl100k_base'`,
            `getEncodingApiForModel('${modelName}'`,
          )
          .replace('\nconst api =', '// prettier-ignore\nconst api =')
          .replaceAll(`cl100k_base.js`, `${encoding}.js`)
      : `// eslint-disable-next-line no-restricted-exports, import/no-default-export\nexport { default } from '../encoding/${encoding}.js'\nexport * from '../encoding/${encoding}.js'\n`
    await fs.writeFile(
      path.join(__dirname, `../model/${modelName}.ts`),
      content,
    )

    // eslint-disable-next-line no-console
    console.log(`wrote encoding/${modelName}.ts`)
  }),
)
