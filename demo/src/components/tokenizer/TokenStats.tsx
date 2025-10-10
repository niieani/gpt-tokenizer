import type { PriceData } from 'gpt-tokenizer/modelTypes'

import { formatCurrency, formatNumber } from '../../lib/utils'

interface TokenStatsProps {
  tokenCount: number
  tokensPerHundredChars: number
  cost: PriceData | undefined
  isLoading: boolean
  tokenizerReady: boolean
  modelName: string
}

export function TokenStats({
  tokenCount,
  tokensPerHundredChars,
  cost,
  isLoading,
  tokenizerReady,
  modelName,
}: TokenStatsProps) {
  const status = isLoading ? 'Loading…' : tokenizerReady ? 'Ready' : 'Offline'

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tokens</p>
        <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{formatNumber(tokenCount, 0)}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{tokensPerHundredChars.toFixed(2)} tokens / 100 chars</p>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Estimated cost</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-200">{formatCurrency(cost?.main?.input)}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Input channel · live estimate</p>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tokenizer status</p>
        <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{status}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{modelName}</p>
      </div>
    </div>
  )
}
