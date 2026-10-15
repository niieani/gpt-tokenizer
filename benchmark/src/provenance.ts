import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

// Publish a stable machine identifier without exposing a private hostname.
export function benchmarkHostId(): string {
  return (
    process.env.GPT_BENCH_HOST_ID ??
    `host-${createHash('sha256').update(os.hostname()).digest('hex').slice(0, 16)}`
  )
}

// Hash the executed build as well as recording its source commit. A stale esm/
// directory must not silently masquerade as the current checkout.
export function builtModuleHashes(): Record<string, string> {
  const root = new URL('../../esm/', import.meta.url)
  return Object.fromEntries(
    readdirSync(fileURLToPath(root), { recursive: true })
      .filter(
        (path): path is string =>
          typeof path === 'string' && path.endsWith('.js'),
      )
      .sort()
      .map((path) => [
        path,
        createHash('sha256')
          .update(readFileSync(new URL(path, root)))
          .digest('hex'),
      ]),
  )
}

export function requireBenchmarkRuntime(): void {
  if (process.versions.bun) {
    if (process.versions.bun !== '1.4.3') throw new Error('Use Bun 1.4.3')
  } else if (process.versions.node !== '26.12.0') {
    throw new Error('Use Node 26.12.0')
  }
}
