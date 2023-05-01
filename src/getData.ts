import fs from 'fs'
import path from 'path'
import { dictZip, range } from './utils'

const bpeFile = fs.readFileSync(
  path.join(__dirname, '../data/vocab.bpe'),
  'utf8',
)
const lines = bpeFile.split('\n')

const bpeMerges = lines.slice(1, -1).map((x) =>
  x
    .split(/(\s+)/)
    .filter((e) => e.trim().length > 0)
    .join(','),
)

const bpeRanks = dictZip(bpeMerges, range(0, bpeMerges.length))
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const encoder: object = require('../data/encoder.json')

fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true })
fs.writeFileSync(
  path.join(__dirname, 'data/bpeRanks.js'),
  `/* eslint-disable */\n// @ts-nocheck\n// prettier-ignore\nexport default ${JSON.stringify(
    bpeRanks,
  )}`,
)
fs.writeFileSync(
  path.join(__dirname, 'data/encoder.js'),
  `/* eslint-disable */\n// @ts-nocheck\n// prettier-ignore\nexport default ${JSON.stringify(
    encoder,
  )}`,
)
