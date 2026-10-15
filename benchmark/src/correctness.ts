import type { Tokens } from './interfaces.js'

export function firstDifference(expected: Tokens, actual: Tokens): number {
  for (let i = 0; i < Math.max(expected.length, actual.length); i++) {
    if (expected[i] !== actual[i]) return i
  }
  return -1
}
