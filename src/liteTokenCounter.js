class BytePairEncodingCore {
  constructor({
    mergeableBytePairRanks,
    specialTokenMapping = new Map(),
    tokenSplitRegex,
  }) {
    this.bytePairRankDecoder = mergeableBytePairRanks;
    this.bytePairStringRankEncoder = new Map();
    this.mergeableBytePairRankCount = Object.keys(mergeableBytePairRanks).length;
    this.bytePairNonUtfRankDecoder = new Map();
    this.bytePairNonUtfSortedEncoder = [];

    const binaryLookup = [];
    mergeableBytePairRanks.forEach((value, rank) => {
      if (typeof value === 'string') {
        this.bytePairStringRankEncoder.set(value, rank);
      } else {
        const byteArray = new Uint8Array(value);
        binaryLookup.push([byteArray, rank]);
        this.bytePairNonUtfRankDecoder.set(rank, byteArray);
      }
    });
    this.bytePairNonUtfSortedEncoder = binaryLookup.sort((a, b) => compareUint8Arrays(a[0], b[0]));

    this.specialTokensEncoder = specialTokenMapping;
    this.specialTokensDecoder = new Map([...specialTokenMapping].map(([key, value]) => [value, key]));
    this.tokenSplitRegex = tokenSplitRegex;

    const escapedSpecialTokens = [...this.specialTokensEncoder.keys()].map(escapeRegExp);
    const allSpecialTokensRegex = escapedSpecialTokens.join('|');
    try {
      this.specialTokenPatternRegex = new RegExp(allSpecialTokensRegex);
    } catch {
      throw new Error('Invalid regular expression pattern.');
    }
  }

  *encodeNativeGenerator(text, allowedSpecial) {
    let startIndex = 0;
    let lastTokenLength = 0;

    while (true) {
      const nextSpecialStartIndex = this.findNextSpecialStartIndex(text, allowedSpecial, startIndex);
      const endIndex = nextSpecialStartIndex !== undefined ? nextSpecialStartIndex : text.length;
      const textSegment = text.slice(startIndex, endIndex - startIndex);

      for (const match of textSegment.matchAll(this.tokenSplitRegex)) {
        const token = this.getBpeRankFromString(match[0]);
        if (token !== undefined) {
          lastTokenLength = 1;
          yield [token];
          continue;
        }

        const tokens = this.bytePairEncode(match[0]);
        lastTokenLength = tokens.length;
        yield tokens;
      }

      if (nextSpecialStartIndex !== undefined) {
        const specialToken = text.slice(Math.max(0, nextSpecialStartIndex));
        const specialTokenValue = this.specialTokensEncoder.get(specialToken);
        if (specialTokenValue === undefined) {
          throw new Error(`Special token "${specialToken}" is not in the special token encoder.`);
        }
        yield [specialTokenValue];
        startIndex = nextSpecialStartIndex + specialToken.length;
        lastTokenLength = 0;
      } else {
        break;
      }
    }

    return lastTokenLength;
  }

  encodeNative(text, allowedSpecial) {
    let startIndex = 0;
    const tokensArray = [];

    while (true) {
      const nextSpecialStartIndex = this.findNextSpecialStartIndex(text, allowedSpecial, startIndex);
      const endIndex = nextSpecialStartIndex !== undefined ? nextSpecialStartIndex : text.length;
      const textSegment = text.slice(startIndex, endIndex - startIndex);

      for (const match of textSegment.matchAll(this.tokenSplitRegex)) {
        const token = this.getBpeRankFromString(match[0]);
        if (token !== undefined) {
          tokensArray.push(token);
          continue;
        }

        const tokens = this.bytePairEncode(match[0]);
        tokensArray.push(...tokens);
      }

      if (nextSpecialStartIndex !== undefined) {
        const specialToken = text.slice(Math.max(0, nextSpecialStartIndex));
        const specialTokenValue = this.specialTokensEncoder.get(specialToken);
        if (specialTokenValue === undefined) {
          throw new Error(`Special token "${specialToken}" is not in the special token encoder.`);
        }
        tokensArray.push(specialTokenValue);
        startIndex = nextSpecialStartIndex + specialToken.length;
      } else {
        break;
      }
    }

    return tokensArray;
  }

  findNextSpecialStartIndex(text, allowedSpecial, startIndex) {
    let searchIndex = startIndex;

    while (true) {
      const nextSpecialMatch = this.specialTokenPatternRegex.exec(text.slice(Math.max(0, searchIndex)));
      if (!nextSpecialMatch) {
        return undefined;
      }

      const specialToken = nextSpecialMatch[0];
      if (allowedSpecial?.has(specialToken)) {
        return nextSpecialMatch.index + searchIndex;
      }

      searchIndex = nextSpecialMatch.index + searchIndex + 1;
    }
  }

  getBpeRankFromString(key) {
    return this.bytePairStringRankEncoder.get(key);
  }

  bytePairEncode(input) {
    if (input.length === 1 && isAscii(input.codePointAt(0))) {
      return [this.getBpeRankFromStringOrThrow(input)];
    }

    const inputBytes = new TextEncoder().encode(input);
    return this.bytePairMerge(inputBytes);
  }

  bytePairMerge(piece) {
    const starts = [];
    const ranks = [];

    const getRank = (startIndex, pairStart = starts[startIndex], pairEnd = starts[startIndex + 2]) => {
      if (pairEnd === undefined) {
        return Number.POSITIVE_INFINITY;
      }

      const key = piece.subarray(pairStart, pairEnd);
      const rank = this.getBpeRankFromBytes(key);
      return rank ?? Number.POSITIVE_INFINITY;
    };

    for (let i = 0; i <= piece.length; i++) {
      starts.push(i);
      if (i < piece.length - 1) {
        ranks.push(getRank(i, i, i + 2));
      } else {
        ranks.push(Number.POSITIVE_INFINITY);
      }
    }

    while (starts.length > 1) {
      let lowestRank = Number.POSITIVE_INFINITY;
      let lowestPartitionIndex = -1;

      for (let i = 0; i < ranks.length - 1; i++) {
        const rank = ranks[i];
        if (rank < lowestRank) {
          lowestRank = rank;
          lowestPartitionIndex = i;
        }
      }

      if (lowestRank === Number.POSITIVE_INFINITY || lowestPartitionIndex === -1) {
        break;
      }

      starts.splice(lowestPartitionIndex + 1, 1);
      ranks.splice(lowestPartitionIndex, 1);
      ranks[lowestPartitionIndex] = getRank(lowestPartitionIndex);

      if (lowestPartitionIndex > 0) {
        ranks[lowestPartitionIndex - 1] = getRank(lowestPartitionIndex - 1);
      }
    }

    const output = [];
    for (let i = 0; i < starts.length - 1; i++) {
      const pairStart = starts[i];
      const pairEnd = starts[i + 1];
      const bpeValue = this.getBpeRankFromBytesOrThrow(piece.subarray(pairStart, pairEnd));
      output.push(bpeValue);
    }
    return output;
  }

  getBpeRankFromBytes(key) {
    const keyAsString = tryConvertToString(key);
    if (keyAsString !== undefined) {
      return this.getBpeRankFromString(keyAsString);
    }

    const index = this.binarySearch(key);
    if (index !== -1) {
      return this.bytePairNonUtfSortedEncoder[index][1];
    }

    return undefined;
  }

  getBpeRankFromBytesOrThrow(key) {
    const value = this.getBpeRankFromBytes(key);
    if (value === undefined) {
      throw new Error(`The byte-pair encoding does not contain a value for: ${key.toString()}`);
    }
    return value;
  }

  binarySearch(key) {
    let low = 0;
    let high = this.bytePairNonUtfSortedEncoder.length - 1;

    while (low <= high) {
      const mid = (low + high) >>> 1;
      const midKey = this.bytePairNonUtfSortedEncoder[mid][0];
      let cmp = 0;
      const maxLength = Math.min(midKey.length, key.length);
      for (let i = 0; i < maxLength; i++) {
        cmp = midKey[i] - key[i];
        if (cmp !== 0) break;
      }
      if (cmp === 0) {
        cmp = midKey.length - key.length;
      }
      if (cmp === 0) {
        return mid;
      }
      if (cmp < 0) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return -1;
  }
}

function compareUint8Arrays(a, b) {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }
  return a.length - b.length;
}

