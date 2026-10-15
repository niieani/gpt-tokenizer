const LONG_MSG_REPEATS = 2000
// LatinExpectedTokens: 86
const Latin = `Occaecat est tempor incididunt voluptate exercitation irure quis aliqua sunt dolor. Anim nostrud incididunt eu aliquip quis culpa do incididunt eu. Magna qui dolor deserunt sit velit. Dolor anim laborum ut ad in et occaecat enim elit culpa commodo. Sit ut sit mollit adipisicing. Labore culpa do cillum proident incididunt et. Reprehenderit nisi excepteur culpa consectetur mollit consectetur laborum`

// Generate a random Unicode string with various character ranges
export function generateRandomUnicode(length: number): string {
  let seed = 0x12345678
  const random = () => {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return (seed >>> 0) / 0x100000000
  }
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
    const range = ranges[Math.floor(random() * ranges.length)]
    const codePoint = Math.floor(random() * (range[1] - range[0])) + range[0]
    result += String.fromCodePoint(codePoint)
  }
  return result
}

export const datasets: Record<string, { text: string }> = {
  English: {
    text: `The quick brown fox jumps over the lazy dog.`,
  },
  Chinese: {
    text: `快速的棕色狐狸跳过懒狗。`,
  },
  French: {
    text: `Le renard brun rapide saute par-dessus le chien paresseux.`,
  },
  Code: {
    text: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}`,
  },
  Latin: {
    text: Latin,
  },
  LatinRepeat: {
    text: Latin.repeat(LONG_MSG_REPEATS),
  },
  UnicodeRandom: {
    text: generateRandomUnicode(120000),
  },
}

// Regression probes are verified but excluded from throughput averages.
export const probes: Record<string, { text: string }> = {
  Empty: { text: '' },
  LeadingBOM: { text: '\ufeffhello' },
  Whitespace: { text: 'a\u0085b\ufeffc\u00a0d\r\n  \t' },
  Contractions: {
    text: "I'M we're THEY'VE He'll won't 'S café e\u0301 中文 😀",
  },
  LongPiece: { text: 'a'.repeat(1024) },
}
