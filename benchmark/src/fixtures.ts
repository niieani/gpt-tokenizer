import { createHash } from 'node:crypto'
import { readFile, mkdir, writeFile } from 'node:fs/promises'

export async function prepareFixtures() {
  const manifest = JSON.parse(
    await readFile(new URL('../fixtures.json', import.meta.url), 'utf8'),
  ) as Record<string, Record<string, { url: string; sha256: string }>>
  for (const [encoding, files] of Object.entries(manifest)) {
    for (const [name, { url, sha256 }] of Object.entries(files)) {
      const path = new URL(`../fixtures/${encoding}/${name}`, import.meta.url)
      let data: Uint8Array
      try {
        data = await readFile(path)
      } catch {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`${response.status}: ${url}`)
        data = new Uint8Array(await response.arrayBuffer())
        await mkdir(new URL('.', path), { recursive: true })
        await writeFile(path, data)
      }
      if (createHash('sha256').update(data).digest('hex') !== sha256)
        throw new Error(`Fixture hash mismatch: ${path}`)
    }
  }
}
