/* eslint-disable unicorn/prefer-spread */
/* eslint-disable unicorn/prefer-code-point */

export function dictZip<T extends PropertyKey, U>(
  x: T[],
  y: U[],
): Record<T, U> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const result = {} as Record<T, U>
  x.forEach((k, i) => {
    result[k] = y[i]!
  })
  return result
}

export function range(x: number, y: number): number[] {
  return Array.from({ length: y - x }, (_, i) => x + i)
}

export const getCharCode = (x: string): number => x.charCodeAt(0)

export const getCharFromCode = (x: number): string => String.fromCharCode(x)

export function getPairs(word: string[]): [string, string][] {
  /** @type {[string, string][]} */
  const pairs: [string, string][] = []
  let prevChar = word[0]
  for (let i = 1; i < word.length; i++) {
    const char = word[i]
    pairs.push([prevChar!, char!])
    prevChar = char
  }
  return pairs
}

export const splitToken = (token: string): string[] => token.split('')
