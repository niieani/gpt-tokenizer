import { useCallback, useEffect, useState } from 'react'
import type { PriceData } from 'gpt-tokenizer/modelTypes'

import type { ChatMessage } from '../types'

import { useModelSpec } from '../lib/models'

const TOKENIZER_IMPORT_PREFIX = 'gpt-tokenizer/model/'

const TOKENIZER_LOADERS: Record<string, () => Promise<TokenizerModule>> =
  import.meta.glob<TokenizerModule>(
    '../../node_modules/gpt-tokenizer/esm/model/*.js',
  )

export type TokenizerModule = {
  encode: (input: string) => number[]
  decode: (tokens: number[]) => string
  encodeChat: (messages: ChatMessage[]) => number[]
  estimateCost: (tokens: number) => PriceData | undefined
}

export function useTokenizer(modelName: string) {
  const [tokenizer, setTokenizer] = useState<TokenizerModule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modelSpec = useModelSpec(modelName)

  const loadTokenizer = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const loaderEntry = Object.entries(TOKENIZER_LOADERS).find(([key]) =>
        key.endsWith(`/model/${modelName}.js`),
      )

      const module = loaderEntry
        ? await loaderEntry[1]()
        : ((await import(
            /* @vite-ignore */ `${TOKENIZER_IMPORT_PREFIX}${modelName}`
          )) as TokenizerModule)
      setTokenizer(module)
    } catch (loadError) {
      console.error('Failed to load tokenizer', loadError)
      setTokenizer(null)
      setError(
        'Unable to load tokenizer for this model. Please try another one.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [modelName])

  useEffect(() => {
    void loadTokenizer()
  }, [loadTokenizer])

  return {
    tokenizer,
    isLoading,
    error,
    modelSpec,
  }
}
