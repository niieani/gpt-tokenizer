import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { requirePerfLease } from '../dist/perfLease.js'
import { tokenizers } from '../dist/tokenizers.js'
import { documents, probes, sha256 } from './protocol.mjs'
requirePerfLease()
const candidateDirectory = process.argv[2]
if (!candidateDirectory)
  throw new Error('Usage: correctness.mjs /absolute/candidate/esm/encoding')
const candidateRoot = resolve(candidateDirectory, '../..')
const candidateFiles = Object.fromEntries(
  readdirSync(resolve(candidateRoot, 'esm'), { recursive: true })
    .filter((path) => path.endsWith('.js'))
    .sort()
    .map((path) => [
      path,
      sha256(readFileSync(resolve(candidateRoot, 'esm', path))),
    ]),
)
const harnessSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)))
let state = 0x519be07
const random = () => {
  state ^= state << 13
  state ^= state >>> 17
  state ^= state << 5
  return state >>> 0
}
const randomText = (length) =>
  Array.from({ length }, () => {
    const choice = random() % 5
    const codepoint =
      choice === 0
        ? 32 + (random() % 95)
        : choice === 1
          ? 0x300 + (random() % 112)
          : choice === 2
            ? 0x4e00 + (random() % 20902)
            : choice === 3
              ? 0x1f300 + (random() % 768)
              : random() % 0x110000
    return String.fromCodePoint(codepoint)
  }).join('')
// Rust's case-insensitive suffix groups use Unicode simple folding. Exercise
// every relevant ASCII case plus long-s, adjacent to token-boundary-sensitive
// prefixes/tails rather than relying on random Unicode to discover them.
const contractionVariants = ['s', 't', 're', 've', 'm', 'll', 'd']
  .flatMap((suffix) =>
    [...suffix].reduce(
      (variants, letter) =>
        variants.flatMap((prefix) =>
          (letter === 's'
            ? ['s', 'S', '\u017f']
            : [letter, letter.toUpperCase()]
          ).map((value) => prefix + value),
        ),
      [''],
    ),
  )
  .flatMap((suffix) =>
    ['', ' I', ' foo', 'A', '\nI', '中文I'].flatMap((prefix) =>
      ['a', 'x', 'é', 'A', '9', ' '].map(
        (tail) => `${prefix}'${suffix}${tail}`,
      ),
    ),
  )
const separators = [
  ...new Set([
    '',
    ' ',
    '\t',
    '\r',
    '\n',
    '\r\n',
    '\n\r',
    '\n ',
    ' \n',
    '\t\r\n',
    ...[
      0x0b,
      0x0c,
      0x85,
      0xa0,
      0x1680,
      ...Array.from({ length: 11 }, (_, i) => 0x2000 + i),
      0x2028,
      0x2029,
      0x202f,
      0x205f,
      0x3000,
      0x1c,
      0x1f,
      0xfeff,
      0x200b,
    ].map((codepoint) => String.fromCodePoint(codepoint)),
  ]),
]
const boundaryProbes = separators
  .flatMap((separator) =>
    ['', 'a', 'A', '1', '!', '\\', '/', '漢'].flatMap((prefix) =>
      ['', 'a', 'A', '1', '!', '\\word', '/word', '😀'].map(
        (tail) => prefix + separator + tail,
      ),
    ),
  )
  .concat(
    separators.flatMap((left) =>
      separators.map((right) => `x${left}${right}z`),
    ),
  )
