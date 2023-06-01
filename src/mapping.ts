/* eslint-disable camelcase */

import { ImSep } from './specialTokens.js'

export const cl100k_base = 'cl100k_base'
export const p50k_base = 'p50k_base'
export const p50k_edit = 'p50k_edit'
export const r50k_base = 'r50k_base'

export const encodingNames = [
  cl100k_base,
  p50k_base,
  r50k_base,
  p50k_edit,
] as const

export const modelToEncodingMap = {
  // chat
  'gpt-4': cl100k_base,
  'gpt-4-32k': cl100k_base,
  'gpt-4-0314': cl100k_base,
  'gpt-4-32k-0314': cl100k_base,
  'gpt-3.5-turbo': cl100k_base,
  'gpt-3.5-turbo-0301': cl100k_base,
  // text
  'text-davinci-003': p50k_base,
  'text-davinci-002': p50k_base,
  'text-davinci-001': r50k_base,
  'text-curie-001': r50k_base,
  'text-babbage-001': r50k_base,
  'text-ada-001': r50k_base,
  davinci: r50k_base,
  curie: r50k_base,
  babbage: r50k_base,
  ada: r50k_base,
  // code
  'code-davinci-002': p50k_base,
  'code-davinci-001': p50k_base,
  'code-cushman-002': p50k_base,
  'code-cushman-001': p50k_base,
  'davinci-codex': p50k_base,
  'cushman-codex': p50k_base,
  // edit
  'text-davinci-edit-001': p50k_edit,
  'code-davinci-edit-001': p50k_edit,
  // embeddings
  'text-embedding-ada-002': cl100k_base,
  // old embeddings
  'text-similarity-davinci-001': r50k_base,
  'text-similarity-curie-001': r50k_base,
  'text-similarity-babbage-001': r50k_base,
  'text-similarity-ada-001': r50k_base,
  'text-search-davinci-doc-001': r50k_base,
  'text-search-curie-doc-001': r50k_base,
  'text-search-babbage-doc-001': r50k_base,
  'text-search-ada-doc-001': r50k_base,
  'code-search-babbage-code-001': r50k_base,
  'code-search-ada-code-001': r50k_base,
} as const

export interface ChatParameters {
  messageSeparator: string
  roleSeparator: string
}

const internalChatModelParams = {
  'gpt-3.5-turbo': {
    messageSeparator: '\n',
    roleSeparator: '\n',
  },
  'gpt-3.5-turbo-0301': {
    messageSeparator: '\n',
    roleSeparator: '\n',
  },
  'gpt-4': {
    messageSeparator: '',
    roleSeparator: ImSep,
  },
  'gpt-4-0314': {
    messageSeparator: '',
    roleSeparator: ImSep,
  },
  'gpt-4-32k': {
    messageSeparator: '',
    roleSeparator: ImSep,
  },
  'gpt-4-32k-0314': {
    messageSeparator: '',
    roleSeparator: ImSep,
  },
}

export const chatModelParams: Partial<Record<ModelName, ChatParameters>> =
  internalChatModelParams
export type ModelName = keyof typeof modelToEncodingMap
export type ChatModelName = keyof typeof internalChatModelParams
export type EncodingName = (typeof modelToEncodingMap)[ModelName]
