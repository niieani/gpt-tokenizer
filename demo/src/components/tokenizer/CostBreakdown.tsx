import type { PriceData } from 'gpt-tokenizer/modelTypes'

import { formatCurrency } from '../../lib/utils'

interface CostBreakdownProps {
  cost: PriceData | undefined
}

export function CostBreakdown({ cost }: CostBreakdownProps) {
  if (!cost) return null

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
      <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
        Cost breakdown (per request)
      </h3>
      <dl className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-4">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Input</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(cost.main?.input)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Output</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(cost.main?.output)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Cached input</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(cost.main?.cached_input)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Cached output</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(cost.main?.cached_output)}</dd>
        </div>
      </dl>
    </div>
  )
}
