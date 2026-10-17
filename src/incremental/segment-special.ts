import type { GptEncoding } from '../GptEncoding.js'
import { escapeRegExp } from '../util.js'

export interface IncrementalTokenCounter {
  /**
   * Replaces the tracked text and returns the new token count.
   * Throws exactly like `encoding.countTokens(text)` would.
   */
  update(text: string): number
  /**
   * Applies an edit to the tracked text and returns the new token count.
   * `start` and `deleteCount` are JavaScript UTF-16 indexes with
   * String.prototype.slice clamping semantics.
   * Throws exactly like `encoding.countTokens` on the resulting text would.
   */
  applyEdit(start: number, deleteCount: number, insert: string): number
  /** Returns the token count of the currently tracked text. */
  count(): number
  /** Clears the tracked text. Memoization caches are kept. */
  reset(): void
}

export interface IncrementalCounterOptions {
  /**
   * Special tokens that are allowed to appear in the tracked text, mirroring
   * `EncodeOptions.allowedSpecial` for `countTokens`. Tokens not in the
   * encoding's special-token set are ignored. By default every special token
   * is disallowed and any occurrence throws, matching `countTokens`.
   */
  allowedSpecial?: Set<string>
}

interface SpecialPolicy {
  /** Allowed special tokens; undefined or empty means none are recognized. */
  allowed: Set<string> | undefined
  /** First-match regex over disallowed tokens, built like GptEncoding does. */
  disallowedRegex: RegExp | undefined
  maxDisallowedLen: number
  maxSpecialLen: number
}

interface SpecialSegment {
  kind: 'special'
  start: number
  end: number
  total: number
}

interface PlainSegment {
  kind: 'plain'
  start: number
  end: number
  /**
   * Piece boundary ends (relative to the segment start) in ascending order;
   * piece i spans [ends[i - 1] ?? 0, ends[i]). `counts[i]` is its token count.
   */
  ends: number[]
  counts: number[]
  total: number
}

type Segment = SpecialSegment | PlainSegment

const PIECE_CACHE_SIZE = 65_536
const WHITE_SPACE_CHAR = /\p{White_Space}/u

function isAllWhiteSpace(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (!WHITE_SPACE_CHAR.test(text[i]!)) {
      return false
    }
  }
  return true
}

/**
 * First index at or after `from` that is not Unicode whitespace, or undefined
 * if the remainder is all whitespace. The split regexes probe exactly this far
 * when matching a whitespace piece (the `\p{White_Space}+(?!\P{White_Space})`
 * lookahead backtracks to the run end).
 */
function firstNonWhiteSpaceIndex(text: string, from: number): number {
  for (let i = from; i < text.length; i++) {
    if (!WHITE_SPACE_CHAR.test(text[i]!)) {
      return i
    }
  }
  return text.length
}

