import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scraperDirectory = path.dirname(fileURLToPath(import.meta.url))
const browserScraperPath = path.join(scraperDirectory, 'modelScrape.browser.js')
const modelsOutputPath = path.join(scraperDirectory, '../models.gen.ts')
const defaultPageUrl = 'https://developers.openai.com/api/docs/models'
const maximumModuleBytes = 5 * 1024 * 1024
const maximumModuleCount = 50
const maximumModuleDepth = 5

interface BundleIdentifiers {
  models: string
  snapshots: string
  pricing: string
}

interface RemoteBundle {
  source: string
  url: string
}

interface FetchResponse {
  ok: boolean
  status: number
  url: string
  text(): Promise<string>
}

type FetchImplementation = (url: string) => Promise<FetchResponse>

interface RemoteDiscoveryOptions {
  fetchImpl?: FetchImplementation
  onWarning?: (warning: string) => void
  pageUrl?: string
}

interface ModuleQueueItem {
  depth: number
  url: string
}

interface CrawlState {
  fetchImpl: FetchImplementation
  moduleBytes: number
  origin: string
  visited: Set<string>
}

const modelTypesImport =
  'import type { ModelConfig, ModelSpec } from "./modelTypes.js"'

const identifierPatterns = {
  models:
    /([A-Za-z_$][\w$]*)\s*=\s*Object\.assign\(\s*\{\s*["']\.\/models-data\//g,
  snapshots:
    /([A-Za-z_$][\w$]*)\s*=\s*Object\.assign\(\s*\{\s*["']\.\/snapshots-data\//g,
  pricing:
    /([A-Za-z_$][\w$]*)\s*=\s*\{\s*name\s*:\s*["']Other models["']\s*,\s*subsections\s*:\s*\[/g,
}

const namedImportPattern = /import\s*\{([^}]*)\}\s*from\s*["'][^"']+["'];?/g

const targetModulePattern = /^models-page-data(?:\.react)?\.[^/]+\.js$/
const priorityModulePrefixes = [
  'ModelOverview.react.',
  'ModelArt.react.',
  'ModelItem.react.',
] as const

const getModuleName = (url: string): string =>
  path.posix.basename(new URL(url).pathname)

const isTargetModule = (url: string): boolean =>
  targetModulePattern.test(getModuleName(url))

const getModulePriority = (url: string): number => {
  const name = getModuleName(url)

  if (isTargetModule(url)) return 0

  const priorityIndex = priorityModulePrefixes.findIndex((prefix) =>
    name.startsWith(prefix),
  )
  return priorityIndex === -1
    ? priorityModulePrefixes.length + 1
    : priorityIndex + 1
}

const extractIslandModuleUrls = (html: string, pageUrl: string): string[] => {
  const urls = [
    ...html.matchAll(
      /<astro-island\b[^>]*\bcomponent-url\s*=\s*(["'])(.*?)\1/gi,
    ),
  ].map((match) => new URL(match[2]!, pageUrl).href)

  return [...new Set(urls)]
}

const extractModuleSpecifiers = (source: string): string[] => {
  const fromSpecifiers = [
    ...source.matchAll(
      /(?:import|export)\s*[^"'`;]*?\s*from\s*["']([^"']+)["']/g,
    ),
  ].map((match) => match[1]!)
  const sideEffectSpecifiers = [
    ...source.matchAll(/import\s*["']([^"']+)["']/g),
  ].map((match) => match[1]!)
  const dynamicSpecifiers = [
    ...source.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g),
  ].map((match) => match[1]!)

  return [
    ...new Set([
      ...fromSpecifiers,
      ...sideEffectSpecifiers,
      ...dynamicSpecifiers,
    ]),
  ]
}

const unableToFindModule = (detail: string): Error =>
  new Error(
    `Unable to find a models-page-data JavaScript module; its upstream name or module graph may have changed. ${detail}`,
  )

const fetchText = async (
  url: string,
  fetchImpl: FetchImplementation,
): Promise<{ source: string; url: string }> => {
  const response = await fetchImpl(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
  }

  return { source: await response.text(), url: response.url || url }
}

const crawlModules = async (
  initialModules: ModuleQueueItem[],
  state: CrawlState,
): Promise<RemoteBundle | null> => {
  const queue = [...initialModules]

  while (queue.length > 0) {
    queue.sort(
      (left, right) =>
        getModulePriority(left.url) - getModulePriority(right.url),
    )
    const current = queue.shift()!

    if (state.visited.has(current.url) || current.depth > maximumModuleDepth) {
      continue
    }
    if (state.visited.size >= maximumModuleCount) {
      throw unableToFindModule(
        `Stopped after ${maximumModuleCount} Astro modules.`,
      )
    }

    const requestedUrl = new URL(current.url)
    if (
      requestedUrl.origin !== state.origin ||
      !requestedUrl.pathname.startsWith('/_astro/') ||
      !requestedUrl.pathname.endsWith('.js')
    ) {
      continue
    }

    state.visited.add(current.url)
    const fetched = await fetchText(current.url, state.fetchImpl)
    const responseUrl = new URL(fetched.url)

    if (responseUrl.origin !== state.origin) {
      throw new Error(`Astro module redirected outside ${state.origin}`)
    }

    state.moduleBytes += Buffer.byteLength(fetched.source)
    if (state.moduleBytes > maximumModuleBytes) {
      throw unableToFindModule(
        `Stopped after downloading more than ${maximumModuleBytes} bytes of JavaScript.`,
      )
    }

    if (isTargetModule(fetched.url)) {
      try {
        discoverBundleIdentifiers(fetched.source)
      } catch (error) {
        throw new Error(
          `Found ${fetched.url}, but its model data shape is unsupported.`,
          { cause: error },
        )
      }

      return fetched
    }

    for (const specifier of extractModuleSpecifiers(fetched.source)) {
      const importedUrl = new URL(specifier, fetched.url)
      queue.push({ depth: current.depth + 1, url: importedUrl.href })
    }
  }

  return null
}

export const discoverRemoteBundle = async ({
  fetchImpl = globalThis.fetch,
  onWarning = () => {},
  pageUrl = defaultPageUrl,
}: RemoteDiscoveryOptions = {}): Promise<RemoteBundle> => {
  const page = await fetchText(pageUrl, fetchImpl)
  const resolvedPageUrl = new URL(page.url)
  const islandModules = extractIslandModuleUrls(page.source, page.url)

  if (islandModules.length === 0) {
    throw unableToFindModule('The models page contains no Astro islands.')
  }

  const state: CrawlState = {
    fetchImpl,
    moduleBytes: 0,
    origin: resolvedPageUrl.origin,
    visited: new Set(),
  }
  const overviewModules = islandModules.filter((url) =>
    getModuleName(url).startsWith(priorityModulePrefixes[0]),
  )

  if (overviewModules.length === 0) {
    onWarning(
      'Prioritized ModelOverview.react module was not found; scanning all Astro island modules.',
    )
  } else {
    const prioritizedResult = await crawlModules(
      overviewModules.map((url) => ({ depth: 0, url })),
      state,
    )
    if (prioritizedResult) return prioritizedResult

    for (const prefix of priorityModulePrefixes.slice(1)) {
      if (
        ![...state.visited].some((url) => getModuleName(url).startsWith(prefix))
      ) {
        onWarning(
          `Prioritized ${prefix.replace(/\.$/, '')} module was not found; moving to the remaining Astro islands.`,
        )
      }
    }
    onWarning(
      'Prioritized model module graph did not contain models-page-data; scanning remaining Astro island modules.',
    )
  }

  const fallbackResult = await crawlModules(
    islandModules.map((url) => ({ depth: 0, url })),
    state,
  )
  if (fallbackResult) return fallbackResult

  throw unableToFindModule(
    `Scanned ${state.visited.size} Astro modules and ${state.moduleBytes} bytes of JavaScript.`,
  )
}

const findUniqueIdentifier = (
  source: string,
  label: string,
  pattern: RegExp,
): string => {
  const matches = [...source.matchAll(pattern)]

  if (matches.length !== 1) {
    throw new Error(
      `${label}: expected exactly one identifier, found ${matches.length}`,
    )
  }

  const identifier = matches[0]![1]
  if (!identifier) {
    throw new Error(`${label}: matched bundle data without an identifier`)
  }

  return identifier
}

export const discoverBundleIdentifiers = (
  source: string,
): BundleIdentifiers => ({
  models: findUniqueIdentifier(source, 'models', identifierPatterns.models),
  snapshots: findUniqueIdentifier(
    source,
    'snapshots',
    identifierPatterns.snapshots,
  ),
  pricing: findUniqueIdentifier(source, 'pricing', identifierPatterns.pricing),
})

const discoverImportedLocals = (source: string): string[] => {
  const locals = [...source.matchAll(namedImportPattern)].flatMap((match) =>
    (match[1] ?? '').split(',').map((specifier) => {
      const parts = specifier.trim().split(/\s+as\s+/)
      const local = parts.at(-1)

      if (!local?.match(/^[A-Za-z_$][\w$]*$/)) {
        throw new Error('Bundle contains an unsupported named import')
      }

      return local
    }),
  )

  return [...new Set(locals)]
}

const stripModuleSyntax = (source: string): string => {
  const withoutImports = source.replace(namedImportPattern, '')

  if (/(^|[;\n])\s*import(?:\s|\{)/m.test(withoutImports)) {
    throw new Error('Bundle contains an unsupported import declaration')
  }

  const withoutFinalExport = withoutImports.replace(
    /export\s*\{[^}]*\}\s*;?\s*$/,
    '',
  )

  if (/export\s*\{/.test(withoutFinalExport)) {
    throw new Error('Bundle contains an unsupported export declaration')
  }

  return withoutFinalExport
}

const renderImportMocks = (importedLocals: string[]): string => {
  const bindings = importedLocals
    .map((local) => `${local} = __modelScrapeMock`)
    .join(', ')

  return `
const __modelScrapeMock = new Proxy(function () {}, {
  get(target, property) {
    if (Reflect.has(target, property)) return Reflect.get(target, property)
    if (property === Symbol.toPrimitive) return () => ''
    if (property === Symbol.iterator) return function* () {}
    return __modelScrapeMock
  },
  apply() { return __modelScrapeMock },
  construct() { return __modelScrapeMock },
})
${bindings ? `const ${bindings}` : ''}
`
}

export const generateModelsFile = (
  bundleSource: string,
  browserScraperSource: string,
): string => {
  const identifiers = discoverBundleIdentifiers(bundleSource)
  const importedLocals = discoverImportedLocals(bundleSource)
  const executableBundle = stripModuleSyntax(bundleSource)
  const context = vm.createContext({})

  const source = `${renderImportMocks(importedLocals)}
${executableBundle}
{
${browserScraperSource}
globalThis.__generatedModels = codegen(
  ${identifiers.models},
  ${identifiers.snapshots},
  ${identifiers.pricing},
)
}
`

  vm.runInContext(source, context, {
    filename: 'models-page-data.js',
    timeout: 5_000,
  })

  if (typeof context.__generatedModels !== 'string') {
    throw new TypeError('Model scraper did not produce TypeScript source')
  }

  return `${modelTypesImport}\n\n${context.__generatedModels.trim()}\n`
}

const updateModelsFile = async (bundleSource: string): Promise<void> => {
  const browserScraperSource = await fs.readFile(browserScraperPath, 'utf8')
  const generatedSource = generateModelsFile(bundleSource, browserScraperSource)
  const temporaryOutputPath = `${modelsOutputPath}.${process.pid}.tmp`

  try {
    await fs.writeFile(temporaryOutputPath, generatedSource)
    await fs.rename(temporaryOutputPath, modelsOutputPath)
  } catch (error) {
    await fs.rm(temporaryOutputPath, { force: true })
    throw error
  }

  process.stdout.write(
    `Updated ${path.relative(process.cwd(), modelsOutputPath)}\n`,
  )
}

const main = async () => {
  const [bundleArgument, ...unexpectedArguments] = process.argv.slice(2)

  if (unexpectedArguments.length > 0) {
    throw new Error(
      'Usage: node src/scraper/modelScrape.node.ts [models-page-data.js]',
    )
  }

  if (bundleArgument) {
    await updateModelsFile(
      await fs.readFile(path.resolve(bundleArgument), 'utf8'),
    )
    return
  }

  const remoteBundle = await discoverRemoteBundle({
    onWarning: (warning) => process.stderr.write(`Warning: ${warning}\n`),
  })
  process.stdout.write(`Discovered ${remoteBundle.url}\n`)
  await updateModelsFile(remoteBundle.source)
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isMainModule) {
  await main()
}
