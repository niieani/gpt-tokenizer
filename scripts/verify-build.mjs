import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { URL } from 'node:url'

const require = createRequire(import.meta.url)
const esm = await import('gpt-tokenizer')
const cjs = require('gpt-tokenizer')
const esmModel = await import('gpt-tokenizer/model/gpt-4o')
const cjsModel = require('gpt-tokenizer/model/gpt-4o')

for (const api of [esm, cjs, esmModel, cjsModel]) {
  assert.deepEqual(api.encode('hello world'), [24_912, 2_375])
  assert.equal(api.decode([24_912, 2_375]), 'hello world')
}

for (const format of ['cjs', 'esm']) {
  const bpeRankDirectory = new URL(`../${format}/bpeRanks/`, import.meta.url)
  const files = await readdir(bpeRankDirectory)

  assert.equal(
    files.some((file) => file.endsWith('.map')),
    false,
    `${format} BPE ranks must not include source maps`,
  )

  for (const file of files.filter((name) => name.endsWith('.js'))) {
    const code = await readFile(new URL(file, bpeRankDirectory), 'utf8')
    assert.equal(/\n\/\/# sourceMappingURL=.*\s*$/.test(code), false)
  }
}