/** Last index in ascending `ends` whose value is < target, or -1. */
function lastIndexBelow(ends: number[], target: number): number {
  let lo = 0
  let hi = ends.length - 1
  let result = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (ends[mid]! < target) {
      result = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return result
}

/** Exact-match binary search in ascending `ends`, or -1. */
function indexOfValue(ends: number[], value: number): number {
  let lo = 0
  let hi = ends.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const entry = ends[mid]!
    if (entry === value) {
      return mid
    }
    if (entry < value) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return -1
}

function buildPolicy(
  specialTokens: readonly string[],
  allowedSpecial: Set<string> | undefined,
): SpecialPolicy {
  const maxSpecialLen = specialTokens.reduce(
    (max, token) => Math.max(max, token.length),
    0,
  )
  if (!allowedSpecial?.size) {
    return {
      allowed: undefined,
      // Same shape as GptEncoding.allSpecialTokenRegex (empty set -> /()/,
      // which matches the empty string exactly like countTokens would).
      disallowedRegex: new RegExp(
        `(${specialTokens.map(escapeRegExp).join('|')})`,
      ),
      maxDisallowedLen: maxSpecialLen,
      maxSpecialLen,
    }
  }
  const allowed = new Set(
    [...allowedSpecial].filter((token) => specialTokens.includes(token)),
  )
  // Mirror GptEncoding.processSpecialTokens: disallowed keeps the encoding's
  // special-token order so the first-match regex is byte-identical.
  const disallowed = specialTokens.filter((token) => !allowed.has(token))
  return {
    allowed: allowed.size > 0 ? allowed : undefined,
    disallowedRegex:
      disallowed.length > 0
        ? new RegExp(`(${disallowed.map(escapeRegExp).join('|')})`)
        : undefined,
    maxDisallowedLen: disallowed.reduce(
      (max, token) => Math.max(max, token.length),
      0,
    ),
    maxSpecialLen,
  }
}

class IncrementalCounter implements IncrementalTokenCounter {
  private readonly core: ReturnType<GptEncoding['getBytePairEncodingCore']>
  private readonly policy: SpecialPolicy
  /** Private clone of the split regex; lastIndex is managed manually. */
  private readonly splitRe: RegExp
  private readonly pieceCache = new Map<string, number>()

  private text = ''
  private segments: Segment[] = []
  private total = 0

  constructor(encoding: GptEncoding, options?: IncrementalCounterOptions) {
    this.core = encoding.getBytePairEncodingCore()
    this.policy = buildPolicy(
      this.core.getSpecialTokens(),
      options?.allowedSpecial,
    )
    const splitRegex = this.core.getTokenSplitRegex()
    this.splitRe = new RegExp(splitRegex.source, splitRegex.flags)
    this.reset()
  }

  update(text: string): number {
    // Window over the whole text: identical to countTokens's full check.
    this.assertNoDisallowed(text, 0, text.length)
    this.text = text
    this.rebuildAllSegments()
    return this.total
  }

  applyEdit(start: number, deleteCount: number, insert: string): number {
    const old = this.text
    const oldLength = old.length
    const next = old.slice(0, start) + insert + old.slice(start + deleteCount)

    if (start < 0 || deleteCount < 0) {
      // Pathological slice semantics (negative indexes can duplicate text):
      // fall back to a full rebuild, which is still exact.
      return this.update(next)
    }
    const s = start > oldLength ? oldLength : start
    const d = start + deleteCount > oldLength ? oldLength - s : deleteCount
    const insLen = insert.length

    // Throw exactly like countTokens(next) before touching any state.
    this.assertNoDisallowed(next, s, insLen)

    if (d === 0 && insLen === 0) {
      return this.total
    }

    if (this.policy.allowed === undefined) {
      const seg = this.segments[0] as PlainSegment
      this.editPlainSegment(seg, s - seg.start, d, insert, next)
      this.text = next
      return this.total
    }

    // An old special is affected if the deletion range overlaps it, or an
    // insertion lands strictly inside it.
    let affectedSpecialStart: number | undefined
    for (const seg of this.segments) {
      if (seg.kind === 'special' && seg.start < s + d && s < seg.end) {
        affectedSpecialStart = seg.start
        break
      }
    }

    // A new special can only appear touching the inserted text or bridging
    // the edit seams, so scanning this window of `next` is exhaustive.
    let newSpecialStart: number | undefined
    {
      const cutL = Math.max(0, s - this.policy.maxSpecialLen)
      let pos = cutL
      while (pos < s + insLen) {
        const match = this.core.findNextAllowedSpecialToken(
          next,
          this.policy.allowed,
          pos,
        )
        if (!match) {
          break
        }
        const [a, token] = match
        const b = a + token.length
        if (a >= s + insLen) {
          break
        }
        if (b > s) {
          newSpecialStart = a
          break
        }
        pos = b
      }
    }

    const firstAffected =
      affectedSpecialStart !== undefined && newSpecialStart !== undefined
        ? Math.min(affectedSpecialStart, newSpecialStart)
        : (affectedSpecialStart ?? newSpecialStart)

    if (firstAffected === undefined) {
      this.fastPathEdit(s, d, insert, next)
    } else {
      this.rebuildSegmentsFrom(firstAffected, s, d, insLen, next)
    }
    this.text = next
    return this.total
  }

  count(): number {
    return this.total
  }

  reset(): void {
    this.text = ''
    this.segments = [this.buildPlainSegment('', 0, 0)]
    this.total = 0
  }

  /**
   * Throws the same error as GptEncoding.countTokens would for `text`.
   * `s`/`insLen` describe the freshly inserted region inside `text`; every
   * disallowed match must touch it (matches fully inside the unchanged
   * prefix or suffix would already have been present in the previously
   * validated text), and since the regex is a pure literal alternation, a
   * match's identity does not depend on trailing context — so first-match
   * within the window equals first-match on the full string.
   */
  private assertNoDisallowed(text: string, s: number, insLen: number): void {
    const regex = this.policy.disallowedRegex
    if (!regex) {
      return
    }
    const maxLen = this.policy.maxDisallowedLen
    const cutL = Math.max(0, s - maxLen)
    const cutR = Math.min(text.length, s + insLen + maxLen)
    const match = text.slice(cutL, cutR).match(regex)
    if (match !== null) {
      throw new Error(`Disallowed special token found: ${match[0]}`)
    }
  }

  private countPiece(piece: string): number {
    const cached = this.pieceCache.get(piece)
    if (cached !== undefined) {
      this.pieceCache.delete(piece)
      this.pieceCache.set(piece, cached)
      return cached
    }
    const value = this.core.countSplitPiece(piece)
    if (this.pieceCache.size >= PIECE_CACHE_SIZE) {
      const oldest = this.pieceCache.keys().next().value
      if (oldest !== undefined) {
        this.pieceCache.delete(oldest)
      }
    }
    this.pieceCache.set(piece, value)
    return value
  }

  /**
   * Builds a plain segment over fullText[start, end) with its full piece
   * decomposition, exactly as countNative's inner loop would produce it
   * (the split regex runs per segment between specials).
   */
  private buildPlainSegment(
    fullText: string,
    start: number,
    end: number,
  ): PlainSegment {
    const segmentText = fullText.slice(start, end)
    const ends: number[] = []
    const counts: number[] = []
    let total = 0
    let pos = 0
    while (pos < segmentText.length) {
      this.splitRe.lastIndex = pos
      const match = this.splitRe.exec(segmentText)
      if (!match || match[0].length === 0) {
        break
      }
      const pieceEnd = match.index + match[0].length
      ends.push(pieceEnd)
      const count = this.countPiece(match[0])
      counts.push(count)
      total += count
      pos = pieceEnd
    }
    return { kind: 'plain', start, end, ends, counts, total }
  }

  private rebuildAllSegments(): void {
    const text = this.text
    const segments: Segment[] = []
    const allowed = this.policy.allowed
    let pos = 0
    if (allowed !== undefined) {
      while (pos < text.length) {
        const match = this.core.findNextAllowedSpecialToken(text, allowed, pos)
        if (!match) {
          break
        }
        const [a, token] = match
        const b = a + token.length
        if (a > pos) {
          segments.push(this.buildPlainSegment(text, pos, a))
        }
        segments.push({ kind: 'special', start: a, end: b, total: 1 })
        pos = b
      }
    }
    if (pos < text.length || segments.length === 0) {
      segments.push(this.buildPlainSegment(text, pos, text.length))
    }
    this.segments = segments
    this.total = segments.reduce((sum, seg) => sum + seg.total, 0)
  }

  /**
   * Edit that provably leaves the special-token layout untouched: exactly one
   * plain segment changes (or a fresh empty-width plain segment appears at a
   * boundary between specials).
   */
  private fastPathEdit(
    s: number,
    d: number,
    insert: string,
    next: string,
  ): void {
    const insLen = insert.length
    const delta = insLen - d
    const segments = this.segments

    if (d > 0) {
      // Without an affected special the deleted range lies inside one plain.
      const idx = segments.findIndex(
        (seg) => seg.kind === 'plain' && seg.start <= s && s + d <= seg.end,
      )
      if (idx === -1) {
        // Defensive: should be unreachable (a spanning edit would have hit
        // an affected special). Rebuild exactly rather than risk a mismatch.
        this.text = next
        this.rebuildAllSegments()
        return
      }
      const seg = segments[idx] as PlainSegment
      this.editPlainSegment(seg, s - seg.start, d, insert, next)
      this.shiftSegments(segments, idx + 1, delta)
      return
    }

    let insideIdx = -1
    let appendIdx = -1
    let prependIdx = -1
    let boundaryIdx = segments.length
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!
      if (seg.start < s && s < seg.end && seg.kind === 'plain') {
        insideIdx = i
      } else if (seg.end === s && seg.kind === 'plain') {
        appendIdx = i
      } else if (seg.start === s && seg.end !== s && seg.kind === 'plain') {
        prependIdx = i
      }
      if (seg.start >= s && i < boundaryIdx) {
        boundaryIdx = i
      }
    }

    if (insideIdx >= 0) {
      const seg = segments[insideIdx] as PlainSegment
      this.editPlainSegment(seg, s - seg.start, 0, insert, next)
      this.shiftSegments(segments, insideIdx + 1, delta)
    } else if (appendIdx >= 0) {
      const seg = segments[appendIdx] as PlainSegment
      this.editPlainSegment(seg, seg.end - seg.start, 0, insert, next)
      this.shiftSegments(segments, appendIdx + 1, delta)
    } else if (prependIdx >= 0) {
      const seg = segments[prependIdx] as PlainSegment
      this.editPlainSegment(seg, 0, 0, insert, next)
      this.shiftSegments(segments, prependIdx + 1, delta)
    } else {
      // Insertion at a boundary between two specials (or at the text edges
      // when a special is first/last): a brand-new plain segment appears.
      const plain = this.buildPlainSegment(next, s, s + insLen)
      segments.splice(boundaryIdx, 0, plain)
      this.shiftSegments(segments, boundaryIdx + 1, insLen)
      this.total += plain.total
    }
  }

  private shiftSegments(segments: Segment[], from: number, delta: number) {
    if (delta === 0) {
      return
    }
    for (let i = from; i < segments.length; i++) {
      const seg = segments[i]!
      seg.start += delta
      seg.end += delta
    }
  }

  /**
   * Special-token layout changed at or after `firstAffected`: keep every
   * segment before the last special that ends at/before min(firstAffected, s)
   * (that region is byte-identical in old and new text), rescan the middle,
   * and resync onto the old suffix as soon as a special reappears at its
   * shifted position with all subsequent segments still inside the
   * untouched suffix region.
   */
  private rebuildSegmentsFrom(
    firstAffected: number,
    s: number,
    d: number,
    insLen: number,
    next: string,
  ): void {
    const delta = insLen - d
    const oldSegments = this.segments
    const allowed = this.policy.allowed!
    const keepBefore = Math.min(firstAffected, s)

    let keepCount = 0
    let scanFrom = 0
    for (let i = 0; i < oldSegments.length; i++) {
      const seg = oldSegments[i]!
      if (seg.kind === 'special' && seg.end <= keepBefore) {
        keepCount = i + 1
        scanFrom = seg.end
      }
    }

    const rebuilt: Segment[] = []
    let rebuiltTotal = 0
    let pos = scanFrom
    let resyncIdx = -1
    while (pos < next.length) {
      const match = this.core.findNextAllowedSpecialToken(next, allowed, pos)
      if (!match) {
        break
      }
      const [a, token] = match
      const b = a + token.length
      if (a >= s + insLen) {
        // Candidate resync: the same special at its shifted position, with
        // everything after it in the untouched suffix. The plain text between
        // the last rebuilt position and this special is part of the changed
        // region (it may absorb deleted-special text) and must be rebuilt.
        const idx = this.findOldSpecial(oldSegments, a - delta, b - delta)
        if (idx >= 0) {
          if (a > pos) {
            const plain = this.buildPlainSegment(next, pos, a)
            rebuilt.push(plain)
            rebuiltTotal += plain.total
          }
          resyncIdx = idx
          break
        }
      }
      if (a > pos) {
        const plain = this.buildPlainSegment(next, pos, a)
        rebuilt.push(plain)
        rebuiltTotal += plain.total
      }
      rebuilt.push({ kind: 'special', start: a, end: b, total: 1 })
      rebuiltTotal++
      pos = b
    }
    if (resyncIdx < 0 && pos < next.length) {
      const plain = this.buildPlainSegment(next, pos, next.length)
      rebuilt.push(plain)
      rebuiltTotal += plain.total
    }

    let keptPrefixTotal = 0
    for (let i = 0; i < keepCount; i++) {
      keptPrefixTotal += oldSegments[i]!.total
    }
    let suffixTotal = 0
    // Order matters: kept prefix, then the rescanned middle, then the
    // resynced suffix (which starts at the resync special itself).
    const newSegments = [...oldSegments.slice(0, keepCount), ...rebuilt]
    if (resyncIdx >= 0) {
      for (let i = resyncIdx; i < oldSegments.length; i++) {
        const seg = oldSegments[i]!
        suffixTotal += seg.total
        newSegments.push({
          ...seg,
          start: seg.start + delta,
          end: seg.end + delta,
        })
      }
    }
    this.segments = newSegments
    this.total = keptPrefixTotal + rebuiltTotal + suffixTotal
  }

  private findOldSpecial(
    segments: Segment[],
    start: number,
    end: number,
  ): number {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!
      if (seg.kind === 'special' && seg.start === start && seg.end === end) {
        return i
      }
    }
    return -1
  }

  /**
   * Incrementally re-derives the pieces of one plain segment after an edit at
   * `sLocal` deleting `d` chars and inserting `insert`.
   *
   * Reuse prefix: pieces whose match decision provably read only text before
   * the edit. A non-whitespace piece reads at most up to its own end; a
   * whitespace piece can probe to the end of its whitespace run (lookahead
   * backtracking, `\p{White_Space}*[\r\n]+` runs, and the `\p{White_Space}+$`
   * branch), so it is only safe when that run ends before the edit.
   *
   * Resync: once freshly matched pieces end at a position that maps (via the
   * edit shift) onto an old piece boundary at/after the deleted range, the
   * remaining string is byte-identical to the old scan's remaining string, so
   * every older piece from that boundary replays with the same count.
   */
  private editPlainSegment(
    seg: PlainSegment,
    sLocal: number,
    d: number,
    insert: string,
    next: string,
  ): void {
    const segText = this.text.slice(seg.start, seg.end)
    const insLen = insert.length
    const delta = insLen - d
    const newLen = segText.length + delta
    const newSegText =
      segText.slice(0, sLocal) + insert + segText.slice(sLocal + d)

    // Find the last provably-safe piece before the edit. A piece's match can
    // probe up to 2 characters past its end: contraction alternatives like
    // 've / 'll read b+1 and b+2 when they fail, and o200k's optional
    // contraction suffix reads e+1/e+2. A whitespace piece can additionally
    // probe to the end of its whitespace run (lookahead backtracking and
    // \p{White_Space}*[\r\n]+ runs). A piece is only reusable when every
    // position its match decision read still lies strictly before the edit.
    let safeIdx = -1
    for (let i = lastIndexBelow(seg.ends, sLocal - 2); i >= 0; i--) {
      const end = seg.ends[i]!
      const start = i > 0 ? seg.ends[i - 1]! : 0
      if (!isAllWhiteSpace(segText.slice(start, end))) {
        safeIdx = i
        break
      }
      if (firstNonWhiteSpaceIndex(segText, start) < sLocal) {
        safeIdx = i
        break
      }
    }
    const j = safeIdx + 1
    const anchor = safeIdx >= 0 ? seg.ends[safeIdx]! : 0

    // Re-match pieces from the anchor until the scan resynchronizes with an
    // unchanged old boundary after the edit region.
    const midEnds: number[] = []
    const midCounts: number[] = []
    let midTotal = 0
    let resyncEnd = seg.ends.length
    let pos = anchor
    while (pos <= newLen) {
      this.splitRe.lastIndex = pos
      const match = this.splitRe.exec(newSegText)
      if (!match || match[0].length === 0) {
        break
      }
      const pieceEnd = match.index + match[0].length
      const count = this.countPiece(match[0])
      midEnds.push(pieceEnd)
      midCounts.push(count)
      midTotal += count
      pos = pieceEnd
      if (pieceEnd >= sLocal + insLen) {
        const oldBoundary = pieceEnd - delta
        const idx = indexOfValue(seg.ends, oldBoundary)
        if (idx >= j) {
          resyncEnd = idx + 1
          break
        }
      }
    }

    let replacedTotal = 0
    for (let i = j; i < resyncEnd; i++) {
      replacedTotal += seg.counts[i]!
    }

    // Splice in place (native memmove) and shift only the surviving tail.
    seg.ends.splice(j, resyncEnd - j, ...midEnds)
    seg.counts.splice(j, resyncEnd - j, ...midCounts)
    if (delta !== 0) {
      for (let i = j + midEnds.length; i < seg.ends.length; i++) {
        seg.ends[i] = seg.ends[i]! + delta
      }
    }
    seg.end += delta
    const newTotal = seg.total - replacedTotal + midTotal
    this.total += newTotal - seg.total
    seg.total = newTotal
  }
}

export function createIncrementalCounter(
  encoding: GptEncoding,
  options?: IncrementalCounterOptions,
): IncrementalTokenCounter {
  return new IncrementalCounter(encoding, options)
}
