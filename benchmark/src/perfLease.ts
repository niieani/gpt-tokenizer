import { readFileSync } from 'node:fs'

export function requirePerfLease(): void {
  const path = process.env.GPT_TOKENIZER_PERF_LEASE
  const token = process.env.GPT_TOKENIZER_PERF_TOKEN
  if (path && token) {
    const active = JSON.parse(readFileSync(path, 'utf8')) as { token: string }
    if (active.token === token) return
  }
  throw new Error(
    'Run through the machine-wide queue: python3 queue.py --label NAME -- COMMAND',
  )
}