const strings = [
  ...boundaryProbes,
  ...contractionVariants,
  ...probes,
  ...documents.flatMap((d) => [d.text, ...d.stream]),
  ...Array.from({ length: 250 }, () => randomText(random() % 160)),
  ...['a', 'abc', 'é', '漢', '👨‍👩‍👧‍👦', 'a\u0301', ' '.repeat(4)].map((piece) =>
    piece.repeat(2048),
  ),
  '\ud800',
  '\udfff',
  'a\ud800b\udfff',
  '\r\n\t\u0000\u2028\u2029',
]
const results = []
const failures = []
const failureCounts = {}
let failureCount = 0
function recordFailure(encoding, input, error) {
  failureCount++
  failureCounts[encoding] = (failureCounts[encoding] ?? 0) + 1
  if (failures.length < 20)
    failures.push({ encoding, input, message: String(error) })
}
for (const encoding of ['cl100k_base', 'o200k_base']) {
  const candidate = await import(
    pathToFileURL(`${candidateDirectory}/${encoding}.js`).href
  )
  const { get_encoding } = await import('tiktoken')
  const reference = get_encoding(encoding)
  const decoder = new TextDecoder('utf8', { ignoreBOM: true })
  let count = 0
  for (const text of strings) {
    try {
      const expected = Array.from(reference.encode(text))
      const actual = candidate.encode(text)
      assert.deepEqual(
        actual,
        expected,
        `${encoding}: ${JSON.stringify(text.slice(0, 100))}`,
      )
      assert.equal(candidate.countTokens(text), expected.length)
      assert.deepEqual(
        Array.from(candidate.encodeGenerator(text)).flat(),
        expected,
      )
      // Unpaired UTF-16 surrogates are normalized to replacement characters by
      // UTF-8 conversion. Compare reference output rather than the input string.
      const decoded = decoder.decode(
        reference.decode(Uint32Array.from(expected)),
      )
      assert.equal(candidate.decode(expected), decoded)
      assert.equal(
        Array.from(candidate.decodeGenerator(expected)).join(''),
        decoded,
      )
      count++
    } catch (error) {
      recordFailure(
        encoding,
        {
          text: text.length < 4096 ? text : text.slice(0, 100),
          length: text.length,
        },
        error,
      )
    }
  }
  for (const capacity of [0, 1, 64]) {
    candidate.setMergeCacheSize(capacity)
    candidate.clearMergeCache()
    for (const text of documents
      .slice(0, 4)
      .flatMap((document) => [
        document.text,
        document.stream[0],
        document.text,
      ])) {
      try {
        const expected = Array.from(reference.encode(text))
        assert.deepEqual(candidate.encode(text), expected)
        assert.equal(candidate.countTokens(text), expected.length)
      } catch (error) {
        recordFailure(encoding, { capacity, text: text.slice(0, 100) }, error)
      }
    }
  }
  candidate.setMergeCacheSize(100000)
  candidate.clearMergeCache()
  try {
    const text = 'antidisestablishmentarianism'
    const expected = Array.from(reference.encode(text))
    const chunks = Array.from(candidate.encodeGenerator(text))
    assert.ok(chunks.some((chunk) => chunk.length > 1))
    for (const chunk of chunks) chunk.splice(0, chunk.length, 0)
    const output = candidate.encode(text)
    assert.deepEqual(output, expected, 'generator output cannot mutate cache')
    output.splice(0, output.length, 0)
    assert.deepEqual(
      candidate.encode(text),
      expected,
      'encode output cannot mutate cache',
    )
    assert.equal(candidate.countTokens(text), expected.length)
    assert.deepEqual(
      Array.from(candidate.encodeGenerator(text)).flat(),
      expected,
    )
  } catch (error) {
    recordFailure(encoding, { api: 'output mutation/cache ownership' }, error)
  }
  candidate.clearMergeCache()
  const special = 'before<|endoftext|>after'
  assert.throws(() => candidate.encode(special))
  assert.throws(() => reference.encode(special))
  assert.deepEqual(
    candidate.encode(special, { allowedSpecial: new Set(['<|endoftext|>']) }),
    Array.from(reference.encode(special, ['<|endoftext|>'])),
  )
  assert.deepEqual(
    candidate.encode(special, { disallowedSpecial: new Set() }),
    Array.from(reference.encode(special, [], [])),
  )
  try {
    assert.throws(() => candidate.countTokens(special))
    assert.throws(() => Array.from(candidate.encodeGenerator(special)))
    for (const [options, expected] of [
      [
        { allowedSpecial: new Set(['<|endoftext|>']) },
        Array.from(reference.encode(special, ['<|endoftext|>'])),
      ],
      [
        { disallowedSpecial: new Set() },
        Array.from(reference.encode(special, [], [])),
      ],
    ]) {
      assert.equal(candidate.countTokens(special, options), expected.length)
      assert.deepEqual(
        Array.from(candidate.encodeGenerator(special, options)).flat(),
        expected,
      )
    }
  } catch (error) {
    recordFailure(encoding, { special, api: 'count/generator' }, error)
  }
  // Sample arbitrary VALID vocabulary IDs, including non-text UTF-8 sequences.
  const ranksPath = new URL(
    `../node_modules/tiktoken/encoders/${encoding}.json`,
    import.meta.url,
  )
  const ranks = JSON.parse(readFileSync(ranksPath, 'utf8'))
  const valid = [
    ...ranks.bpe_ranks
      .trim()
      .split('\n')
      .flatMap((row) => {
        const [, offset, ...tokens] = row.split(' ')
        return tokens.map((_, index) => Number(offset) + index)
      }),
    ...Object.values(ranks.special_tokens),
  ]
  for (let iteration = 0; iteration < 350; iteration++) {
    const ids = Array.from(
      {
        length: iteration < 250 ? 1 + (random() % 24) : 128 + (random() % 385),
      },
      () =>
        iteration >= 300 ? random() % 256 : valid[random() % valid.length],
    )
    try {
      const expected = decoder.decode(reference.decode(Uint32Array.from(ids)))
      assert.equal(
        candidate.decode(Uint32Array.from(ids)),
        expected,
        `${encoding}: arbitrary IDs ${ids}`,
      )
      assert.equal(
        candidate.decode(
          (function* () {
            yield* ids
          })(),
        ),
        expected,
        'generic iterable decode',
      )
      assert.equal(
        Array.from(candidate.decodeGenerator(ids)).join(''),
        expected,
      )
      async function* source() {
        yield* ids
      }
      let asynchronous = ''
      for await (const part of candidate.decodeAsyncGenerator(source()))
        asynchronous += part
      assert.equal(asynchronous, expected)
    } catch (error) {
      recordFailure(encoding, { ids }, error)
    }
  }
  for (const text of ['🦊€a', '👨‍👩‍👧‍👦', '漢e\u0301']) {
    const tokens = Array.from(reference.encode(text))
    for (let length = 1; length <= tokens.length; length++) {
      const left = tokens.slice(0, length),
        right = tokens.slice(length)
      try {
        const a = candidate.decodeGenerator(left),
          b = candidate.decodeGenerator(right)
        let actualA = '',
          actualB = '',
          doneA = false,
          doneB = false
        while (!doneA || !doneB) {
          if (!doneA) {
            const next = a.next()
            doneA = next.done
            if (!next.done) actualA += next.value
          }
          if (!doneB) {
            const next = b.next()
            doneB = next.done
            if (!next.done) actualB += next.value
          }
        }
        assert.equal(
          actualA,
          decoder.decode(reference.decode(Uint32Array.from(left))),
          'interleaved prefix',
        )
        assert.equal(
          actualB,
          decoder.decode(reference.decode(Uint32Array.from(right))),
          'interleaved suffix',
        )
      } catch (error) {
        recordFailure(encoding, { text, prefixLength: length }, error)
      }
    }
  }
  // Invalid IDs are observed separately: packages do not promise identical
  // rejection or lossy-decoding behavior. Never pass them to a native decoder.
  const invalid = [-1, 2 ** 32, NaN, 99999999].map((id) => {
    try {
      return { id: String(id), outcome: candidate.decode([id]) }
    } catch (error) {
      return { id: String(id), error: String(error) }
    }
  })
  results.push({
    encoding,
    strings: count,
    validIdSequences: 350,
    invalid,
    corpusHash: sha256(JSON.stringify(strings)),
  })
  reference.free()
}
process.exitCode = failureCount ? 1 : 0
console.log(
  JSON.stringify(
    {
      candidate: { root: candidateRoot, files: candidateFiles },
      runtime: {
        executable: process.execPath,
        version: process.version,
        bun: process.versions.bun ?? null,
        platform: process.platform,
        arch: process.arch,
      },
      harnessSha256,
      recordedAt: new Date().toISOString(),
      reference: {
        package: 'tiktoken',
        version: tokenizers.find((adapter) => adapter.id === 'tiktoken')
          .version,
      },
      passed: failureCount === 0,
      failureCount,
      failureCounts,
      failures,
      seed: '0x519be07',
      results,
    },
    null,
    2,
  ),
)
