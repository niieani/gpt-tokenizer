/* eslint-disable camelcase */

import { ImSep } from './specialTokens.js'

export const cl100k_base = 'cl100k_base'
export const p50k_base = 'p50k_base'
export const p50k_edit = 'p50k_edit'
export const r50k_base = 'r50k_base'
export const o200k_base = 'o200k_base'

export const encodingNames = [
  cl100k_base,
  p50k_base,
  r50k_base,
  p50k_edit,
  o200k_base,
] as const

const chatEnabledModelsMap = {
  'gpt-4': cl100k_base,
  'gpt-4-0314': cl100k_base,
  'gpt-4-0613': cl100k_base,
  'gpt-4-32k': cl100k_base,
  'gpt-4-32k-0314': cl100k_base,
  'gpt-4-32k-0613': cl100k_base,
  'gpt-4-turbo': cl100k_base,
  'gpt-4-turbo-2024-04-09': cl100k_base,
  'gpt-4-turbo-preview': cl100k_base,
  'gpt-4-1106-preview': cl100k_base,
  'gpt-4-0125-preview': cl100k_base,
  'gpt-4-vision-preview': cl100k_base,
  'gpt-4o': o200k_base,
  'gpt-4o-2024-05-13': o200k_base,
  'gpt-4o-2024-08-06': o200k_base,
  'gpt-4o-mini-2024-07-18': o200k_base,
  'gpt-4o-mini': o200k_base,
  'gpt-3.5-turbo': cl100k_base,
  'gpt-3.5-turbo-0301': cl100k_base,
  'gpt-3.5-turbo-0613': cl100k_base,
  'gpt-3.5-turbo-1106': cl100k_base,
  'gpt-3.5-turbo-0125': cl100k_base,
  'gpt-3.5-turbo-16k': cl100k_base,
  'gpt-3.5-turbo-16k-0613': cl100k_base,
  'gpt-3.5-turbo-instruct': cl100k_base,
  'gpt-3.5-turbo-instruct-0914': cl100k_base,
} as const

export const modelToEncodingMap = {
  // chat
  ...chatEnabledModelsMap,
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
  'text-embedding-3-small': cl100k_base,
  'text-embedding-3-large': cl100k_base,
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

const gpt3params = {
  messageSeparator: '\n',
  roleSeparator: '\n',
}

const gpt4params = {
  messageSeparator: '',
  roleSeparator: ImSep,
}

export type ModelName = keyof typeof modelToEncodingMap
export type ChatModelName = keyof typeof chatEnabledModelsMap
export type EncodingName = (typeof modelToEncodingMap)[ModelName]

export const chatModelParams = Object.fromEntries(
  Object.keys(chatEnabledModelsMap).flatMap((modelName) =>
    modelName.startsWith('gpt-4')
      ? ([[modelName, gpt4params] as const] as const)
      : modelName.startsWith('gpt-3.5-turbo')
      ? ([[modelName, gpt3params] as const] as const)
      : [],
  ),
) as Record<ChatModelName, ChatParameters>

export const chatEnabledModels = Object.keys(
  chatEnabledModelsMap,
) as ChatModelName[]
