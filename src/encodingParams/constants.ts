import {
  UNICODE_16_LETTER_RANGES,
  UNICODE_16_NUMBER_RANGES,
  UNICODE_16_O200K_LOWER_RANGES,
  UNICODE_16_O200K_UPPER_RANGES,
  UNICODE_17_TO_16_GUARD_RANGES,
  UNICODE_17_TO_16_LETTER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_LETTER_INCLUDE_RANGES,
  UNICODE_17_TO_16_NUMBER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_NUMBER_INCLUDE_RANGES,
  UNICODE_17_TO_16_O200K_LOWER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_O200K_LOWER_INCLUDE_RANGES,
  UNICODE_17_TO_16_O200K_UPPER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_O200K_UPPER_INCLUDE_RANGES,
} from './unicode16Data.js'

// OpenAI tiktoken currently uses Unicode16 categories. JS engines can use
// different UCDs, changing token boundaries after upgrades. Keep compact native
// classes where the engine's version is known, with a portable explicit-range
// fallback. V8 interprets very long range-only patterns, making them expensive
// for short input; Unicode-set corrections keep its hot patterns compact.
const nativeVersion =
  typeof process === 'undefined' ? undefined : process.versions?.unicode
const unicode17Sets = (() => {
  if (nativeVersion !== '17.0') return false
  try {
    return new RegExp('[a--b]', 'v').test('a')
  } catch {
    return false
  }
})()
const flags = unicode17Sets ? 'gv' : 'gu'
function category(
  native: string,
  stable: string,
  exclude: string,
  include: string,
): string {
  if (nativeVersion === '16.0') return native
  if (!unicode17Sets) return stable
  const corrected = exclude ? `[[${native}]--[${exclude}]]` : `[${native}]`
  return include ? `[${corrected}${include}]` : corrected
}
const L = category(
  String.raw`\p{L}`,
  UNICODE_16_LETTER_RANGES,
  UNICODE_17_TO_16_LETTER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_LETTER_INCLUDE_RANGES,
)
const N = category(
  String.raw`\p{N}`,
  UNICODE_16_NUMBER_RANGES,
  UNICODE_17_TO_16_NUMBER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_NUMBER_INCLUDE_RANGES,
)
const UPPER = category(
  String.raw`\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}`,
  UNICODE_16_O200K_UPPER_RANGES,
  UNICODE_17_TO_16_O200K_UPPER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_O200K_UPPER_INCLUDE_RANGES,
)
const LOWER = category(
  String.raw`\p{Ll}\p{Lm}\p{Lo}\p{M}`,
  UNICODE_16_O200K_LOWER_RANGES,
  UNICODE_17_TO_16_O200K_LOWER_EXCLUDE_RANGES,
  UNICODE_17_TO_16_O200K_LOWER_INCLUDE_RANGES,
)

// A native pattern is safe whenever none of the characters whose categories
// differ are present. The check is especially cheap for one-byte ASCII text;
// corrected Unicode-set patterns otherwise have noticeable V8 call overhead.
class StableUnicodeRegExp extends RegExp {
  private readonly stableRegex: RegExp
  private readonly nativeRegex: RegExp
  private readonly affected: RegExp

  constructor(stablePattern: string, nativePattern: string, affected: RegExp) {
    super(stablePattern, flags)
    this.stableRegex = new RegExp(stablePattern, flags)
    this.nativeRegex = new RegExp(nativePattern, 'gu')
    this.affected = affected
  }

  static override get [Symbol.species](): RegExpConstructor {
    return RegExp
  }

  override [Symbol.match](text: string): RegExpMatchArray | null {
    const selected = this.affected.test(text)
      ? this.stableRegex
      : this.nativeRegex
    selected.lastIndex = this.lastIndex
    const result = selected[Symbol.match](text)
    this.lastIndex = selected.lastIndex
    return result
  }

  override [Symbol.matchAll](
    text: string,
  ): RegExpStringIterator<RegExpExecArray> {
    const selected = this.affected.test(text)
      ? this.stableRegex
      : this.nativeRegex
    selected.lastIndex = this.lastIndex
    return selected[Symbol.matchAll](text)
  }

  override exec(text: string): RegExpExecArray | null {
    const selected = this.affected.test(text)
      ? this.stableRegex
      : this.nativeRegex
    selected.lastIndex = this.lastIndex
    const result = selected.exec(text)
    this.lastIndex = selected.lastIndex
    return result
  }
}

// Test UTF-16 units, not code points: the generated guard includes every
// changed BMP character and only the lead surrogates needed by changed astral
// characters. Harmless false positives choose the canonical pattern; emoji and
// ordinary multilingual text avoid an expensive full-Unicode prefilter scan.
const affected = unicode17Sets
  ? new RegExp(`[${UNICODE_17_TO_16_GUARD_RANGES}]`)
  : /\P{ASCII}/u

// tiktoken's `\s` is Unicode White_Space. JavaScript's `\s` differs on U+0085
// and U+FEFF. White_Space itself has not changed between Unicode6.3 and17.
const CONTRACTION_SUFFIX_PATTERN = String.raw`'(?:[sSſ]|[dD]|[mM]|[tT]|[lL][lL]|[vV][eE]|[rR][eE])`
const OPTIONAL_CONTRACTION_SUFFIX = String.raw`(?:${CONTRACTION_SUFFIX_PATTERN})?`
function patterns(
  letter: string,
  number: string,
  upper: string,
  lower: string,
) {
  return [
    String.raw`'s|'t|'re|'ve|'m|'ll|'d| ?[${letter}]+| ?[${number}]+| ?[^\p{White_Space}${letter}${number}]+|\p{White_Space}+(?!\P{White_Space})|\p{White_Space}+`,
    String.raw`${CONTRACTION_SUFFIX_PATTERN}|[^\r\n${letter}${number}]?[${letter}]+|[${number}]{1,3}| ?[^\p{White_Space}${letter}${number}]+[\r\n]*|\p{White_Space}+$|\p{White_Space}*[\r\n]|\p{White_Space}+(?!\P{White_Space})|\p{White_Space}`,
    String.raw`[^\r\n${letter}${number}]?[${upper}]*[${lower}]+${OPTIONAL_CONTRACTION_SUFFIX}|[^\r\n${letter}${number}]?[${upper}]+[${lower}]*${OPTIONAL_CONTRACTION_SUFFIX}|[${number}]{1,3}| ?[^\p{White_Space}${letter}${number}]+[\r\n\/]*|\p{White_Space}*[\r\n]+|\p{White_Space}+(?!\P{White_Space})|\p{White_Space}+`,
  ] as const
}
const native = patterns(
  String.raw`\p{L}`,
  String.raw`\p{N}`,
  String.raw`\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}`,
  String.raw`\p{Ll}\p{Lm}\p{Lo}\p{M}`,
)
const stable = patterns(L, N, UPPER, LOWER)
const makeRegex = (index: 0 | 1 | 2) =>
  nativeVersion === '16.0'
    ? new RegExp(native[index], 'gu')
    : new StableUnicodeRegExp(stable[index], native[index], affected)

export const R50K_TOKEN_SPLIT_REGEX = makeRegex(0)
export const CL100K_TOKEN_SPLIT_REGEX = makeRegex(1)
export const O200K_TOKEN_SPLIT_REGEX = makeRegex(2)
