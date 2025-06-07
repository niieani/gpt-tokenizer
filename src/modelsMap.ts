/* eslint-disable camelcase */

import type { ModelName } from './mapping.js'

// reference: https://github.com/openai/tiktoken/blob/4560a8896f5fb1d35c6f8fd6eee0399f9a1a27ca/tiktoken/model.py

// --- p50k_base models ---
export const p50k_base: readonly string[] = [
  // legacy models
  'text-davinci-002',
  'text-davinci-003',
  'code-davinci-001',
  'code-davinci-002',
  'davinci-codex',
  'code-cushman-001',
  'code-cushman-002',
  'cushman-codex',
] as const satisfies ModelName[]

// --- r50k_base models ---
export const r50k_base: readonly string[] = [
  // legacy models
  'text-ada-001',
  'text-babbage-001',
  'text-curie-001',
  'text-davinci-001',
  'ada',
  'babbage',
  'curie',
  'davinci',
  'code-search-ada-code-001',
  'code-search-ada-text-001',
  'text-similarity-ada-001',
  'text-search-ada-doc-001',
  'text-search-ada-query-001',
  'text-similarity-babbage-001',
  'text-search-babbage-doc-001',
  'text-search-babbage-query-001',
  'code-search-babbage-code-001',
  'code-search-babbage-text-001',
  'text-similarity-curie-001',
  'text-search-curie-doc-001',
  'text-search-curie-query-001',
  'text-similarity-davinci-001',
  'text-search-davinci-doc-001',
  'text-search-davinci-query-001',
] as const satisfies ModelName[]

// --- p50k_edit models ---
export const p50k_edit: readonly string[] = [
  'code-davinci-edit-001',
  'text-davinci-edit-001',
] as const satisfies ModelName[]

// --- cl100k_base models ---
export const cl100k_base: readonly string[] = [
  // all gpt-3.5 models:
  'gpt-3.5',
  'gpt-3.5-0301',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-16k-0613',
  'gpt-3.5-turbo-instruct',
  // all gpt-4.0 models:
  'gpt-4',
  'gpt-4-0125-preview',
  'gpt-4-0314',
  'gpt-4-0613',
  'gpt-4-1106-preview',
  'gpt-4-1106-vision-preview',
  'gpt-4-32k',
  'gpt-4-turbo',
  'gpt-4-turbo-2024-04-09',
  'gpt-4-turbo-preview',
  // embedding models:
  'text-embedding-3-large',
  'text-embedding-3-small',
  'text-embedding-ada-002',
  // still supported models:
  'babbage-002',
  'davinci-002',
] as const satisfies ModelName[]

// all new models use o200k_base, hence we don't need to list them here
// (e.g. chatgpt-4o-latest, gpt-4o-2024-05-13, o1, etc.)
// --- o200k_base models ---
export const o200k_base: readonly string[] = [] as const satisfies ModelName[]
