import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Switch } from '../ui/switch'
import type { TokenAnalysis } from '../../hooks/useTokenAnalysis'
import type { ModelOption } from '../../lib/models'
import { formatNumber } from '../../lib/utils'
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
  const pricePerMillion = modelSpec?.price_data?.main

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Tokenizer playground</CardTitle>
            <CardDescription>
              Analyse prompts with live token highlights, per-model pricing and quick comparisons.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Switch checked={showTokenIds} onChange={(event) => onToggleTokenIds(event.target.checked)} />
            <span>{showTokenIds ? 'Showing token IDs' : 'Showing decoded text'}</span>
          </div>
        </div>
        {loadError && (
          <p className="rounded-2xl bg-rose-100/80 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">
            {loadError}
          </p>
        )}
      </CardHeader>
      <CardContent className="gap-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
          <div className="flex flex-col gap-3">
            <Label htmlFor="model">Model</Label>
            <Select
              id="model"
              value={modelName}
              onChange={(event) => onModelChange(event.target.value)}
              disabled={isLoading}
            >
              {modelOptions.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                </option>
              ))}
            </Select>
            {modelSpec?.context_window && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Context window: {formatNumber(modelSpec.context_window, 0)} tokens
              </p>
            )}
            {pricePerMillion?.input && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Input price: ${pricePerMillion.input} / 1M tokens
              </p>
            )}
            {pricePerMillion?.output && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Output price: ${pricePerMillion.output} / 1M tokens
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="prompt">Prompt</Label>
            <TokenInput
              value={prompt}
              onChange={onPromptChange}
              segments={tokenAnalysis.segments}
              showTokenIds={showTokenIds}
              disabled={!tokenizerReady}
              isLoading={isLoading}
              ariaLabel="Prompt input"
            />
          </div>
        </div>

        <TokenStats
          tokenCount={tokenAnalysis.tokens.length}
          tokensPerHundredChars={tokensPerHundredChars}
          cost={tokenAnalysis.cost}
          isLoading={isLoading}
          tokenizerReady={tokenizerReady}
          modelName={modelName}
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
