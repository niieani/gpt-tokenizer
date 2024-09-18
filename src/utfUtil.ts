/* eslint-disable no-bitwise */
/* eslint-disable no-magic-numbers */

export const isAscii = (codePoint: number) => codePoint <= 0x7f

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

function isValidUTF8(bytes: Uint8Array): boolean {
  let i = 0
  while (i < bytes.length) {
    const byte1 = bytes[i]!

    let numBytes = 0
    let codePoint = 0

    // Determine the number of bytes in the current UTF-8 character
    if (byte1 <= 0x7f) {
      // 1-byte character (ASCII)
      numBytes = 1
      codePoint = byte1
    } else if ((byte1 & 0xe0) === 0xc0) {
      // 2-byte character
      numBytes = 2
      codePoint = byte1 & 0x1f
      if (byte1 <= 0xc1) return false // Overlong encoding not allowed
    } else if ((byte1 & 0xf0) === 0xe0) {
      // 3-byte character
      numBytes = 3
      codePoint = byte1 & 0x0f
    } else if ((byte1 & 0xf8) === 0xf0) {
      // 4-byte character
      numBytes = 4
      codePoint = byte1 & 0x07
      if (byte1 > 0xf4) return false // Code points above U+10FFFF not allowed
    } else {
      // Invalid first byte of UTF-8 character
      return false
    }

    // Ensure there are enough continuation bytes
    if (i + numBytes > bytes.length) return false

    // Process the continuation bytes
    for (let j = 1; j < numBytes; j++) {
      const byte = bytes[i + j]
      if (byte === undefined || (byte & 0xc0) !== 0x80) return false // Continuation bytes must start with '10'
      codePoint = (codePoint << 6) | (byte & 0x3f)
    }

    // Check for overlong encodings
    if (numBytes === 2 && codePoint < 0x80) return false // Overlong 2-byte sequence
    if (numBytes === 3 && codePoint < 2_048) return false // Overlong 3-byte sequence
    if (numBytes === 4 && codePoint < 65_536) return false // Overlong 4-byte sequence

    // Check for surrogate halves (U+D800 to U+DFFF)
    if (codePoint >= 55_296 && codePoint <= 57_343) return false

    // Check for code points above U+10FFFF
    if (codePoint > 1_114_111) return false

    // Move to the next character
    i += numBytes
  }
  return true
}

const textDecoder = new TextDecoder('utf8', { fatal: false })

export function tryConvertToString(arr: Uint8Array): string | undefined {
  if (!isValidUTF8(arr)) {
    return undefined
  }
  return textDecoder.decode(arr)
}

// Helper function to compare two Uint8Arrays lexicographically
export function compareUint8Arrays(a: Uint8Array, b: Uint8Array): number {
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      return a[i]! - b[i]!
    }
  }
  return a.length - b.length
}
