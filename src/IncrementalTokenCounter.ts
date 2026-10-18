/** A token count that stays exact as a string is appended to or edited. */
export interface IncrementalTokenCounter {
  /** Replace the text, reusing its unchanged prefix and suffix. */
  update(text: string): number
  /** Append text. Previously counted tokens at the join may change. */
  append(text: string): number
  /**
   * Replace a range of UTF-16 code units. Both indexes must be nonnegative
   * safe integers and the range must lie inside the current text.
   * A failed edit leaves the text and count unchanged.
   */
  applyEdit(start: number, deleteCount: number, text: string): number
  count(): number
  /** Release the tracked text and boundaries. The encoding's cache is shared. */
  reset(): void
}

/** @internal A regex piece or special token, with an absolute UTF-16 end. */
export interface CountedPiece {
  end: number
  count: number
}

// First piece ending strictly after an offset (also the insertion index).
function upperBound(pieces: readonly CountedPiece[], offset: number): number {
  let low = 0
  let high = pieces.length
  while (low < high) {
    const mid = (low + high) >>> 1
    if (pieces[mid]!.end <= offset) low = mid + 1
    else high = mid
  }
  return low
}

/** @internal Tokenizer-owned callbacks keep regex and special policy here opaque. */
export function createCounter({
  scan,
  canRestart,
  validate,
  restartMargin,
  canReuseSuffix,
}: {
  scan: (text: string, start: number) => Iterable<CountedPiece>
  canRestart: (text: string, offset: number) => boolean
  validate: (text: string, start: number, insertedLength: number) => void
  restartMargin: number
  canReuseSuffix: boolean
}): IncrementalTokenCounter {
  let text = ''
  const pieces: CountedPiece[] = []
  let total = 0

  const applyEdit = (
    start: number,
    deleteCount: number,
    inserted: string,
  ): number => {
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(deleteCount) ||
      start < 0 ||
      deleteCount < 0 ||
      start > text.length ||
      deleteCount > text.length - start
    ) {
      throw new RangeError('The edit range must lie within the tracked text.')
    }
    if (deleteCount === 0 && inserted.length === 0) return total

    const next =
      text.slice(0, start) + inserted + text.slice(start + deleteCount)
    validate(next, start, inserted.length)

    // Restart only at a tokenizer-approved boundary with enough unchanged
    // context to rule out a special token spanning the edit and the boundary.
    let keep = upperBound(pieces, start - restartMargin)
    while (keep > 0 && !canRestart(text, pieces[keep - 1]!.end)) keep--
    const anchor = keep > 0 ? pieces[keep - 1]!.end : 0
    const delta = inserted.length - deleteCount
    const replacement: CountedPiece[] = []
    let resume = pieces.length
    for (const piece of scan(next, anchor)) {
      replacement.push(piece)
      const oldEnd = piece.end - delta
      if (
        !canReuseSuffix ||
        piece.end < start + inserted.length ||
        oldEnd < start + deleteCount
      ) {
        continue
      }
      const index = upperBound(pieces, oldEnd) - 1
      if (index >= keep && pieces[index]!.end === oldEnd) {
        // Both scans now see the same remaining text at the same piece
        // boundary. The built-in split patterns have no lookbehind.
        resume = index + 1
        break
      }
    }

    // Finish all potentially throwing work before publishing the new state.
    let nextTotal = total
    for (let i = keep; i < resume; i++) nextTotal -= pieces[i]!.count
    for (const piece of replacement) nextTotal += piece.count
    // Move the suffix in place. Unlike spreading into splice, copyWithin also
    // handles replacements larger than JavaScript's argument limit. Appends
    // never copy the prefix; equal-sized replacements never move the suffix.
    const oldLength = pieces.length
    const suffixStart = keep + replacement.length
    const nextLength = oldLength + replacement.length - (resume - keep)
    if (nextLength > oldLength) pieces.length = nextLength
    if (suffixStart !== resume) {
      pieces.copyWithin(suffixStart, resume, oldLength)
    }
    pieces.length = nextLength
    for (let i = 0; i < replacement.length; i++) {
      pieces[keep + i] = replacement[i]!
    }
    if (delta !== 0) {
      for (let i = suffixStart; i < pieces.length; i++) pieces[i]!.end += delta
    }
    text = next
    total = nextTotal
    return total
  }

  return {
    applyEdit,
    append: (inserted) => applyEdit(text.length, 0, inserted),
    update(next) {
      let start = 0
      const shared = Math.min(text.length, next.length)
      while (
        start < shared &&
        text.charCodeAt(start) === next.charCodeAt(start)
      ) {
        start++
      }
      let oldEnd = text.length
      let newEnd = next.length
      while (
        oldEnd > start &&
        newEnd > start &&
        text.charCodeAt(oldEnd - 1) === next.charCodeAt(newEnd - 1)
      ) {
        oldEnd--
        newEnd--
      }
      return applyEdit(start, oldEnd - start, next.slice(start, newEnd))
    },
    count: () => total,
    reset() {
      text = ''
      pieces.length = 0
      total = 0
    },
  }
}
