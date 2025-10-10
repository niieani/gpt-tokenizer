import { useMemo } from 'react'
import type { PriceData } from 'gpt-tokenizer/modelTypes'

import type { TokenSegment } from '../types'
import type { TokenizerModule } from './useTokenizer'

export function analysePrompt(tokenizer: TokenizerModule, prompt: string) {
  const tokens = tokenizer.encode(prompt)
  let offset = 0

  const segments: TokenSegment[] = tokens.map((token) => {
    const decoded = tokenizer.decode([token])
    const length = decoded.length
    const segment = {
      token,
      text: decoded,
      start: offset,
      end: offset + length,
    }
    offset += length
    return segment
  })

  return { tokens, segments }
}

export type TokenAnalysis = {
  tokens: number[]
  segments: TokenSegment[]
  cost: PriceData | undefined
  error: string | null
}

interface UseTokenAnalysisArgs {
  tokenizer: TokenizerModule | null
  prompt: string
  error: string | null
}

export function useTokenAnalysis({ tokenizer, prompt, error }: UseTokenAnalysisArgs): TokenAnalysis {
  return useMemo(() => {
    if (!tokenizer) {
      return { tokens: [], segments: [], cost: undefined, error }
    }

    try {
      const { tokens, segments } = analysePrompt(tokenizer, prompt)

      let cost: PriceData | undefined
      if (tokens.length > 0) {
        try {
          cost = tokenizer.estimateCost(tokens.length)
        } catch (costError) {
          console.warn('Cost estimation failed', costError)
        }
      }

      return { tokens, segments, cost, error: null }
    } catch (encodeError) {
      console.error('Encoding failed', encodeError)
      return {
        tokens: [],
        segments: [],
        cost: undefined,
        error: 'Encoding failed. Ensure the prompt is valid UTF-8 text.',
      }
    }
  }, [error, prompt, tokenizer])
}
