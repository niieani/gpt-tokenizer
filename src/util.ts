export function getMaxValueFromMap(map: Map<unknown, number>): number {
  let max = 0
  map.forEach((val) => {
    max = Math.max(max, val)
  })
  return max
}

export function escapeRegExp(string: string) {
  return string.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&') // $& means the whole matched string
}

export function getSpecialTokenRegex(tokens: Set<string>): RegExp {
  const escapedTokens = [...tokens].map(escapeRegExp)
  const inner = escapedTokens.join('|')
  return new RegExp(`(${inner})`)
}
