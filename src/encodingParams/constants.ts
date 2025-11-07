export const R50K_TOKEN_SPLIT_REGEX =
  /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu

const CONTRACTION_SUFFIX_PATTERN = String.raw`'(?:[sS]|[dD]|[mM]|[tT]|[lL][lL]|[vV][eE]|[rR][eE])`

const OPTIONAL_CONTRACTION_SUFFIX = String.raw`(?:${CONTRACTION_SUFFIX_PATTERN})?`

const CL100K_TOKEN_SPLIT_PATTERN = String.raw`${CONTRACTION_SUFFIX_PATTERN}|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s+$|\s*[\r\n]|\s+(?!\S)|\s`

export const CL100K_TOKEN_SPLIT_REGEX = new RegExp(
  CL100K_TOKEN_SPLIT_PATTERN,
  'gu',
)

const O200K_TOKEN_SPLIT_PATTERN = String.raw`[^\r\n\p{L}\p{N}]?[\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}]*[\p{Ll}\p{Lm}\p{Lo}\p{M}]+${OPTIONAL_CONTRACTION_SUFFIX}|[^\r\n\p{L}\p{N}]?[\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}]+[\p{Ll}\p{Lm}\p{Lo}\p{M}]*${OPTIONAL_CONTRACTION_SUFFIX}|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n/]*|\s*[\r\n]+|\s+(?!\S)|\s+`

export const O200K_TOKEN_SPLIT_REGEX = new RegExp(
  O200K_TOKEN_SPLIT_PATTERN,
  'gu',
)
