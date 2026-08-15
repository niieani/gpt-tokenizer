import { mkdir, writeFile } from 'node:fs/promises'

const directories = [
  ['cjs', 'commonjs'],
  ['esm', 'module'],
]

await Promise.all(
  directories.map(async ([directory, type]) => {
    const outputDirectory = new URL(`../${directory}/`, import.meta.url)
    await mkdir(outputDirectory, { recursive: true })
    await writeFile(
      new URL('package.json', outputDirectory),
      `${JSON.stringify({ name: 'gpt-tokenizer', type })}\n`,
    )
  }),
)
