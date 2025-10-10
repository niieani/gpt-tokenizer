import {
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { colorForToken } from '../../lib/token-display'
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
    if (overlayRef.current.scrollTop !== textareaRef.current.scrollTop) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
    }
    if (overlayRef.current.scrollLeft !== textareaRef.current.scrollLeft) {
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  const handleOverlayScroll = useCallback(() => {
    if (!textareaRef.current || !overlayRef.current) return
    if (textareaRef.current.scrollTop !== overlayRef.current.scrollTop) {
      textareaRef.current.scrollTop = overlayRef.current.scrollTop
    }
    if (textareaRef.current.scrollLeft !== overlayRef.current.scrollLeft) {
      textareaRef.current.scrollLeft = overlayRef.current.scrollLeft
    }
  }, [])

  const resolveCaretIndex = useCallback(
    (nativeEvent: MouseEvent | PointerEvent) => {
      const computeIndex = (node: Node | null, offset: number, clientX: number): number | null => {
        if (!node) return null

        if (node.nodeType === Node.TEXT_NODE) {
          const parentElement = (node.parentElement ?? (node.parentNode as Element | null)) as HTMLElement | null
          if (!parentElement) return null
          const tokenElement = parentElement.closest('[data-token-start]') as HTMLElement | null
          if (!tokenElement) return null
          const tokenStart = Number(tokenElement.dataset.tokenStart)
          const tokenLength = Number(tokenElement.dataset.tokenLength ?? 0)
          if (!Number.isFinite(tokenStart)) return null
          const safeLength = Number.isFinite(tokenLength) ? tokenLength : 0
          const safeOffset = Math.max(0, Math.min(offset, safeLength))
          return tokenStart + safeOffset
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          if (element.classList.contains('token-chip__text') && element.firstChild) {
            return computeIndex(element.firstChild, offset, clientX)
          }
          const tokenElement = element.closest('[data-token-start]') as HTMLElement | null
          if (tokenElement) {
            const tokenStart = Number(tokenElement.dataset.tokenStart)
            const tokenLength = Number(tokenElement.dataset.tokenLength ?? 0)
            if (!Number.isFinite(tokenStart)) return null
            if (Number.isFinite(tokenLength) && tokenLength > 0) {
              const rect = tokenElement.getBoundingClientRect()
              const midpoint = rect.left + rect.width / 2
              return tokenStart + (clientX > midpoint ? tokenLength : 0)
            }
            return tokenStart
          }
        }

        return null
      }

      const doc = nativeEvent.view?.document ?? document
      const extendedDoc = doc as Document & {
        caretRangeFromPoint?: (x: number, y: number) => Range | null
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
      }

      const tryRange = extendedDoc.caretRangeFromPoint?.(nativeEvent.clientX, nativeEvent.clientY)
      if (tryRange) {
        const index = computeIndex(tryRange.startContainer, tryRange.startOffset, nativeEvent.clientX)
        if (typeof index === 'number') return index
      }

      const tryPosition = extendedDoc.caretPositionFromPoint?.(nativeEvent.clientX, nativeEvent.clientY)
      if (tryPosition) {
        const index = computeIndex(tryPosition.offsetNode, tryPosition.offset, nativeEvent.clientX)
        if (typeof index === 'number') return index
      }

      const fallbackToken = (nativeEvent.target as Element | null)?.closest('[data-token-start]') as HTMLElement | null
      if (fallbackToken) {
        const tokenStart = Number(fallbackToken.dataset.tokenStart)
        const tokenLength = Number(fallbackToken.dataset.tokenLength ?? 0)
        if (Number.isFinite(tokenStart)) {
          if (Number.isFinite(tokenLength) && tokenLength > 0) {
            const rect = fallbackToken.getBoundingClientRect()
            const midpoint = rect.left + rect.width / 2
            return tokenStart + (nativeEvent.clientX > midpoint ? tokenLength : 0)
          }
          return tokenStart
        }
      }

      return value.length
    },
    [value.length],
  )

  const handleOverlayPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!textareaRef.current) return
      if (event.button !== 0) return

      const caretIndex = resolveCaretIndex(event.nativeEvent)
      const clampedCaret = Math.max(0, Math.min(value.length, caretIndex))

      event.preventDefault()
      textareaRef.current.focus()
      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(clampedCaret, clampedCaret)
      })

      const overlayEl = overlayRef.current
      if (overlayEl) {
        overlayEl.style.pointerEvents = 'none'

        const restore = () => {
          overlayEl.style.pointerEvents = ''
          window.removeEventListener('pointerup', restore, true)
          window.removeEventListener('pointercancel', restore, true)
        }

        window.addEventListener('pointerup', restore, true)
        window.addEventListener('pointercancel', restore, true)
      }
    },
    [resolveCaretIndex, value.length],
  )

  const tokenElements = useMemo(() => {
    if (segments.length === 0) return null

    return segments.map((segment, index) => {
      const textContent = segment.text === '' ? '\u00A0' : segment.text
      const styles = colorForToken(segment.token)
      const title = showTokenIds
        ? segment.text.replace(/\n/g, '\\n') || '↵'
        : `Token #${segment.token}`

      const chipStyle = {
        '--token-bg': styles.backgroundColor,
        '--token-border': styles.borderColor,
        '--token-color': styles.color,
      } as CSSProperties

      return (
        <span
          key={`${segment.token}-${segment.start}-${index}`}
          data-token-start={segment.start}
          data-token-length={segment.end - segment.start}
          className={cn('token-chip group whitespace-pre', showTokenIds && 'token-chip--ids')}
          style={chipStyle}
          title={title}
        >
          <span
            aria-hidden
            className="token-chip__background pointer-events-none transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(14,116,144,0.18)] dark:group-hover:shadow-none"
          />
          <span className="token-chip__text">{textContent}</span>
          {showTokenIds ? (
            <span className="token-chip__ids font-mono text-xs font-semibold tracking-tight">
              {segment.token}
            </span>
          ) : null}
          <span className="token-chip__label pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-100 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
            {segment.token}
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
        className="absolute inset-0 z-10 h-full w-full resize-none rounded-3xl border-none bg-transparent px-6 py-5 font-sans text-base leading-relaxed text-transparent caret-slate-900 selection:bg-sky-200/40 focus:outline-none dark:caret-slate-100 dark:selection:bg-sky-500/30"
        aria-label={ariaLabel}
      />
      <div
        ref={overlayRef}
        className="absolute inset-0 z-20 overflow-auto rounded-3xl px-6 py-5 font-sans text-base leading-relaxed text-slate-700 dark:text-slate-200"
        onScroll={handleOverlayScroll}
        onPointerDown={handleOverlayPointerDown}
      >
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading tokenizer…</p>
        ) : tokenElements ? (
          <div className="whitespace-pre-wrap">{tokenElements}</div>
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
