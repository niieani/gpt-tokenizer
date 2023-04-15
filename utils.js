/**
 * @template {PropertyKey} T
 * @template U
 * @param {T[]} x
 * @param {U[]} y
 * @returns {Record<T, U>}
 */
function dictZip(x, y) {
  const result = /** @type {Record<T, U>} */ ({});
  x.forEach((k, i) => {
    result[k] = y[i];
  });
  return result;
}
/**
 * @param {number} x
 * @param {number} y
 * @returns {number[]}
 */
function range(x, y) {
  return Array.from({ length: y - x }, (_, i) => x + i);
}
/**
 * @param {string} x
 * @returns {number}
 */
const getCharCode = (x) => x.charCodeAt(0);
/**
 * @param {number} x
 * @returns {string}
 */
const getCharFromCode = (x) => String.fromCharCode(x);
/**
 *
 * @param {string[]} word
 * @returns {[string, string][]}
 */
function getPairs(word) {
  /** @type {[string, string][]} */
  const pairs = [];
  let prev_char = word[0];
  for (let i = 1; i < word.length; i++) {
    const char = word[i];
    pairs.push([prev_char, char]);
    prev_char = char;
  }
  return pairs;
}
/**
 * @param {string} token
 * @returns {string[]}
 */
const splitToken = (token) => token.split("");

module.exports.dictZip = dictZip;
module.exports.range = range;
module.exports.getCharCode = getCharCode;
module.exports.getCharFromCode = getCharFromCode;
module.exports.getPairs = getPairs;
module.exports.splitToken = splitToken;
