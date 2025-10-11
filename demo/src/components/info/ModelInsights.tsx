import type { ReactNode } from 'react'
import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { cn, formatCurrency, formatNumber } from '../../lib/utils'

type PriceSegment = NonNullable<ModelSpec['price_data']>[keyof NonNullable<ModelSpec['price_data']>]

interface ModelInsightsProps {
  modelSpec: ModelSpec | undefined
}

export function ModelInsights({ modelSpec }: ModelInsightsProps) {
  const pillPalette = [
    'border-sky-400/70 bg-sky-500/10 text-sky-700 dark:border-sky-500/50 dark:bg-sky-500/20 dark:text-sky-100',
    'border-emerald-400/70 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100',
    'border-indigo-400/70 bg-indigo-500/10 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-100',
    'border-amber-400/70 bg-amber-500/10 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/20 dark:text-amber-100',
    'border-rose-400/70 bg-rose-500/10 text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/20 dark:text-rose-100',
    'border-purple-400/70 bg-purple-500/10 text-purple-700 dark:border-purple-500/50 dark:bg-purple-500/20 dark:text-purple-100',
  ]

  const hashIndex = (value: string) => {
    let hash = 0
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index)
      hash |= 0
    }
    return Math.abs(hash) % pillPalette.length
  }

  const toLabel = (value: string) =>
    value
      .split(/[_-]/g)
      .map((segment) => (segment.length <= 3 ? segment.toUpperCase() : segment[0].toUpperCase() + segment.slice(1)))
      .join(' ')

  const renderPills = (items: string[] | undefined, keyPrefix: string) => {
    if (!items || items.length === 0) {
      return <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
    }

    return items.map((item) => (
      <span
        key={`${keyPrefix}-${item}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide shadow-sm backdrop-blur-sm',
          pillPalette[hashIndex(item)],
        )}
      >
        {toLabel(item)}
      </span>
    ))
  }

  const renderMetricIcons = (count: number | undefined, icon: string, label: string) => {
    if (!count) {
      return <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
    }
    const safeCount = Math.max(0, Math.floor(count))
    return (
      <span className="inline-flex items-center gap-1 text-xl text-slate-700 dark:text-slate-100" aria-label={`${count} ${label}`}>
        <span className="sr-only">
          {safeCount} out of 3 {label}
        </span>
        {Array.from({ length: safeCount }).map((_, index) => (
          <span key={`${label}-${index}`} aria-hidden="true">
            {icon}
          </span>
        ))}
      </span>
    )
  }

  const renderPriceGroup = (heading: string, icon: string, data: PriceSegment | undefined) => {
    if (!data) return null
    const entries = [
      data.input != null && { label: 'Input', value: formatCurrency(data.input), symbol: '⬅️' },
      data.output != null && { label: 'Output', value: formatCurrency(data.output), symbol: '➡️' },
      data.cached_input != null && { label: 'Cached input', value: formatCurrency(data.cached_input), symbol: '🗃️' },
      data.cached_output != null && { label: 'Cached output', value: formatCurrency(data.cached_output), symbol: '🗂️' },
    ].filter(Boolean) as Array<{ label: string; value: string; symbol: string }>

    if (entries.length === 0) return null

    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-100">
          <span aria-hidden="true">{icon}</span>
          {heading}
        </div>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
          {entries.map((entry) => (
            <div key={`${heading}-${entry.label}`} className="rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/80">
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {entry.symbol} {entry.label}
              </dt>
              <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    )
  }

  const featureItems = modelSpec
    ? [
        ...(modelSpec.supported_features ?? []),
        ...(modelSpec.reasoning_tokens ? ['reasoning_tokens'] : []),
      ]
    : []

  const endpointItems = modelSpec?.supported_endpoints ?? []

  const priceGroups: ReactNode[] = modelSpec?.price_data
    ? [
        renderPriceGroup('On-demand', '💡', modelSpec.price_data.main),
        renderPriceGroup('Batch', '📦', modelSpec.price_data.batch),
      ].filter(Boolean)
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model insights</CardTitle>
        <CardDescription>
          Understand capabilities, modalities and pricing pulled directly from gpt-tokenizer metadata.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-5">
        {modelSpec ? (
          <>
            <section className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Input modalities</p>
                <div className="mt-2 flex flex-wrap gap-2">{renderPills(modelSpec.modalities.input, 'input')}</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Output modalities</p>
                <div className="mt-2 flex flex-wrap gap-2">{renderPills(modelSpec.modalities.output, 'output')}</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Supported features</p>
                <div className="mt-2 flex flex-wrap gap-2">{renderPills(featureItems, 'feature')}</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Supported endpoints</p>
                <div className="mt-2 flex flex-wrap gap-2">{renderPills(endpointItems, 'endpoint')}</div>
              </div>
            </section>

            <dl className="grid grid-cols-1 gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Context window</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.context_window ? `${formatNumber(modelSpec.context_window, 0)} tokens` : '—'}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Max output tokens</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.max_output_tokens ? `${formatNumber(modelSpec.max_output_tokens, 0)} tokens` : '—'}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Performance</dt>
                <dd className="mt-1">{renderMetricIcons(modelSpec.performance, '⚡', 'performance')}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Latency</dt>
                <dd className="mt-1">{renderMetricIcons(modelSpec.latency, '🕒', 'latency')}</dd>
              </div>
            </dl>

            <section className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300">
              <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Pricing (per 1M tokens)</h4>
              <div className="grid gap-4 lg:grid-cols-2">
                {priceGroups.length > 0 ? (
                  priceGroups
                ) : (
                  <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">Pricing data not available.</p>
                )}
              </div>
              {modelSpec.knowledge_cutoff && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Knowledge cutoff · {modelSpec.knowledge_cutoff.toISOString().slice(0, 10)}
                </p>
              )}
            </section>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We could not locate metadata for this model. Try selecting another model.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
