import { rm } from 'node:fs/promises'
import { URL } from 'node:url'

await Promise.all(
  ['cjs', 'esm'].map((directory) =>
    rm(new URL(`../${directory}`, import.meta.url), {
      force: true,
      recursive: true,
    }),
  ),
)
