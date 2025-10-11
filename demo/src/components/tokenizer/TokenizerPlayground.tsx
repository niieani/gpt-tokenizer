import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import type { TokenAnalysis } from '../../hooks/useTokenAnalysis'
import { Card, CardContent } from '../ui/card'
import { CostBreakdown } from './CostBreakdown'
import { TokenStats } from './TokenStats'
import { TokenInput } from './TokenInput'

interface TokenizerPlaygroundProps {
  modelSpec: ModelSpec | undefined
  prompt: string
  onPromptChange: (value: string) => void
  showTokenIds: boolean
  tokenAnalysis: TokenAnalysis
  tokensPerHundredChars: number
  isLoading: boolean
  tokenizerReady: boolean
}

export function TokenizerPlayground({
  modelSpec,
  prompt,
  onPromptChange,
  showTokenIds,
  tokenAnalysis,
  tokensPerHundredChars,
  isLoading,
  tokenizerReady,
}: TokenizerPlaygroundProps) {
  return (
    <Card className="p-5 md:p-6">
      <CardContent className="gap-6 p-0">
        <TokenInput
          value={prompt}
          onChange={onPromptChange}
          segments={tokenAnalysis.segments}
          showTokenIds={showTokenIds}
          disabled={!tokenizerReady}
          isLoading={isLoading}
          ariaLabel="Prompt input"
          size="prominent"
          minHeight={260}
        />

        <TokenStats
          tokenCount={tokenAnalysis.tokens.length}
          tokensPerHundredChars={tokensPerHundredChars}
          cost={tokenAnalysis.cost}
          isLoading={isLoading}
          contextWindow={modelSpec?.context_window}
        />

        <CostBreakdown cost={tokenAnalysis.cost} />

        {tokenAnalysis.error && (
          <p className="rounded-2xl bg-rose-100/80 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">
            {tokenAnalysis.error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
