import { useMemo } from 'react'
import type { PriceData } from 'gpt-tokenizer/modelTypes'

import type { ChatMessage, TokenSegment } from '../types'
import type { TokenizerModule } from './useTokenizer'

export type ChatAnalysis = {
  tokens: number[]
  cost: PriceData | undefined
  error: string | null
  segments: TokenSegment[]
}

interface UseChatAnalysisArgs {
  tokenizer: TokenizerModule | null
  messages: ChatMessage[]
  error: string | null
}

export function useChatAnalysis({ tokenizer, messages, error }: UseChatAnalysisArgs): ChatAnalysis {
  return useMemo(() => {
    if (!tokenizer || messages.length === 0) {
      return { tokens: [], cost: undefined, error, segments: [] }
    }

    try {
      const tokens = tokenizer.encodeChat(messages)
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

      let cost: PriceData | undefined
      if (tokens.length > 0) {
        try {
          cost = tokenizer.estimateCost(tokens.length)
        } catch (costError) {
          console.warn('Chat cost estimation failed', costError)
        }
      }

      return { tokens, cost, error: null, segments }
    } catch (chatError) {
      console.error('Chat encoding failed', chatError)
      return {
        tokens: [],
        cost: undefined,
        error: 'Chat encoding is not supported for this model or chat format.',
        segments: [],
      }
    }
  }, [error, messages, tokenizer])
}
