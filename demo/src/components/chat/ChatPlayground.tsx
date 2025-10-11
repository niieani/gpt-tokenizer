import type { PriceData } from 'gpt-tokenizer/modelTypes'
import { useMemo } from 'react'

import type { ChatMessage, ChatMessageWithId } from '../../types'
import type { TokenizerModule } from '../../hooks/useTokenizer'
import { analysePrompt } from '../../hooks/useTokenAnalysis'
import type { TokenSegment } from '../../types'
import { formatCurrency, formatNumber } from '../../lib/utils'
import Button from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { ChatMessageCard } from './ChatMessageCard'
import { TokenVisualizer } from '../tokenizer/TokenVisualizer'

interface ChatPlaygroundProps {
  messages: ChatMessageWithId[]
  onMessageChange: (id: string, partial: Partial<ChatMessage>) => void
  onAddMessage: () => void
  onRemoveMessage: (id: string) => void
  tokenizer: TokenizerModule | null
  tokens: number[]
  cost: PriceData | undefined
  sanitizedCount: number
  error: string | null
  showTokenIds: boolean
  segments: TokenSegment[]
}

type MessageAnalysis = {
  tokens: number[]
  segments: TokenSegment[]
}

export function ChatPlayground({
  messages,
  onMessageChange,
  onAddMessage,
  onRemoveMessage,
  tokenizer,
  tokens,
  cost,
  sanitizedCount,
  error,
  showTokenIds,
  segments,
}: ChatPlaygroundProps) {
  const messageAnalyses = useMemo(() => {
    if (!tokenizer) return new Map<string, MessageAnalysis>()

    return new Map(
      messages.map((message) => {
        const content = message.content
        if (!content) {
          return [message.id, { tokens: [], segments: [] }]
        }

        try {
          const { tokens: encoded, segments } = analysePrompt(tokenizer, content)
          return [message.id, { tokens: encoded, segments }]
        } catch (analysisError) {
          console.warn('Failed to encode chat message', analysisError)
          return [message.id, { tokens: [], segments: [] }]
        }
      }),
    )
  }, [messages, tokenizer])

  return (
    <Card>
      <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Chat prompt builder</CardTitle>
        </div>
        <Button variant="subtle" onClick={onAddMessage}>
          + Add message
        </Button>
      </CardHeader>
      <CardContent className="gap-6">
        <div className="flex flex-col gap-4">
          {messages.map((message) => {
            const analysis = messageAnalyses.get(message.id) ?? {
              tokens: [],
              segments: [],
            }
            return (
              <ChatMessageCard
                key={message.id}
                message={message}
                tokenCount={analysis.tokens.length}
                segments={analysis.segments}
                showTokenIds={showTokenIds}
                onChange={onMessageChange}
                onRemove={onRemoveMessage}
                disabled={!tokenizer}
              />
            )
          })}
          {messages.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start by adding at least one message to evaluate chat token usage.
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Chat tokens
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {formatNumber(tokens.length, 0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Across {sanitizedCount} messages
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estimated input cost
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
              {formatCurrency(cost?.main?.input)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Main API
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Batch estimate
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {formatCurrency(cost?.batch?.input)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Batch endpoint
            </p>
          </div>
        </div>

        <TokenVisualizer
          segments={segments}
          showTokenIds={showTokenIds}
          error={error}
        />
      </CardContent>
    </Card>
  )
}