function isAscii(codePoint) {
  return codePoint <= 0x7f;
}

function tryConvertToString(arr) {
  if (!isValidUTF8(arr)) {
    return undefined;
  }
  return new TextDecoder('utf8', { fatal: false }).decode(arr);
}

function isValidUTF8(bytes) {
  let i = 0;
  while (i < bytes.length) {
    const byte1 = bytes[i];

    let numBytes = 0;
    let codePoint = 0;

    if (byte1 <= 0x7f) {
      numBytes = 1;
      codePoint = byte1;
    } else if ((byte1 & 0xe0) === 0xc0) {
      numBytes = 2;
      codePoint = byte1 & 0x1f;
      if (byte1 <= 0xc1) return false;
    } else if ((byte1 & 0xf0) === 0xe0) {
      numBytes = 3;
      codePoint = byte1 & 0x0f;
    } else if ((byte1 & 0xf8) === 0xf0) {
      numBytes = 4;
      codePoint = byte1 & 0x07;
      if (byte1 > 0xf4) return false;
    } else {
      return false;
    }

    if (i + numBytes > bytes.length) return false;

    for (let j = 1; j < numBytes; j++) {
      const byte = bytes[i + j];
      if (byte === undefined || (byte & 0xc0) !== 0x80) return false;
      codePoint = (codePoint << 6) | (byte & 0x3f);
    }

    if (numBytes === 2 && codePoint < 0x80) return false;
    if (numBytes === 3 && codePoint < 2048) return false;
    if (numBytes === 4 && codePoint < 65536) return false;

    if (codePoint >= 55296 && codePoint <= 57343) return false;
    if (codePoint > 1114111) return false;

    i += numBytes;
  }
  return true;
}

function escapeRegExp(string) {
  return string.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');
}
