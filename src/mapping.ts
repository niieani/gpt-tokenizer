/* eslint-disable camelcase */

import { chatEnabledModels, models } from './models.js'
import { ImSep } from './specialTokens.js'

export const cl100k_base = 'cl100k_base'
export const p50k_base = 'p50k_base'
export const p50k_edit = 'p50k_edit'
export const r50k_base = 'r50k_base'
export const o200k_base = 'o200k_base'

export const encodingNames = [
  p50k_base,
  r50k_base,
  p50k_edit,
  cl100k_base,
  o200k_base,
] as const
export type EncodingName = (typeof encodingNames)[number]

const chatEnabledModelsMap = Object.fromEntries(
  Object.entries(chatEnabledModels).map(([modelName, data]) => [
    modelName,
    data.encoding,
  ]),
) as Record<keyof typeof chatEnabledModels, EncodingName>

export const modelToEncodingMap = Object.fromEntries(
  Object.entries(models).map(([modelName, data]) => [modelName, data.encoding]),
) as Record<keyof typeof models, EncodingName>

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

export const chatModelParams = Object.fromEntries(
  Object.keys(chatEnabledModelsMap).flatMap((modelName) =>
    modelName.startsWith('gpt-4')
      ? ([[modelName, gpt4params] as const] as const)
      : modelName.startsWith('gpt-3.5-turbo')
      ? ([[modelName, gpt3params] as const] as const)
      : [],
  ),
) as Record<ChatModelName, ChatParameters>

export const chatEnabledModelsList = Object.keys(
  chatEnabledModelsMap,
) as ChatModelName[]
