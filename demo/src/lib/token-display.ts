export function colorForToken(token: number) {
  const hue = (token * 47) % 360
  return {
    backgroundColor: `hsla(${hue}, 90%, 60%, 0.16)`,
    borderColor: `hsla(${hue}, 90%, 55%, 0.35)`,
    color: 'var(--token-foreground)',
  }
}

export function formatTokenValue(token: number, showIds: boolean, text: string) {
  return showIds ? token.toString() : text
}
