/* eslint-disable unicorn/prefer-spread */
/* eslint-disable unicorn/prefer-code-point */

/**
 * @template T
 * @template U
 * @param {T[]} x
 * @param {U[]} y
 * @returns {Record<T, U>}
 */
export function dictZip(x, y) {
  /** @type {Record<T, U>} */
  const result = {}
  x.forEach((k, i) => {
    result[k] = y[i]
  })
  return result
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {number[]}
 */
export function range(x, y) {
  return Array.from({ length: y - x }, (_, i) => x + i)
}

/**
 * @param {string} x
 * @returns {number}
 */
export const getCharCode = (x) => x.charCodeAt(0)

/**
 * @param {number} x
 * @returns {string}
 */
export const getCharFromCode = (x) => String.fromCharCode(x)

/**
 * @param {string[]} word
 * @returns {[string, string][]}
 */
export function getPairs(word) {
  /** @type {[string, string][]} */
  const pairs = []
  let prevChar = word[0]
  for (let i = 1; i < word.length; i++) {
    const char = word[i]
    pairs.push([prevChar, char])
    prevChar = char
  }
  return pairs
}

/**
 * @param {string} token
 * @returns {string[]}
 */
export const splitToken = (token) => token.split('')
