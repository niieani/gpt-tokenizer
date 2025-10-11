import { colorForToken, formatTokenValue } from '../../lib/token-display'
import type { TokenSegment } from '../../types'

interface TokenVisualizerProps {
  segments: TokenSegment[]
  showTokenIds: boolean
  error: string | null
}

export function TokenVisualizer({ segments, showTokenIds, error }: TokenVisualizerProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Tokenised conversation preview</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Hover to reveal {showTokenIds ? 'decoded text' : 'token IDs'}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-1.5 gap-y-2 whitespace-pre-wrap">
        {segments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tokens will appear here once the chat includes at least one message.
          </p>
        ) : (
          segments.map((segment, index) => {
            const color = colorForToken(segment.token)
            const display = formatTokenValue(segment.token, showTokenIds, segment.text)
            return (
              <span key={`${segment.token}-${segment.start}-${index}`} className="group relative inline-block whitespace-pre">
                <span
                  className="inline-flex whitespace-pre rounded-xl border px-2 py-1 font-mono text-xs leading-relaxed shadow-[0_1px_4px_rgba(15,23,42,0.12)] transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(14,116,144,0.18)] dark:shadow-none"
                  style={color}
                  title={
                    showTokenIds
                      ? segment.text.replace(/\n/g, '\\n') || '↵'
                      : `Token #${segment.token}`
                  }
                >
                  {display === '' ? '\u00A0' : display}
                </span>
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-100 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
                  #{segment.token}
                </span>
              </span>
            )
          })
        )}
      </div>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-100/70 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">
          {error}
        </p>
      )}
    </div>
  )
}
