/* eslint-disable no-console */
import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as models from '../models.js'
import type { ModelSpec } from '../modelTypes.js'

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const chatEnabledModels = Object.entries<ModelSpec>(models)
  .filter(
    ([_, model]) =>
      model.supported_endpoints.includes('chat_completions') ||
      model.supported_endpoints.includes('responses'),
  )
  .map(([name]) => name)

const tsFileContent = `export const chatEnabledModels = ${JSON.stringify(
  chatEnabledModels,
)} as const;
`

await fs.writeFile(
  path.join(__dirname, '../modelsChatEnabled.gen.ts'),
  tsFileContent,
)

console.log(`wrote modelsChatEnabled.gen.ts:`)
console.log(tsFileContent)
