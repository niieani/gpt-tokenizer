export function colorForToken(token: number) {
  const hue = (token * 55) % 360
  const baseAlpha = 0.3
  const emphasisAlpha = 0.6
  const labelLightBase = `hsl(${hue}, 82%, 26%)`
  const labelLightHighlight = `hsl(${hue}, 90%, 34%)`
  const labelDarkBase = `hsl(${hue}, 76%, 94%)`
  const labelDarkHighlight = `hsl(${hue}, 86%, 98%)`

  const labelShadowLight = `0 10px 26px hsla(${hue}, 70%, 18%, 0.48), inset 0 1px 0 hsla(${hue}, 88%, 58%, 0.42)`
  const labelShadowLightActive = `0 16px 36px hsla(${hue}, 72%, 16%, 0.56), inset 0 1px 0 hsla(${hue}, 92%, 62%, 0.48)`
  const labelShadowDark = `0 14px 32px rgba(2, 6, 23, 0.55), inset 0 1px 0 hsla(${hue}, 70%, 96%, 0.62)`
  const labelShadowDarkActive = `0 20px 44px rgba(2, 6, 23, 0.7), inset 0 1px 0 hsla(${hue}, 68%, 98%, 0.72)`

  return {
    backgroundColor: `hsla(${hue}, 90%, 60%, ${baseAlpha})`,
    borderColor: `hsla(${hue}, 90%, 55%, 0.35)`,
    color: 'var(--token-foreground)',
    emphasisBackgroundColor: `hsla(${hue}, 90%, 60%, ${emphasisAlpha})`,
    labelBackgroundLight: labelLightBase,
    labelBackgroundDark: labelDarkBase,
    labelGradientLight: `linear-gradient(180deg, ${labelLightHighlight} 70%, ${labelLightBase} 100%)`,
    labelGradientDark: `linear-gradient(180deg, ${labelDarkHighlight} 70%, ${labelDarkBase} 100%)`,
    labelBorderLight: `hsla(${hue}, 92%, 18%, 0.72)`,
    labelBorderDark: `hsla(${hue}, 48%, 58%, 0.52)`,
    labelShadowLight,
    labelShadowLightActive,
    labelShadowDark,
    labelShadowDarkActive,
    labelTextLight: '#f8fafc',
    labelTextDark: '#020617',
  }
}

export function formatTokenValue(token: number, showIds: boolean, text: string) {
  return showIds ? token.toString() : text
}
