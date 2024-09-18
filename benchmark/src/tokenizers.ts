import { createRequire } from 'node:module'
import type { TokenizerBenchmark } from './interfaces.js'

const require = createRequire(import.meta.url)

// Define TokenizerBenchmark implementations
export const tokenizers: TokenizerBenchmark[] = [
  {
    packageName: 'tiktoken',
    version: require('../node_modules/tiktoken/package.json').version,
    load: async () => {
      const { encoding_for_model } = await import('tiktoken')
      const tiktokenWasm = encoding_for_model('gpt-3.5-turbo')
      const decoder = new TextDecoder('utf-8', { fatal: true })
      return {
        encode: (t: string) => tiktokenWasm.encode(t),
        decode: (i: Uint32Array) => decoder.decode(tiktokenWasm.decode(i)),
      }
    },
  },
  {
    packageName: 'tiktoken-node',
    version: require('../node_modules/tiktoken-node/package.json').version,
    load: async () => {
      const { default: tiktokenNode } = await import('tiktoken-node')
      const encoder = tiktokenNode.getEncoding('cl100k_base')
      return {
        encode: (i: string) => encoder.encode(i),
        decode: (i: number[]) => encoder.decode(i),
      }
    },
  },
  {
    packageName: 'gpt-3-encoder',
    version: require('../node_modules/gpt-3-encoder/package.json').version,
    load: async () => {
      const gpt3Encoder = await import('gpt-3-encoder')
      return {
        encode: (i: string) => gpt3Encoder.encode(i),
        decode: (i: number[]) => gpt3Encoder.decode(i),
      }
    },
  },
  {
    packageName: 'js-tiktoken',
    version: require('../node_modules/js-tiktoken/package.json').version,
    load: async () => {
      const jsTiktoken = await import('js-tiktoken')
      const jsTiktokenTokenizer = jsTiktoken.getEncoding(
        jsTiktoken.getEncodingNameForModel('gpt-3.5-turbo'),
      )
      return {
        encode: (i: string) => jsTiktokenTokenizer.encode(i),
        decode: (i: number[]) => jsTiktokenTokenizer.decode(i),
      }
    },
  },
  {
    packageName: 'gpt3-tokenizer',
    version: require('../node_modules/gpt3-tokenizer/package.json').version,
    load: async () => {
      const { default: gpt3tokenizer } = await import('gpt3-tokenizer')
      const TokenizerClass = gpt3tokenizer.default
      const tokenizer = new TokenizerClass({ type: 'gpt3' })
      return {
        encode: (i: string) => tokenizer.encode(i).bpe,
        decode: (i: number[]) => tokenizer.decode(i),
      }
    },
  },
  {
    packageName: 'gpt-tokenizer',
    version: require('../node_modules/gpt-tokenizer/package.json').version,
    load: async () => {
      const { default: tokenizer } = await import(
        'gpt-tokenizer/encoding/cl100k_base'
      )
      return {
        encode: tokenizer.encode,
        decode: tokenizer.decode,
      }
    },
  },
  {
    packageName: 'gpt-tokenizer',
    version: 'local',
    load: async () => {
      const { default: tokenizer } = await import(
        '../../esm/encoding/cl100k_base.js'
      )
      return {
        encode: tokenizer.encode,
        decode: tokenizer.decode,
      }
    },
  },
]
