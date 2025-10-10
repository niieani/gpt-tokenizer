import { useCallback, useMemo, useRef } from 'react'

import { colorForToken, formatTokenValue } from '../../lib/token-display'
import { cn } from '../../lib/utils'
import type { TokenSegment } from '../../types'

interface TokenInputProps {
  value: string
  onChange: (value: string) => void
  segments: TokenSegment[]
  placeholder?: string
  showTokenIds: boolean
  disabled?: boolean
  isLoading?: boolean
  className?: string
  minHeight?: number
  ariaLabel?: string
}

export function TokenInput({
  value,
  onChange,
  segments,
  placeholder = 'Type or paste text to tokenize…',
  showTokenIds,
  disabled = false,
  isLoading = false,
  className,
  minHeight = 220,
  ariaLabel = 'Text input',
}: TokenInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !overlayRef.current) return
    overlayRef.current.scrollTop = textareaRef.current.scrollTop
    overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
  }, [])

  const tokenElements = useMemo(() => {
    if (segments.length === 0) return null

    return segments.map((segment, index) => {
      const display = formatTokenValue(segment.token, showTokenIds, segment.text)
      const styles = colorForToken(segment.token)
      const title = showTokenIds
        ? segment.text.replace(/\n/g, '\\n') || '↵'
        : `Token #${segment.token}`

      return (
        <span
          key={`${segment.token}-${segment.start}-${index}`}
          data-token-start={segment.start}
          className="group relative inline-block cursor-text whitespace-pre"
        >
          <span
            className={cn(
              'inline-flex whitespace-pre rounded-xl border px-2 py-1 font-mono text-sm leading-relaxed shadow-[0_1px_4px_rgba(15,23,42,0.12)] transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(14,116,144,0.18)] dark:shadow-none',
              showTokenIds ? 'font-semibold' : 'font-normal',
            )}
            style={styles}
            title={title}
          >
            {display === '' ? '\u00A0' : display}
          </span>
          <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-100 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
            #{segment.token}
          </span>
        </span>
      )
    })
  }, [segments, showTokenIds])

  return (
    <div
      className={cn(
        'relative rounded-3xl border border-slate-300/80 bg-white/80 shadow-lg ring-offset-2 transition-colors focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200/60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:focus-within:border-sky-400/80 dark:focus-within:ring-sky-500/40',
        disabled && 'opacity-60',
        className,
      )}
      style={{ minHeight }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        disabled={disabled}
        className="absolute inset-0 h-full w-full resize-none rounded-3xl border-none bg-transparent px-6 py-5 font-sans text-base leading-relaxed text-transparent caret-slate-900 selection:bg-sky-200/40 focus:outline-none dark:caret-slate-100 dark:selection:bg-sky-500/30"
        aria-label={ariaLabel}
      />
      <div
        ref={overlayRef}
        className="pointer-events-auto absolute inset-0 overflow-auto rounded-3xl px-6 py-5 text-base leading-relaxed text-slate-700 dark:text-slate-200"
        onMouseDown={(event) => {
          if (!textareaRef.current) return
          const span = (event.target as HTMLElement).closest('[data-token-start]') as HTMLElement | null
          event.preventDefault()
          textareaRef.current.focus()
          const caret = span ? Number(span.dataset.tokenStart) : value.length
          const resolvedCaret = Number.isFinite(caret) ? caret : value.length
          textareaRef.current.setSelectionRange(resolvedCaret, resolvedCaret)
        }}
      >
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading tokenizer…</p>
        ) : tokenElements ? (
          <div className="flex flex-wrap gap-x-1.5 gap-y-2 whitespace-pre-wrap">{tokenElements}</div>
        ) : value.length === 0 ? (
          <span className="text-sm text-slate-400 dark:text-slate-500">{placeholder}</span>
        ) : disabled ? (
          <span className="text-sm text-slate-500 dark:text-slate-400">Tokenizer is preparing — highlights will appear shortly.</span>
        ) : (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            No tokens returned. Try adjusting the text or switching models.
          </span>
        )}
      </div>
    </div>
  )
}
