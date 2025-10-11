export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatNumber(value: number | undefined, fractionDigits = 2) {
  if (value === undefined) return '—'
  return Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatCurrency(value: number | undefined, fractionDigits = 4) {
  if (value === undefined) return '—'
  const maximumFractionDigits = Math.abs(value) < 1 ? Math.max(fractionDigits, 6) : fractionDigits
  return `$${Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)}`
}

export function chunkArray<T>(input: T[], size: number) {
  const result: T[][] = []
  for (let index = 0; index < input.length; index += size) {
    result.push(input.slice(index, index + size))
  }
  return result
}
