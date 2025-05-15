import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
// eslint-disable-next-line import/no-extraneous-dependencies
import * as devalue from 'devalue'
import {
  type ModelName,
  chatModelParams,
  DEFAULT_ENCODING,
  modelToEncodingMap,
} from '../mapping.js'
import * as models from '../models.js'

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const chatModels = Object.keys(chatModelParams)

const template = await fs.readFile(
  path.join(__dirname, '../encoding/cl100k_base.ts'),
  'utf8',
)

await fs.mkdir(path.join(__dirname, '../model'), { recursive: true })
await Promise.all(
  Object.entries(models).map(async ([_modelName, modelData]) => {
    const modelName = _modelName as ModelName
    const encoding = modelToEncodingMap[modelName] ?? DEFAULT_ENCODING
    const isChatModel = chatModels.includes(modelName)

    const content = isChatModel
      ? template
          .replace(
            `getEncodingApi('cl100k_base', () => bpeRanks)`,
            `getEncodingApiForModel('${modelName}', () => bpeRanks, ${devalue.uneval(
              modelData,
            )})`,
          )
          .replace('\nconst api =', '// prettier-ignore\nconst api =')
          .replaceAll(`cl100k_base.js`, `${encoding}.js`)
      : /* ts */ `// eslint-disable-next-line no-restricted-exports, import/no-default-export
export { default } from '../encoding/${encoding}.js'
export * from '../encoding/${encoding}.js'
`
    await fs.writeFile(
      path.join(__dirname, `../model/${modelName}.ts`),
      content,
    )

    // eslint-disable-next-line no-console
    console.log(`wrote encoding/${modelName}.ts`)
  }),
)
