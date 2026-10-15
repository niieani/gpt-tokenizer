import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import type { Adapter, Encoding } from './interfaces.js'

const require = createRequire(import.meta.url)
const both: Encoding[] = ['cl100k_base', 'o200k_base']
const version = (name: string) =>
  require(`../node_modules/${name}/package.json`).version as string
export const fixturePath = (encoding: Encoding, file = 'tokenizer.json') =>
  new URL(`../fixtures/${encoding}/${file}`, import.meta.url)
const fixture = (encoding: Encoding, file?: string) =>
  readFile(fixturePath(encoding, file), 'utf8')
const local = async (encoding: Encoding) =>
  import(`../../esm/encoding/${encoding}.js`)

export const tokenizers: Adapter[] = [
  {
    id: 'gpt-tokenizer:local',
    packageName: 'gpt-tokenizer',
    version: 'local',
    encodings: both,
    load: async (encoding) => {
      const t = await local(encoding)
      return {
        encode: t.encode,
        decode: (ids) => t.decode(ids),
        countTokens: t.countTokens,
      }
    },
  },
  {
    id: 'gpt-tokenizer:npm',
    packageName: 'gpt-tokenizer',
    version: version('gpt-tokenizer'),
    encodings: both,
    load: async (encoding) => {
      const t = await import(`gpt-tokenizer/encoding/${encoding}`)
      return {
        encode: t.encode,
        decode: (ids) => t.decode(ids),
        countTokens: t.countTokens,
      }
    },
  },
  {
    id: 'tiktoken',
    packageName: 'tiktoken',
    version: version('tiktoken'),
    encodings: both,
    load: async (encoding) => {
      const { get_encoding } = await import('tiktoken')
      const t = get_encoding(encoding)
      const decoder = new TextDecoder('utf8', { fatal: true, ignoreBOM: true })
      return {
        encode: (text) => t.encode(text),
        decode: (ids) => decoder.decode(t.decode(ids as Uint32Array)),
        countTokens: (text) => t.encode(text).length,
        free: () => t.free(),
      }
    },
  },
  {
    id: 'js-tiktoken',
    packageName: 'js-tiktoken',
    version: version('js-tiktoken'),
    encodings: both,
    load: async (encoding) => {
      const { getEncoding } = await import('js-tiktoken')
      const t = getEncoding(encoding)
      return {
        encode: (text) => t.encode(text),
        decode: (ids) => t.decode(ids as number[]),
        countTokens: (text) => t.encode(text).length,
      }
    },
  },
  {
    id: 'tiktoken-node',
    packageName: 'tiktoken-node',
    version: version('tiktoken-node'),
    encodings: ['cl100k_base'],
    load: async () => {
      const {
        default: { getEncoding },
      } = await import('tiktoken-node')
      const t = getEncoding('cl100k_base')
      return {
        encode: (text) => t.encode(text),
        decode: (ids) => t.decode(ids as number[]),
        countTokens: (text) => t.encode(text).length,
      }
    },
  },
  {
    id: '@huggingface/tokenizers',
    packageName: '@huggingface/tokenizers',
    version: version('@huggingface/tokenizers'),
    encodings: both,
    load: async (encoding) => {
      const { Tokenizer } = await import('@huggingface/tokenizers')
      const t = new Tokenizer(
        JSON.parse(await fixture(encoding)),
        JSON.parse(await fixture(encoding, 'tokenizer_config.json')),
      )
      return {
        encode: (text) => t.encode(text, { add_special_tokens: false }).ids,
        decode: (ids) =>
          t.decode(ids as number[], { skip_special_tokens: false }),
        countTokens: (text) =>
          t.encode(text, { add_special_tokens: false }).ids.length,
      }
    },
  },
  {
    id: 'tokenizers',
    packageName: 'tokenizers',
    version: version('tokenizers'),
    encodings: both,
    async: true,
    load: async (encoding) => {
      const { Tokenizer } = await import('tokenizers')
      const t = Tokenizer.fromString(await fixture(encoding))
      return {
        encode: async (text) =>
          (await t.encode(text, null, { addSpecialTokens: false })).getIds(),
        decode: (ids) => t.decode(ids as number[], false),
        countTokens: async (text) =>
          (await t.encode(text, null, { addSpecialTokens: false })).getIds()
            .length,
      }
    },
  },
  {
    id: '@mlc-ai/web-tokenizers',
    packageName: '@mlc-ai/web-tokenizers',
    version: version('@mlc-ai/web-tokenizers'),
    encodings: both,
    load: async (encoding) => {
      // 0.1.6 publishes a UMD/CommonJS bundle under type:module. Execute the
      // unmodified bundle in its intended CJS wrapper, on both engines.
      const url = new URL(
        '../node_modules/@mlc-ai/web-tokenizers/lib/index.js',
        import.meta.url,
      )
      const shim = { exports: {} }
      new Function(
        'require',
        'module',
        'exports',
        '__filename',
        await readFile(url, 'utf8'),
      )(createRequire(url), shim, shim.exports, fileURLToPath(url))
      const { Tokenizer } =
        shim.exports as typeof import('@mlc-ai/web-tokenizers')
      const data = await readFile(fixturePath(encoding))
      const t = await Tokenizer.fromJSON(
        data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
      )
      return {
        encode: (text) => t.encode(text),
        decode: (ids) => t.decode(ids as Int32Array),
        countTokens: (text) => t.encode(text).length,
        free: () => t.dispose(),
      }
    },
  },
  {
    id: '@goliapkg/tiktoken-wasm',
    packageName: '@goliapkg/tiktoken-wasm',
    version: version('@goliapkg/tiktoken-wasm'),
    encodings: both,
    load: async (encoding) => {
      const { default: init, getEncoding } =
        await import('@goliapkg/tiktoken-wasm')
      const wasm = await readFile(
        new URL(
          '../node_modules/@goliapkg/tiktoken-wasm/tiktoken_wasm_bg.wasm',
          import.meta.url,
        ),
      )
      await init({ module_or_path: wasm })
      const t = getEncoding(encoding)
      return {
        encode: (text) => t.encode(text),
        decode: (ids) => t.decode(ids as Uint32Array),
        countTokens: (text) => t.count(text),
        free: () => t.free(),
      }
    },
  },
  {
    id: 'bpe-lite',
    packageName: 'bpe-lite',
    version: version('bpe-lite'),
    encodings: both,
    load: async (encoding) => {
      const { openai, openaiO200k } = await import('bpe-lite')
      const t = encoding === 'cl100k_base' ? openai() : openaiO200k()
      return {
        encode: (text) => t.encode(text),
        decode: (ids) => t.decode(ids as number[]),
        countTokens: (text) => t.count(text),
      }
    },
  },
  {
    id: 'ai-tokenizer',
    packageName: 'ai-tokenizer',
    version: version('ai-tokenizer'),
    encodings: both,
    load: async (encoding) => {
      const { Tokenizer } = await import('ai-tokenizer')
      const params = await import(`ai-tokenizer/encoding/${encoding}`)
      const t = new Tokenizer(params)
      return {
        encode: (text) => t.encode(text),
        decode: (ids) => t.decode(ids as number[]),
        countTokens: (text) => t.count(text),
      }
    },
  },
  {
    id: '@lenml/tokenizers',
    packageName: '@lenml/tokenizers',
    version: version('@lenml/tokenizers'),
    encodings: both,
    load: async (encoding) => {
      const { TokenizerLoader } = await import('@lenml/tokenizers')
      const t = TokenizerLoader.fromPreTrained({
        tokenizerJSON: JSON.parse(await fixture(encoding)),
        tokenizerConfig: JSON.parse(
          await fixture(encoding, 'tokenizer_config.json'),
        ),
      })
      return {
        encode: (text) => t.encode(text, { add_special_tokens: false }),
        decode: (ids) =>
          t.decode(ids as number[], { skip_special_tokens: false }),
        countTokens: (text) =>
          t.encode(text, { add_special_tokens: false }).length,
      }
    },
  },
]
