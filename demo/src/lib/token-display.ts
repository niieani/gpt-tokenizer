export function colorForToken(token: number) {
  const hue = (token * 47) % 360
  const baseAlpha = 0.18
  const emphasisAlpha = 0.32
  return {
    backgroundColor: `hsla(${hue}, 90%, 60%, ${baseAlpha})`,
    borderColor: `hsla(${hue}, 90%, 55%, 0.35)`,
    color: 'var(--token-foreground)',
    emphasisBackgroundColor: `hsla(${hue}, 90%, 60%, ${emphasisAlpha})`,
  }
}

export function formatTokenValue(token: number, showIds: boolean, text: string) {
  return showIds ? token.toString() : text
}
