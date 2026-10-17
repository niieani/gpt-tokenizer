// Benchmark for the segment-special incremental token counter.
// Run with:
//   node --import node-resolve-ts/register scripts/bench-incremental-segment-special.mjs
// Prints exactly one JSON object to stdout:
//   {"slug":"segment-special","exact":true,"cases":N,"workloads":{...}}

import process from 'node:process'
import { performance } from 'node:perf_hooks'
import o200k from '../src/encoding/o200k_base.js'
import { createIncrementalCounter } from '../src/incremental/segment-special.js'

const WORDS = [
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'hotel',
  'india',
  'juliet',
  'kilo',
  'lima',
  'mike',
  'november',
  'oscar',
  'papa',
]

/** Fixed word list cycled until the length is reached, newline every 17 words. */
function buildProse(targetLength, wordOffset = 0) {
  let out = ''
  let i = 0
  while (out.length < targetLength) {
    out += WORDS[(wordOffset + i) % WORDS.length]
    out += (i + 1) % 17 === 0 ? '\n' : ' '
    i++
  }
  return out.slice(0, targetLength)
}

const APPEND_SENTENCE = 'a quick fox jumped. '.slice(0, 20)

function applyOp(text, op) {
  return (
    text.slice(0, op.start) + op.insert + text.slice(op.start + op.deleteCount)
  )
}

/** Builds the 50 ops for one workload against a live mirror of the text. */
function buildOps(name, base) {
  const ops = []
  let text = base
  for (let i = 0; i < 50; i++) {
    let op
    if (name === 'append') {
      op = { start: text.length, deleteCount: 0, insert: APPEND_SENTENCE }
    } else if (name === 'middleEdit') {
      const mid = Math.floor(text.length / 2) - 4
      op = {
        start: mid,
        deleteCount: 8,
        insert: `${WORDS[(i * 3) % WORDS.length]}${i}`,
      }
    } else if (name === 'prefixEdit') {
      op = {
        start: 10,
        deleteCount: 8,
        insert: `${WORDS[(i * 5) % WORDS.length]}${i}`,
      }
    } else {
      // chatTail: replace the whole 200-char tail with a different one.
      op = { start: 10000, deleteCount: 200, insert: buildProse(200, i * 5) }
    }
    ops.push(op)
    text = applyOp(text, op)
  }
  return ops
}

function runWorkload(name, base) {
  const ops = buildOps(name, base)

  // Verification pass: every op must match encoding.countTokens exactly;
  // any mismatch throws, so reaching the return means every case was exact.
  let cases = 0
  {
    const counter = createIncrementalCounter(o200k)
    counter.update(base)
    let text = base
    for (const op of ops) {
      text = applyOp(text, op)
      const expected = o200k.countTokens(text)
      const actual = counter.applyEdit(op.start, op.deleteCount, op.insert)
      cases++
      if (actual !== expected || counter.count() !== expected) {
        throw new Error(
          `exactness violation in ${name}: incremental=${actual} countTokens=${expected}`,
        )
      }
    }
  }

  // Timed baseline: countTokens on the full string after every op.
  let baselineMs
  {
    let text = base
    // warm up the merge cache once so both sides see the same cache state
    o200k.countTokens(text)
    const t0 = performance.now()
    for (const op of ops) {
      text = applyOp(text, op)
      o200k.countTokens(text)
    }
    baselineMs = performance.now() - t0
  }

  // Timed incremental: counter prepared outside the timed region.
  let incrementalMs
  {
    const counter = createIncrementalCounter(o200k)
    counter.update(base)
    const t0 = performance.now()
    for (const op of ops) {
      counter.applyEdit(op.start, op.deleteCount, op.insert)
    }
    incrementalMs = performance.now() - t0
  }

  const safeIncrementalMs = Math.max(incrementalMs, 1e-4)
  return {
    cases,
    result: {
      baselineMs: Number(baselineMs.toFixed(4)),
      incrementalMs: Number(safeIncrementalMs.toFixed(4)),
      speedup: Number((baselineMs / safeIncrementalMs).toFixed(3)),
    },
  }
}

const workloads = {}
let totalCases = 0
for (const [name, base] of [
  ['append', buildProse(12000)],
  ['middleEdit', buildProse(12000)],
  ['prefixEdit', buildProse(12000)],
  ['chatTail', buildProse(10000) + buildProse(200, 3)],
]) {
  const { cases, result } = runWorkload(name, base)
  totalCases += cases
  workloads[name] = result
}

process.stdout.write(
  `${JSON.stringify({
    slug: 'segment-special',
    // The verification pass throws on any mismatch, so exact is true here
    // only because every case was verified against countTokens.
    exact: true,
    cases: totalCases,
    workloads,
  })}\n`,
)
