import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const esm = await import('gpt-tokenizer')
const cjs = require('gpt-tokenizer')
const esmModel = await import('gpt-tokenizer/model/gpt-4o')
const cjsModel = require('gpt-tokenizer/model/gpt-4o')

for (const api of [esm, cjs, esmModel, cjsModel]) {
  assert.deepEqual(api.encode('hello world'), [24_912, 2_375])
  assert.equal(api.decode([24_912, 2_375]), 'hello world')
}
