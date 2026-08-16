import fs from 'node:fs'
import { URL } from 'node:url'
import vm from 'node:vm'
import { describe, expect, it } from 'vite-plus/test'

const source = fs.readFileSync(
  new URL('./modelScrape.browser.js', import.meta.url),
  'utf8',
)
const context = vm.createContext({})

vm.runInContext(
  `${source}\nglobalThis.runModelScrapeCodegen = codegen`,
  context,
)

const codegen = context.runModelScrapeCodegen

const model = {
  default: {
    name: 'sora',
    current_snapshot: 'sora-2025',
    type: 'other',
    snapshots: ['sora-2025', 'sora'],
  },
}

const snapshot = (name, supportedFeatures = []) => ({
  default: {
    name,
    modalities: { input: ['text'], output: ['video'] },
    supported_endpoints: ['videos'],
    supported_features: supportedFeatures,
  },
})

describe('modelScrape codegen', () => {
  it('does not emit an alias that duplicates a generated snapshot export', () => {
    const output = codegen(
      { './models-data/sora.yaml': model },
      {
        './snapshots-data/sora-2025.yaml': snapshot('sora-2025'),
        './snapshots-data/sora.yaml': snapshot('sora'),
      },
    )

    expect(output.match(/as 'sora'/g)).toHaveLength(1)
    expect(output).not.toContain("sora_2025_spec as 'sora'")
  })

  it('omits a null supported_features value from snapshot data', () => {
    const sourceSnapshot = snapshot('sora-2025', null)

    const output = codegen(
      { './models-data/sora.yaml': model },
      { './snapshots-data/sora-2025.yaml': sourceSnapshot },
    )

    expect(output).not.toContain('supported_features: null')
    expect(sourceSnapshot.default.supported_features).toBeNull()
  })
})
