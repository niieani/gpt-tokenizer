import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { Card, CardContent } from '../ui/card'
import { Select } from '../ui/select'
import type { TokenAnalysis } from '../../hooks/useTokenAnalysis'
import type { ModelOption } from '../../lib/models'
import { cn } from '../../lib/utils'
import { CostBreakdown } from './CostBreakdown'
import { TokenStats } from './TokenStats'
import { TokenInput } from './TokenInput'

interface TokenizerPlaygroundProps {
  modelName: string
  onModelChange: (modelName: string) => void
  modelOptions: ModelOption[]
  modelSpec: ModelSpec | undefined
  prompt: string
  onPromptChange: (value: string) => void
  showTokenIds: boolean
  onToggleTokenIds: (show: boolean) => void
  tokenAnalysis: TokenAnalysis
  tokensPerHundredChars: number
  isLoading: boolean
  tokenizerReady: boolean
  loadError: string | null
}

export function TokenizerPlayground({
  modelName,
  onModelChange,
  modelOptions,
  modelSpec,
  prompt,
  onPromptChange,
  showTokenIds,
  onToggleTokenIds,
  tokenAnalysis,
  tokensPerHundredChars,
  isLoading,
  tokenizerReady,
  loadError,
}: TokenizerPlaygroundProps) {
  const statusState = isLoading ? 'Loading' : tokenizerReady ? 'Ready' : 'Offline'
  const statusColor =
    statusState === 'Ready'
      ? 'bg-emerald-400/90 dark:bg-emerald-400/70'
      : statusState === 'Loading'
        ? 'bg-amber-400/90 dark:bg-amber-400/70'
        : 'bg-rose-500/80 dark:bg-rose-500/70'

  return (
    <Card className="p-5 md:p-6">
      <CardContent className="gap-6 p-0">
        <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <label
                htmlFor="model"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Model
              </label>
              <div className="flex items-center gap-2">
                <Select
                  id="model"
                  value={modelName}
                  onChange={(event) => onModelChange(event.target.value)}
                  disabled={isLoading}
                  className="min-w-[200px] text-sm sm:min-w-[240px] sm:text-base"
                >
                  {modelOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </Select>
                <span
                  className="flex items-center"
                  role="status"
                  aria-live="polite"
                  aria-label={`Tokenizer status: ${statusState.toLowerCase()}`}
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full', statusColor)} aria-hidden="true" />
                  <span className="sr-only">{statusState}</span>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleTokenIds(!showTokenIds)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors',
                showTokenIds
                  ? 'border-sky-400/70 bg-sky-500/10 text-sky-700 dark:border-sky-500/60 dark:bg-sky-500/20 dark:text-sky-100'
                  : 'border-slate-200/70 bg-white/95 text-slate-600 hover:bg-slate-100 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900/80',
              )}
              aria-pressed={showTokenIds}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  showTokenIds ? 'bg-sky-500 dark:bg-sky-400' : 'bg-slate-400 dark:bg-slate-500',
                )}
                aria-hidden="true"
              />
              Show all tokens
            </button>
          </div>
          {loadError && (
            <p className="rounded-2xl border border-rose-400/50 bg-rose-100/70 px-3 py-2 text-sm text-rose-700 shadow-sm dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100">
              {loadError}
            </p>
          )}
        </div>
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
