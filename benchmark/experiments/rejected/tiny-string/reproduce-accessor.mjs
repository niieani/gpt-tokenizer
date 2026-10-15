import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { requirePerfLease } = await import(
  pathToFileURL(resolve(process.env.TINY_PARENT_BENCH, 'dist/perfLease.js'))
)
requirePerfLease()
const corePath = resolve(process.argv[2])
const { BytePairEncodingCore } = await import(pathToFileURL(corePath))
const core = new BytePairEncodingCore({
  bytePairRankDecoder: ['a', 'b', [0xc3]],
  tokenSplitRegex: /./gu,
})

function fixture(proxy) {
  let reads = 0
  const read = () => (++reads === 1 ? 0 : 1)
  const tokens = proxy
    ? new Proxy([0, 2], {
        get(target, key, receiver) {
          return key === '0' ? read() : Reflect.get(target, key, receiver)
        },
      })
    : Object.defineProperty([0, 2], '0', { get: read })
  return { tokens, reads: () => reads }
}

const results = []
for (const proxy of [false, true]) {
  const direct = fixture(proxy)
  const generic = fixture(proxy)
  const actual = core.decodeNative(direct.tokens)
  const expected = core.decodeNative({
    [Symbol.iterator]: () => generic.tokens[Symbol.iterator](),
  })
  assert.equal(expected, 'a�')
  assert.equal(actual, 'b�')
  assert.equal(generic.reads(), 1)
  assert.equal(direct.reads(), 2)
  results.push({ proxy, expected, actual, expectedReads: 1, actualReads: 2 })
}
console.log(JSON.stringify({
  coreSha256: createHash('sha256').update(readFileSync(corePath)).digest('hex'),
  runtime: { node: process.versions.node, bun: process.versions.bun ?? null },
  results,
}, null, 2))
