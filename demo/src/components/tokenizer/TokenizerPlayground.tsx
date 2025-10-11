import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { Card, CardContent } from '../ui/card'
import { Select } from '../ui/select'
import { Switch } from '../ui/switch'
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
  const statusLabel = isLoading ? 'Loading' : tokenizerReady ? 'Ready' : 'Offline'
  const statusColor =
    statusLabel === 'Ready'
      ? 'bg-emerald-400/90 dark:bg-emerald-400/70'
      : statusLabel === 'Loading'
        ? 'bg-amber-400/90 dark:bg-amber-400/70'
        : 'bg-rose-500/80 dark:bg-rose-500/70'

  return (
    <Card className="gap-6 p-0">
      <CardContent className="gap-6 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <label htmlFor="model" className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Model
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
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
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className={cn('h-2.5 w-2.5 rounded-full', statusColor)} aria-hidden="true" />
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 font-medium shadow-sm transition-colors dark:border-slate-800/70 dark:bg-slate-950/70">
                <Switch
                  checked={showTokenIds}
                  onChange={(event) => onToggleTokenIds(event.target.checked)}
                  aria-label="Show all tokens"
                />
                <span className="text-sm">Show all tokens</span>
              </div>
            </div>
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
