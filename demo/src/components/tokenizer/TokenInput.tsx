import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { colorForToken } from '../../lib/token-display'
import { cn } from '../../lib/utils'
import type { TokenSegment } from '../../types'

const HSLA_REGEX =
  /hsla?\(\s*([-+]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*([-+]?(?:\d+(?:\.\d+)?|\.\d+))%\s*,\s*([-+]?(?:\d+(?:\.\d+)?|\.\d+))%\s*(?:,\s*([-+]?(?:\d+(?:\.\d+)?|\.\d+))\s*)?\)/i

interface HslaAdjustmentOptions {
  lightnessMultiplier?: number
  lightnessOffset?: number
  alphaOffset?: number
}

function adjustHslaColor(
  input: string | undefined,
  { lightnessMultiplier = 1, lightnessOffset = 0, alphaOffset = 0 }: HslaAdjustmentOptions = {},
) {
  if (!input) return undefined
  const match = input.match(HSLA_REGEX)
  if (!match) return undefined

  const [, rawHue, rawSat, rawLight, rawAlpha] = match
  const hue = Number.parseFloat(rawHue)
  const saturation = Number.parseFloat(rawSat)
  const lightness = Number.parseFloat(rawLight)
  const alpha = rawAlpha == null ? 1 : Number.parseFloat(rawAlpha)

  if (
    Number.isNaN(hue) ||
    Number.isNaN(saturation) ||
    Number.isNaN(lightness) ||
    Number.isNaN(alpha)
  ) {
    return undefined
  }

  const nextLightness = Math.min(100, Math.max(0, lightness * lightnessMultiplier + lightnessOffset))
  const nextAlpha = Math.min(1, Math.max(0, alpha + alphaOffset))

  return `hsla(${hue}, ${saturation}%, ${nextLightness}%, ${nextAlpha})`
}

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
  // Track the active pointer selection gesture originating from the overlay.
  const pointerStateRef = useRef<{ id: number; anchor: number } | null>(null)

  const [selectionRange, setSelectionRange] = useState<[number, number] | null>(null)
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(null)
  const [activeTokenSource, setActiveTokenSource] = useState<'hover' | 'caret'>('caret')
  const [isFocused, setIsFocused] = useState(false)

  const clampCaret = useCallback(
    (index: number) => Math.max(0, Math.min(value.length, index)),
    [value.length],
  )

  const getTokenElementAtPoint = useCallback((clientX: number, clientY: number) => {
    const doc = overlayRef.current?.ownerDocument ?? document
    const target = doc.elementFromPoint(clientX, clientY)
    return (target as Element | null)?.closest('[data-token-index]') as HTMLElement | null
  }, [])

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

  // Map overlay hit positions back to source string offsets for caret/selection syncing.
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

  const syncSelectionFromTextarea = useCallback(() => {
    const element = textareaRef.current
    if (!element) return
    const { selectionStart, selectionEnd } = element
    if (selectionStart == null || selectionEnd == null) return
    setSelectionRange((prev) => {
      if (prev && prev[0] === selectionStart && prev[1] === selectionEnd) return prev
      return [selectionStart, selectionEnd]
    })
  }, [])

  useEffect(() => {
    syncSelectionFromTextarea()
  }, [value.length, syncSelectionFromTextarea])

  const handleOverlayPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!textareaRef.current) return
      if (event.button !== 0) return

      const tokenElement = getTokenElementAtPoint(event.clientX, event.clientY)
      if (tokenElement) {
        const index = Number(tokenElement.dataset.tokenIndex)
        if (Number.isFinite(index)) {
          setHoveredTokenIndex(index)
          setActiveTokenSource('hover')
        } else {
          setHoveredTokenIndex(null)
          setActiveTokenSource('caret')
        }
      } else {
        setHoveredTokenIndex(null)
        setActiveTokenSource('caret')
      }

      event.preventDefault()
      const caretIndex = clampCaret(resolveCaretIndex(event.nativeEvent))
      pointerStateRef.current = { id: event.pointerId, anchor: caretIndex }

      setIsFocused(true)
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(caretIndex, caretIndex)
      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(caretIndex, caretIndex)
        syncSelectionFromTextarea()
      })

      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [clampCaret, getTokenElementAtPoint, resolveCaretIndex, setActiveTokenSource, syncSelectionFromTextarea],
  )

  const handleOverlayPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isFocused && !pointerStateRef.current) return
      const tokenElement = getTokenElementAtPoint(event.clientX, event.clientY)
      if (tokenElement) {
        const index = Number(tokenElement.dataset.tokenIndex)
        if (Number.isFinite(index)) {
          setHoveredTokenIndex(index)
          setActiveTokenSource('hover')
        } else {
          setHoveredTokenIndex(null)
          setActiveTokenSource('caret')
        }
      } else {
        setHoveredTokenIndex(null)
        setActiveTokenSource('caret')
      }

      if (!textareaRef.current) return
      const pointerState = pointerStateRef.current
      if (!pointerState || pointerState.id !== event.pointerId) return

      const caretIndex = clampCaret(resolveCaretIndex(event.nativeEvent))
      const start = Math.min(pointerState.anchor, caretIndex)
      const end = Math.max(pointerState.anchor, caretIndex)

      textareaRef.current.setSelectionRange(start, end)
      setSelectionRange((prev) => {
        if (prev && prev[0] === start && prev[1] === end) return prev
        return [start, end]
      })
    },
    [clampCaret, getTokenElementAtPoint, isFocused, resolveCaretIndex, setActiveTokenSource],
  )

  const handleOverlayPointerUpOrCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointerState = pointerStateRef.current
      if (pointerState && pointerState.id === event.pointerId) {
        pointerStateRef.current = null
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      if (event.type === 'pointercancel' || !isFocused) {
        setHoveredTokenIndex(null)
        setActiveTokenSource('caret')
      } else {
        const tokenElement = getTokenElementAtPoint(event.clientX, event.clientY)
        if (tokenElement) {
          const index = Number(tokenElement.dataset.tokenIndex)
          if (Number.isFinite(index)) {
            setHoveredTokenIndex(index)
            setActiveTokenSource('hover')
          } else {
            setHoveredTokenIndex(null)
            setActiveTokenSource('caret')
          }
        } else {
          setHoveredTokenIndex(null)
          setActiveTokenSource('caret')
        }
      }
      syncSelectionFromTextarea()
    },
    [getTokenElementAtPoint, isFocused, setActiveTokenSource, syncSelectionFromTextarea],
  )

  const handleOverlayPointerLeave = useCallback(() => {
    if (!pointerStateRef.current) {
      setHoveredTokenIndex(null)
      setActiveTokenSource('caret')
    }
  }, [setActiveTokenSource])

  const handleTextareaFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleTextareaBlur = useCallback(() => {
    setIsFocused(false)
    setHoveredTokenIndex(null)
    setSelectionRange(null)
    pointerStateRef.current = null
  }, [])

  const handleTextareaKeyDown = useCallback(() => {
    setActiveTokenSource('caret')
  }, [setActiveTokenSource])

  useEffect(() => {
    if (!isFocused) {
      setHoveredTokenIndex((current) => (current === null ? current : null))
    }
  }, [isFocused])

  const tokenElements = useMemo(() => {
    if (segments.length === 0) return null

    const caretIndex =
      selectionRange && selectionRange[0] === selectionRange[1]
        ? selectionRange[0]
        : null

    const caretReferenceIndex =
      caretIndex == null ? null : caretIndex > 0 ? caretIndex - 1 : null

    const caretTokenIndexRaw =
      caretReferenceIndex == null
        ? null
        : segments.findIndex(
            (segment) =>
              caretReferenceIndex >= segment.start && caretReferenceIndex < segment.end,
          )
    const caretTokenIndex =
      caretTokenIndexRaw != null && caretTokenIndexRaw >= 0 ? caretTokenIndexRaw : null

    const hoveredActiveIndex = isFocused ? hoveredTokenIndex : null
    const caretActiveIndex = isFocused ? caretTokenIndex : null
    const activeTokenIndex =
      activeTokenSource === 'hover'
        ? hoveredActiveIndex ?? caretActiveIndex
        : caretActiveIndex ?? hoveredActiveIndex

    return segments.map((segment, index) => {
      const textContent = segment.text === '' ? '\u00A0' : segment.text
      const styles = colorForToken(segment.token)
      const title = showTokenIds
        ? segment.text.replace(/\n/g, '\\n') || '↵'
        : `Token #${segment.token}`

      const isHovered = hoveredActiveIndex === index
      const isSelected = selectionRange
        ? Math.max(segment.start, selectionRange[0]) < Math.min(segment.end, selectionRange[1]) && isFocused
        : false
      const isActive = activeTokenIndex === index

      const baseLabelBackground = styles.emphasisBackgroundColor ?? styles.backgroundColor

      const persistentLightBackground = showTokenIds
        ? adjustHslaColor(baseLabelBackground, { lightnessMultiplier: 0.42, alphaOffset: 0.18 })
        : undefined

      const persistentDarkBackground = showTokenIds
        ? adjustHslaColor(baseLabelBackground, { lightnessMultiplier: 1.35, alphaOffset: -0.12 })
        : undefined

      const chipStyle = {
        '--token-bg': styles.backgroundColor,
        '--token-highlight':
          styles.emphasisBackgroundColor ?? styles.backgroundColor,
        '--token-border': styles.borderColor,
        '--token-color': styles.color,
        '--token-fill': styles.backgroundColor,
        '--token-label-color': styles.color,
      } as CSSProperties

      if (showTokenIds) {
        chipStyle['--token-label-bg'] =
          persistentLightBackground ?? 'rgba(15, 23, 42, 0.82)'
        chipStyle['--token-label-bg-light'] = chipStyle['--token-label-bg']
        chipStyle['--token-label-bg-dark'] =
          persistentDarkBackground ?? 'rgba(248, 250, 252, 0.76)'

        const labelBorderLight = styles.borderColor ?? 'rgba(15, 23, 42, 0.32)'
        const labelBorderDark =
          adjustHslaColor(styles.borderColor, { lightnessMultiplier: 1.25, alphaOffset: -0.18 }) ??
          'rgba(15, 23, 42, 0.22)'

        chipStyle['--token-label-border'] = labelBorderLight
        chipStyle['--token-label-border-light'] = labelBorderLight
        chipStyle['--token-label-border-dark'] = labelBorderDark

        chipStyle['--token-label-color-light'] = '#ffffff'
        chipStyle['--token-label-color-dark'] = '#020617'
      }

      return (
        <span
          key={`${segment.token}-${segment.start}-${index}`}
          data-token-start={segment.start}
          data-token-length={segment.end - segment.start}
          data-token-index={index}
          className={cn(
            'token-chip group whitespace-pre',
            showTokenIds && 'token-chip--ids',
            isHovered && 'token-chip--hovered',
            isSelected && 'token-chip--selected',
            isActive && 'token-chip--active',
          )}
          style={chipStyle}
          title={title}
        >
          <span className="token-chip__text">{textContent}</span>
          <span
            className={cn(
              'token-chip__label pointer-events-none absolute font-semibold transition-all',
              showTokenIds
                ? 'token-chip__label--persistent text-[9px] rounded-none'
                : 'rounded-full -top-6 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-100 opacity-0 shadow-sm group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900',
            )}
          >
            {segment.token}
          </span>
        </span>
      )
    })
  }, [activeTokenSource, hoveredTokenIndex, isFocused, segments, selectionRange, showTokenIds])

  return (
    <div
      className={cn(
        'relative rounded-3xl border border-slate-300/70 bg-slate-50/90 shadow-lg ring-offset-2 transition-colors focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200/60 dark:border-slate-700/70 dark:bg-slate-950/70 dark:focus-within:border-sky-400/80 dark:focus-within:ring-sky-500/40',
        disabled && 'opacity-60',
        className,
      )}
      style={{ minHeight }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          setActiveTokenSource('caret')
          onChange(event.target.value)
        }}
        onScroll={handleScroll}
        onFocus={handleTextareaFocus}
        onBlur={handleTextareaBlur}
        onKeyDown={handleTextareaKeyDown}
        onSelect={syncSelectionFromTextarea}
        onKeyUp={syncSelectionFromTextarea}
        onMouseUp={() => {
          setActiveTokenSource('caret')
          syncSelectionFromTextarea()
        }}
        spellCheck={false}
        disabled={disabled}
        className={cn(
          'absolute inset-0 z-10 h-full w-full resize-none rounded-3xl border-none bg-transparent px-6 py-5 font-mono text-[15px] text-transparent caret-slate-900 selection:bg-sky-200/40 focus:outline-none dark:caret-slate-100 dark:selection:bg-sky-500/30',
          showTokenIds ? 'leading-[2.8]' : 'leading-relaxed',
          'transition-[line-height] duration-200 ease-out',
        )}
        aria-label={ariaLabel}
      />
      <div
        ref={overlayRef}
        className={cn(
          'absolute inset-0 z-20 overflow-auto rounded-3xl px-6 py-5 font-mono text-[15px] text-slate-700 select-none cursor-text dark:text-slate-200',
          showTokenIds ? 'leading-[2.8]' : 'leading-relaxed',
          'transition-[line-height] duration-200 ease-out',
        )}
        onScroll={handleOverlayScroll}
        onPointerDown={handleOverlayPointerDown}
        onPointerMove={handleOverlayPointerMove}
        onPointerUp={handleOverlayPointerUpOrCancel}
        onPointerCancel={handleOverlayPointerUpOrCancel}
        onPointerLeave={handleOverlayPointerLeave}
      >
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading tokenizer…
          </p>
        ) : tokenElements ? (
          <div className="whitespace-pre-wrap">{tokenElements}</div>
        ) : value.length === 0 ? (
          <span className="font-sans text-sm text-slate-400 dark:text-slate-500">
            {placeholder}
          </span>
        ) : disabled ? (
          <span className="font-sans text-sm text-slate-500 dark:text-slate-400">
            Tokenizer is preparing — highlights will appear shortly.
          </span>
        ) : (
          <span className="font-sans text-sm text-slate-500 dark:text-slate-400">
            No tokens returned. Try adjusting the text or switching models.
          </span>
        )}
      </div>
    </div>
  )
}
