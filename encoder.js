const {
  dictZip,
  range,
  getCharCode,
  getCharFromCode,
  splitToken,
  getPairs,
} = require("./utils");

/** @type {Record<string, number> } */
const bpeRanks = require("./data/bpe_ranks.json");
/** @type {Record<string, number> } */
const encoder = require("./data/encoder.json");

/** @type {Record<number, string>} */
const decoder = dictZip(Object.values(encoder), Object.keys(encoder));

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * @returns {Map<number, string>}
 */
function createByteToUnicodeMap() {
  const asciiRange = range(getCharCode("!"), getCharCode("~") + 1);
  const latin1Range1 = range(getCharCode("¡"), getCharCode("¬") + 1);
  const latin1Range2 = range(getCharCode("®"), getCharCode("ÿ") + 1);

  const initialCodePoints = [...asciiRange, ...latin1Range1, ...latin1Range2];
  const mappedCodePoints = initialCodePoints.slice();

  let newCodePointOffset = 0;
  for (let byteValue = 0; byteValue < 2 ** 8; byteValue++) {
    if (!initialCodePoints.includes(byteValue)) {
      initialCodePoints.push(byteValue);
      mappedCodePoints.push(2 ** 8 + newCodePointOffset);
      newCodePointOffset += 1;
    }
  }

  const unicodeChars = mappedCodePoints.map(getCharFromCode);
  return new Map(initialCodePoints.map((x, i) => [x, unicodeChars[i]]));
}

const pat =
  /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

const byteEncoder = createByteToUnicodeMap();
/** @type {Map<string, number>} */
const byteDecoder = new Map(Array.from(byteEncoder, ([k, v]) => [v, k]));

/** @type {Map<string, string>} */
const cache = new Map();

/**
 * @param {string} token
 * @returns {string}
 */
function bpe(token) {
  if (cache.has(token)) {
    return /** @type {string} */ (cache.get(token));
  }

  let word = splitToken(token);
  let pairs = getPairs(word);

  if (!pairs.length) {
    return token;
  }

  while (true) {
    /** @type {Map<number, [string, string]>} */
    const minPairs = new Map();
    pairs.forEach((pair) => {
      const rank = bpeRanks[pair.join(",")];
      minPairs.set(isNaN(rank) ? 10e10 : rank, pair);
    });
    const keys = Array.from(minPairs.keys());

    const bigram = minPairs.get(Math.min(...keys));

    if (!bigram || !(bigram.join(",") in bpeRanks)) {
      break;
    }

    const [first, second] = bigram;
    /** @type {string[]} */
    let newWord = [];
    let i = 0;

    while (i < word.length) {
      const j = word.indexOf(first, i);
      if (j === -1) {
        newWord = newWord.concat(word.slice(i));
        break;
      }
      newWord = newWord.concat(word.slice(i, j));
      i = j;

      if (word[i] === first && i < word.length - 1 && word[i + 1] === second) {
        newWord.push(first + second);
        i = i + 2;
      } else {
        newWord.push(word[i]);
        i = i + 1;
      }
    }

    word = newWord;
    if (word.length === 1) {
      break;
    } else {
      pairs = getPairs(word);
    }
  }

  const result = word.join(" ");
  cache.set(token, result);

  return result;
}

/**
 * @param {string} text
 * @returns {Generator<number[], void, undefined>}
 */
function* encodeGenerator(text) {
  for (let [token] of text.matchAll(pat)) {
    token = Array.from(
      textEncoder.encode(token),
      (x) => byteEncoder.get(x) ?? "",
    ).join("");

    const new_tokens = bpe(token)
      .split(" ")
      .map((x) => encoder[x]);

    yield new_tokens;
  }
}

/**
 * @param {string} text
 * @param {number} tokenLimit
 * @returns {false | number} false if token limit is exceeded, otherwise the number of tokens
 */
function isWithinTokenLimit(text, tokenLimit) {
  const tokenGenerator = encodeGenerator(text);
  let count = 0;
  for (const tokens of tokenGenerator) {
    count += tokens.length;
    if (count > tokenLimit) {
      return false;
    }
  }
  return count;
}

/**
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  return Array.from(encodeGenerator(text)).flat(1);
}

/**
 * @param {number} token
 * @returns {string | undefined}
 */
function decodeToken(token) {
  const decodedToken = decoder[token];
  if (typeof decodedToken === "undefined") {
    return "";
  }
  const decodedBytes = splitToken(decodedToken).map(
    (x) => /** @type {number} */ (byteDecoder.get(x)),
  );
  return textDecoder.decode(new Uint8Array(decodedBytes), {
    stream: true,
  });
}

/**
 * @param {string} string
 * @returns {boolean}
 */
function endsWithIncompleteUtfPairSurrogate(string) {
  if (string.length === 0) return false;
  // Check if the last character is a high surrogate
  const lastCharCode = string.charCodeAt(string.length - 1);
  return lastCharCode >= 55296 && lastCharCode <= 56319;
}

/**
 * @param {Iterable<number>} tokens
 * @returns {Generator<string, void, undefined>}
 */
function* decodeGenerator(tokens) {
  /** @type {string} */
  let buffer = "";

  for (const token of tokens) {
    buffer += decodeToken(token);

    if (buffer.length === 0 || endsWithIncompleteUtfPairSurrogate(buffer)) {
      // Keep the high surrogate in the buffer and continue with the next token
      continue;
    } else {
      yield buffer;
      // reset buffer
      buffer = "";
    }
  }

  // Yield any remaining characters in the buffer
  if (buffer.length > 0) {
    yield buffer;
  }
}

/**
 * Decode tokens asynchronously and yield the decoded strings, one by one.
 * Will not yield for tokens that include a high surrogate, but wait for the next token.
 * @param {AsyncIterable<number>} tokens
 * @returns {AsyncGenerator<string, void, undefined>}
 */
async function* decodeAsyncGenerator(tokens) {
  /** @type {string} */
  let buffer = "";

  for await (const token of tokens) {
    buffer += decodeToken(token);

    if (buffer.length === 0 || endsWithIncompleteUtfPairSurrogate(buffer)) {
      // Keep the high surrogate in the buffer and continue with the next token
      continue;
    } else {
      yield buffer;
      // reset buffer
      buffer = "";
    }
  }

  // Yield any remaining characters in the buffer
  if (buffer.length > 0) {
    yield buffer;
  }
}

/**
 * @param {number[]} tokens
 * @returns {string}
 */
function decode(tokens) {
  return [...decodeGenerator(tokens)].join("");
}

module.exports.encode = encode;
module.exports.decode = decode;
module.exports.encodeGenerator = encodeGenerator;
module.exports.decodeGenerator = decodeGenerator;
module.exports.decodeAsyncGenerator = decodeAsyncGenerator;
module.exports.isWithinTokenLimit = isWithinTokenLimit;
