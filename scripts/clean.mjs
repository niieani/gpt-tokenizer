import { rm } from 'node:fs/promises'

await Promise.all(
  ['cjs', 'dist', 'esm'].map((directory) =>
    rm(new URL(`../${directory}`, import.meta.url), {
      force: true,
      recursive: true,
    }),
  ),
)
