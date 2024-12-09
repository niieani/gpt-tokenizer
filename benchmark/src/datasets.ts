import type { BenchData } from './interfaces.js'

const EXECUTIONS_COUNT = 1000
const LONG_MSG_REPEATS = 2000
// LatinExpectedTokens: 86
const Latin = `Occaecat est tempor incididunt voluptate exercitation irure quis aliqua sunt dolor. Anim nostrud incididunt eu aliquip quis culpa do incididunt eu. Magna qui dolor deserunt sit velit. Dolor anim laborum ut ad in et occaecat enim elit culpa commodo. Sit ut sit mollit adipisicing. Labore culpa do cillum proident incididunt et. Reprehenderit nisi excepteur culpa consectetur mollit consectetur laborum`

// Generate a random Unicode string with various character ranges
function generateRandomUnicode(length: number): string {
  const ranges = [
    [0x0020, 0x007f], // Basic Latin
    [0x00a0, 0x00ff], // Latin-1 Supplement
    [0x0100, 0x017f], // Latin Extended-A
    [0x0400, 0x04ff], // Cyrillic
    [0x0980, 0x09ff], // Bengali
    [0x0f00, 0x0fff], // Tibetan
    [0x1200, 0x137f], // Ethiopic
    [0x3040, 0x309f], // Hiragana
    [0x30a0, 0x30ff], // Katakana
    [0x4e00, 0x4fff], // CJK Unified Ideographs (partial)
    [0x1f300, 0x1f6ff], // Emoji & Pictographs
  ]

  let result = ''
  for (let i = 0; i < length; i++) {
    const range = ranges[Math.floor(Math.random() * ranges.length)]
    const codePoint =
      Math.floor(Math.random() * (range[1] - range[0])) + range[0]
    result += String.fromCodePoint(codePoint)
  }
  return result
}

export const datasets: Record<string, BenchData> = {
  English: {
    text: `The quick brown fox jumps over the lazy dog.`,
    encodeExecutionsCount: EXECUTIONS_COUNT,
    decodeExecutionsCount: EXECUTIONS_COUNT * 10,
    countTokensExecutionsCount: EXECUTIONS_COUNT,
  },
  Chinese: {
    text: `快速的棕色狐狸跳过懒狗。`,
    encodeExecutionsCount: EXECUTIONS_COUNT,
    decodeExecutionsCount: EXECUTIONS_COUNT * 10,
    countTokensExecutionsCount: EXECUTIONS_COUNT,
  },
  French: {
    text: `Le renard brun rapide saute par-dessus le chien paresseux.`,
    encodeExecutionsCount: EXECUTIONS_COUNT,
    decodeExecutionsCount: EXECUTIONS_COUNT * 10,
    countTokensExecutionsCount: EXECUTIONS_COUNT,
  },
  Code: {
    text: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}`,
    encodeExecutionsCount: EXECUTIONS_COUNT,
    decodeExecutionsCount: EXECUTIONS_COUNT * 10,
    countTokensExecutionsCount: EXECUTIONS_COUNT,
  },
  Latin: {
    text: Latin,
    encodeExecutionsCount: EXECUTIONS_COUNT,
    decodeExecutionsCount: EXECUTIONS_COUNT * 10,
    countTokensExecutionsCount: EXECUTIONS_COUNT,
  },
  LatinRepeat: {
    text: Latin.repeat(LONG_MSG_REPEATS),
    encodeExecutionsCount: 1,
    decodeExecutionsCount: 1,
    countTokensExecutionsCount: 1,
  },
  UnicodeRandom: {
    text: generateRandomUnicode(120000),
    encodeExecutionsCount: 2,
    decodeExecutionsCount: 2,
    countTokensExecutionsCount: 2,
  },
}
