import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { formatNumber } from '../../lib/utils'

interface ModelInsightsProps {
  modelSpec: ModelSpec | undefined
}

export function ModelInsights({ modelSpec }: ModelInsightsProps) {
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
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-200">
              <Badge className="border-slate-300/70 bg-slate-100 text-slate-700 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-100">
                {modelSpec.modalities.input.join(', ')} → {modelSpec.modalities.output.join(', ')}
              </Badge>
              {modelSpec.supported_features?.includes('streaming') && (
                <Badge className="border-sky-400/60 bg-sky-100 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200">
                  Streaming
                </Badge>
              )}
              {modelSpec.reasoning_tokens && (
                <Badge className="border-emerald-400/60 bg-emerald-100 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-400/15 dark:text-emerald-200">
                  Reasoning
                </Badge>
              )}
              {modelSpec.supported_endpoints.includes('chat_completions') && (
                <Badge className="border-indigo-400/60 bg-indigo-100 text-indigo-700 dark:border-indigo-400/50 dark:bg-indigo-400/15 dark:text-indigo-200">
                  Chat completions
                </Badge>
              )}
              {modelSpec.supported_endpoints.includes('responses') && (
                <Badge className="border-amber-400/60 bg-amber-100 text-amber-700 dark:border-amber-400/60 dark:bg-amber-400/20 dark:text-amber-100">
                  Responses API
                </Badge>
              )}
            </div>

            <dl className="grid grid-cols-1 gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Context window</dt>
                <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.context_window ? `${formatNumber(modelSpec.context_window, 0)} tokens` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Max output tokens</dt>
                <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.max_output_tokens ? `${formatNumber(modelSpec.max_output_tokens, 0)} tokens` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Performance tier</dt>
                <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.performance ? `${modelSpec.performance} / 3` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Latency tier</dt>
                <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modelSpec.latency ? `${modelSpec.latency} / 3` : '—'}
                </dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
              <p>
                Pricing (per 1M tokens) — Input: {modelSpec.price_data?.main?.input ?? '—'} · Output:{' '}
                {modelSpec.price_data?.main?.output ?? '—'}
              </p>
              {modelSpec.price_data?.batch && (
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Batch: input {modelSpec.price_data.batch.input ?? '—'} · output {modelSpec.price_data.batch.output ?? '—'}
                </p>
              )}
              {modelSpec.knowledge_cutoff && (
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Knowledge cutoff: {modelSpec.knowledge_cutoff.toISOString().slice(0, 10)}
                </p>
              )}
            </div>
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
