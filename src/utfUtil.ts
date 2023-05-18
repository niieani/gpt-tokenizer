const HIGH_SURROGATE_START = 55_296
const HIGH_SURROGATE_END = 56_319

export function endsWithIncompleteUtfPairSurrogate(string: string): boolean {
  if (string.length === 0) return false
  // Check if the last character is a high surrogate
  // eslint-disable-next-line unicorn/prefer-code-point
  const lastCharCode = string.charCodeAt(string.length - 1)
  return (
    lastCharCode >= HIGH_SURROGATE_START && lastCharCode <= HIGH_SURROGATE_END
  )
}
