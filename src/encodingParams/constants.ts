// The split patterns below use `\p{White_Space}` / `\P{White_Space}` where
// tiktoken's patterns use `\s` / `\S`: the regex engine behind tiktoken treats
// `\s` as the Unicode White_Space property, whereas JavaScript's `\s` differs
// from it on exactly two code points (U+0085 and U+FEFF).
export const R50K_TOKEN_SPLIT_REGEX =
  /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\p{White_Space}\p{L}\p{N}]+|\p{White_Space}+(?!\P{White_Space})|\p{White_Space}+/gu

const CONTRACTION_SUFFIX_PATTERN = String.raw`'(?:[sS]|[dD]|[mM]|[tT]|[lL][lL]|[vV][eE]|[rR][eE])`

const OPTIONAL_CONTRACTION_SUFFIX = String.raw`(?:${CONTRACTION_SUFFIX_PATTERN})?`

const CL100K_TOKEN_SPLIT_PATTERN = String.raw`${CONTRACTION_SUFFIX_PATTERN}|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\p{White_Space}\p{L}\p{N}]+[\r\n]*|\p{White_Space}+$|\p{White_Space}*[\r\n]|\p{White_Space}+(?!\P{White_Space})|\p{White_Space}`

export const CL100K_TOKEN_SPLIT_REGEX = new RegExp(
  CL100K_TOKEN_SPLIT_PATTERN,
  'gu',
)

const O200K_TOKEN_SPLIT_PATTERN = String.raw`[^\r\n\p{L}\p{N}]?[\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}]*[\p{Ll}\p{Lm}\p{Lo}\p{M}]+${OPTIONAL_CONTRACTION_SUFFIX}|[^\r\n\p{L}\p{N}]?[\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}]+[\p{Ll}\p{Lm}\p{Lo}\p{M}]*${OPTIONAL_CONTRACTION_SUFFIX}|\p{N}{1,3}| ?[^\p{White_Space}\p{L}\p{N}]+[\r\n/]*|\p{White_Space}*[\r\n]+|\p{White_Space}+(?!\P{White_Space})|\p{White_Space}+`

export const O200K_TOKEN_SPLIT_REGEX = new RegExp(
  O200K_TOKEN_SPLIT_PATTERN,
  'gu',
)
