/* eslint-disable camelcase */

import { chatEnabledModels } from './modelsChatEnabled.gen.js'
import * as encodingsMap from './modelsMap.js'
import { ImSep } from './specialTokens.js'

export const cl100k_base = 'cl100k_base'
export const p50k_base = 'p50k_base'
export const p50k_edit = 'p50k_edit'
export const r50k_base = 'r50k_base'
export const o200k_base = 'o200k_base'

export const DEFAULT_ENCODING = o200k_base

export type EncodingName = keyof typeof encodingsMap
export const encodingNames = [
  p50k_base,
  r50k_base,
  p50k_edit,
  cl100k_base,
  o200k_base,
] as const satisfies EncodingName[]

/**
 * maps model names to encoding names
 * if a model is not listed, it uses the default encoding for new models
 * which is `o200k_base`
 */
export const modelToEncodingMap = Object.fromEntries(
  Object.entries(encodingsMap).flatMap(([encodingName, models]) =>
    models.map((modelName) => [modelName, encodingName]),
  ),
) as Record<ModelName, EncodingName>

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

export type ModelName = keyof typeof import('./models.js')
export type ChatModelName = (typeof chatEnabledModels)[number]

export const chatModelParams = Object.fromEntries(
  chatEnabledModels.flatMap((modelName) =>
    modelName.startsWith('gpt-3.5')
      ? ([[modelName, gpt3params] as const] as const)
      : ([[modelName, gpt4params] as const] as const),
  ),
) as Record<ChatModelName, ChatParameters>
