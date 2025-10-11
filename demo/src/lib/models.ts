import { useMemo } from 'react'
import * as allModelSpecs from 'gpt-tokenizer/models'
import { chatEnabledModels } from 'gpt-tokenizer/modelsChatEnabled.gen'
import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { DEFAULT_MODEL } from '../constants'

export type ModelOption = {
  name: string
  spec: ModelSpec
}

export function getModelSpec(modelName: string) {
  return (allModelSpecs as Record<string, ModelSpec | undefined>)[modelName]
}

export function createModelOptions(): ModelOption[] {
  return chatEnabledModels
    .map<ModelOption | null>((name) => {
      const spec = getModelSpec(name)
      if (!spec) return null
      return { name, spec }
    })
    .filter((entry): entry is ModelOption => entry !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const MODEL_OPTIONS = createModelOptions()

export const INITIAL_MODEL =
  MODEL_OPTIONS.find((option) => option.name === DEFAULT_MODEL)?.name ??
  MODEL_OPTIONS[0]?.name ??
  DEFAULT_MODEL

export function useModelSpec(modelName: string) {
  return useMemo(() => getModelSpec(modelName), [modelName])
}
