import type { PriceData } from 'gpt-tokenizer/modelTypes'

import { formatCurrency, formatNumber } from '../../lib/utils'

interface TokenStatsProps {
  tokenCount: number
  tokensPerHundredChars: number
  cost: PriceData | undefined
  isLoading: boolean
  contextWindow?: number
}

export function TokenStats({ tokenCount, tokensPerHundredChars, cost, isLoading, contextWindow }: TokenStatsProps) {
  const rawPercentUsed =
    contextWindow && contextWindow > 0 ? Math.min(100, (tokenCount / contextWindow) * 100) : undefined
  const percentDigits =
    rawPercentUsed === undefined ? 0 : rawPercentUsed >= 99 ? 0 : rawPercentUsed >= 10 ? 1 : 2
  const percentDisplay =
    rawPercentUsed === undefined
      ? '—'
      : new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: percentDigits,
        }).format(rawPercentUsed)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tokens</p>
        <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">
          {isLoading ? '—' : formatNumber(tokenCount, 0)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {tokensPerHundredChars.toFixed(2)} tokens / 100 chars
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tokens used</p>
        <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">
          {isLoading || rawPercentUsed === undefined ? '—' : `${percentDisplay}%`}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {contextWindow
            ? `${formatNumber(tokenCount, 0)} / ${formatNumber(contextWindow, 0)} tokens`
            : 'Context window unavailable'}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Estimated cost</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-600 dark:text-emerald-200">
          {formatCurrency(cost?.main?.input)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Input channel · live estimate</p>
      </div>
    </div>
  )
}
