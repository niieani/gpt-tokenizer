import fs from 'node:fs'
import { URL } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  discoverRemoteBundle,
  discoverBundleIdentifiers,
  generateModelsFile,
} from './modelScrape.node.js'

const browserScraperSource = fs.readFileSync(
  new URL('./modelScrape.browser.js', import.meta.url),
  'utf8',
)

const bundleSource = String.raw`
import{r as e}from"./react.js";
const rendered=e.createElement("div"),modelData={name:"example",current_snapshot:"example-2026",type:"chat",snapshots:["example-2026"]},modelModule={default:modelData},snapshotData={name:"example-2026",modalities:{input:["text"],output:["text"]},supported_endpoints:["responses"]},snapshotModule={default:snapshotData},AA=Object.assign({"./models-data/example.yaml":modelModule}),BB=Object.assign({"./snapshots-data/example-2026.yaml":snapshotModule}),CC={name:"Other models",subsections:[{items:[{name:"example",snapshots:[{name:"example-2026",values:{main:{input:1,output:2}}}]}]}]};
export{rendered as r};
`

const pageUrl = 'https://developers.openai.com/api/docs/models'

const createFetch =
  (responses: Readonly<Record<string, string>>, requests: string[]) =>
  async (url: string) => {
    requests.push(String(url))
    const body = responses[String(url)]

    if (body === undefined) {
      return { ok: false, status: 404, url: String(url), text: async () => '' }
    }

    return {
      ok: true,
      status: 200,
      url: String(url),
      text: async () => body,
    }
  }

describe('Node model scraper', () => {
  it('prioritizes the model component graph and finds models-page-data', async () => {
    const requests: string[] = []
    const warnings: string[] = []
    const overviewUrl =
      'https://developers.openai.com/_astro/ModelOverview.react.overview.js'
    const artUrl = 'https://developers.openai.com/_astro/ModelArt.react.art.js'
    const targetUrl =
      'https://developers.openai.com/_astro/models-page-data.react.data.js'
    const unrelatedUrl =
      'https://developers.openai.com/_astro/Unrelated.react.other.js'
    const responses = {
      [pageUrl]: `<astro-island component-url="${new URL(overviewUrl).pathname}"></astro-island><astro-island component-url="${new URL(unrelatedUrl).pathname}"></astro-island>`,
      [overviewUrl]: 'import{M as E}from"./ModelArt.react.art.js";',
      [artUrl]: 'import{M as f}from"./models-page-data.react.data.js";',
      [targetUrl]: bundleSource,
      [unrelatedUrl]: 'export const unrelated = true;',
    }

    const result = await discoverRemoteBundle({
      fetchImpl: createFetch(responses, requests),
      onWarning: (warning) => warnings.push(warning),
      pageUrl,
    })

    expect(result).toEqual({ source: bundleSource, url: targetUrl })
    expect(requests).toEqual([pageUrl, overviewUrl, artUrl, targetUrl])
    expect(warnings).toEqual([])
  })

  it('warns before falling back when prioritized modules are absent', async () => {
    const requests: string[] = []
    const warnings: string[] = []
    const fallbackUrl =
      'https://developers.openai.com/_astro/Fallback.react.fallback.js'
    const targetUrl =
      'https://developers.openai.com/_astro/models-page-data.react.data.js'
    const responses = {
      [pageUrl]: `<astro-island component-url="${new URL(fallbackUrl).pathname}"></astro-island>`,
      [fallbackUrl]: 'import{M as f}from"./models-page-data.react.data.js";',
      [targetUrl]: bundleSource,
    }

    const result = await discoverRemoteBundle({
      fetchImpl: createFetch(responses, requests),
      onWarning: (warning) => warnings.push(warning),
      pageUrl,
    })

    expect(result.url).toBe(targetUrl)
    expect(warnings).toContainEqual(
      expect.stringContaining('ModelOverview.react'),
    )
  })

  it('fails clearly when models-page-data cannot be found', async () => {
    const requests: string[] = []
    const overviewUrl =
      'https://developers.openai.com/_astro/ModelOverview.react.overview.js'
    const responses = {
      [pageUrl]: `<astro-island component-url="${new URL(overviewUrl).pathname}"></astro-island>`,
      [overviewUrl]: 'export const overview = true;',
    }

    await expect(
      discoverRemoteBundle({
        fetchImpl: createFetch(responses, requests),
        onWarning: () => {},
        pageUrl,
      }),
    ).rejects.toThrow(
      'Unable to find a models-page-data JavaScript module; its upstream name or module graph may have changed',
    )
  })

  it('discovers minified identifiers from semantic bundle anchors', () => {
    expect(discoverBundleIdentifiers(bundleSource)).toEqual({
      models: 'AA',
      snapshots: 'BB',
      pricing: 'CC',
    })
  })

  it('fails when a semantic anchor is not unique', () => {
    const duplicateModels = bundleSource.replace(
      'BB=Object.assign',
      'DD=Object.assign({"./models-data/duplicate.yaml":modelModule}),BB=Object.assign',
    )

    expect(() => discoverBundleIdentifiers(duplicateModels)).toThrow(
      'models: expected exactly one identifier, found 2',
    )
  })

  it('evaluates the bundle with mocked imports and preserves the type import', () => {
    const output = generateModelsFile(bundleSource, browserScraperSource)

    expect(output).toMatch(
      /^import type \{ ModelConfig, ModelSpec \} from "\.\/modelTypes\.js"\n\n/,
    )
    expect(output).toContain("export {example_2026_spec as 'example-2026'}")
    expect(output).toContain('input: 1')
    expect(output).toContain('output: 2')
  })
})
