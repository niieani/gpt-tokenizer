import type { ReactNode } from 'react'
import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn, formatCurrency, formatNumber } from '../../lib/utils'

type PriceSegment = NonNullable<ModelSpec['price_data']>[keyof NonNullable<ModelSpec['price_data']>]

interface ModelInsightsProps {
  modelSpec: ModelSpec | undefined
}

const knowledgeCutoffFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function ModelInsights({ modelSpec }: ModelInsightsProps) {
  const pillPalette = [
    'border-sky-400/70 bg-sky-500/10 text-sky-700 dark:border-sky-500/50 dark:bg-sky-500/20 dark:text-sky-100',
    'border-emerald-400/70 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/25 dark:text-emerald-100',
    'border-indigo-400/70 bg-indigo-500/10 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-100',
    'border-amber-400/70 bg-amber-500/10 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/25 dark:text-amber-100',
    'border-rose-400/70 bg-rose-500/10 text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/20 dark:text-rose-100',
    'border-purple-400/70 bg-purple-500/10 text-purple-700 dark:border-purple-500/50 dark:bg-purple-500/20 dark:text-purple-100',
    'border-cyan-400/70 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/50 dark:bg-cyan-500/20 dark:text-cyan-100',
    'border-fuchsia-400/70 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-500/50 dark:bg-fuchsia-500/20 dark:text-fuchsia-100',
    'border-lime-400/70 bg-lime-500/10 text-lime-700 dark:border-lime-500/50 dark:bg-lime-500/25 dark:text-lime-100',
    'border-orange-400/70 bg-orange-500/10 text-orange-700 dark:border-orange-500/50 dark:bg-orange-500/25 dark:text-orange-100',
    'border-teal-400/70 bg-teal-500/10 text-teal-700 dark:border-teal-500/50 dark:bg-teal-500/25 dark:text-teal-100',
    'border-blue-400/70 bg-blue-500/10 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/25 dark:text-blue-100',
  ]

  const toLabel = (value: string) =>
    value
      .split(/[_-]/g)
      .map((segment) =>
        segment.length <= 3 ? segment.toUpperCase() : segment[0].toUpperCase() + segment.slice(1).toLowerCase(),
      )
      .join(' ')

  const renderPills = (items: string[] | undefined, keyPrefix: string) => {
    if (!items || items.length === 0) {
      return <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
    }

    return items.map((item, index) => (
      <span
        key={`${keyPrefix}-${item}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium capitalize shadow-sm backdrop-blur-sm',
          pillPalette[index % pillPalette.length],
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

  const renderPriceGroup = (heading: string, data: PriceSegment | undefined) => {
    if (!data) return null
    const entries = [
      data.input != null && { label: 'In', value: formatCurrency(data.input) },
      data.output != null && { label: 'Out', value: formatCurrency(data.output) },
      data.cached_input != null && { label: 'Cached In', value: formatCurrency(data.cached_input) },
      data.cached_output != null && { label: 'Cached Out', value: formatCurrency(data.cached_output) },
    ].filter(Boolean) as Array<{ label: string; value: string }>

    if (entries.length === 0) return null

    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">{heading}</div>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
          {entries.map((entry) => (
            <div
              key={`${heading}-${entry.label}`}
              className="rounded-xl border border-slate-200/70 bg-white/95 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <dt className="text-xs font-medium leading-tight text-slate-500 dark:text-slate-300 whitespace-nowrap">{entry.label}</dt>
              <dd className="mt-1 font-semibold leading-tight text-slate-800 dark:text-slate-100">{entry.value}</dd>
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
        renderPriceGroup('On-demand pricing', modelSpec.price_data.main),
        renderPriceGroup('Batch pricing', modelSpec.price_data.batch),
      ].filter(Boolean)
    : []

  const knowledgeCutoff = modelSpec?.knowledge_cutoff
  const knowledgeCutoffDisplay = knowledgeCutoff ? knowledgeCutoffFormatter.format(knowledgeCutoff) : null

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle>Model insights</CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Understand capabilities, modalities and pricing pulled directly from gpt-tokenizer metadata.
        </p>
      </CardHeader>
      <CardContent className="gap-5">
        {modelSpec ? (
          <>
            {knowledgeCutoffDisplay && (
              <section>
                <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Knowledge cutoff</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{knowledgeCutoffDisplay}</p>
                </div>
              </section>
            )}

            <dl className="grid grid-cols-1 gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Context window</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.context_window ? (
                    <>
                      {formatNumber(modelSpec.context_window, 0)}
                      <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">tok</span>
                    </>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Max output tokens</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.max_output_tokens ? (
                    <>
                      {formatNumber(modelSpec.max_output_tokens, 0)}
                      <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">tok</span>
                    </>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Performance</dt>
                <dd className="mt-1">{renderMetricIcons(modelSpec.performance, '⚡', 'performance')}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Latency</dt>
                <dd className="mt-1">{renderMetricIcons(modelSpec.latency, '🕒', 'latency')}</dd>
              </div>
            </dl>

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

            <section className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300">
              <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Pricing (per 1M tokens)</h4>
              <div className="grid gap-4 lg:grid-cols-2">
                {priceGroups.length > 0 ? (
                  priceGroups
                ) : (
                  <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">Pricing data not available.</p>
                )}
              </div>
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
