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

fs.writeFileSync(
  path.join(__dirname, '../data/bpeRanks.json'),
  JSON.stringify(bpeRanks),
)
