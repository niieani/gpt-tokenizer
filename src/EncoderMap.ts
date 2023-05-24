export class EncoderMap implements Map<Uint8Array, number> {
  [Symbol.toStringTag] = `[object EncoderMap]`
  private encoder: Map<string, number>

  constructor(
    encoder?: Map<Uint8Array, number> | Iterable<readonly [Uint8Array, number]>,
  ) {
    this.encoder = new Map(
      encoder
        ? // eslint-disable-next-line unicorn/prefer-spread
          Array.from(encoder, ([key, value]) => [key.toString(), value])
        : undefined,
    )
  }
  get size(): number {
    return this.encoder.size
  }
  clear(): void {
    this.encoder.clear()
  }
  delete(key: Uint8Array): boolean {
    return this.encoder.delete(key.toString())
  }
  forEach(
    callbackfn: (value: number, key: Uint8Array, map: EncoderMap) => void,
  ): void {
    this.encoder.forEach((value, key) => {
      callbackfn(value, new Uint8Array(key.split(',').map(Number)), this)
    })
  }
  get(key: Uint8Array): number | undefined {
    return this.encoder.get(key.toString())
  }
  getOrThrow(key: Uint8Array): number {
    const value = this.encoder.get(key.toString())
    if (typeof value === 'undefined') {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `The byte-pair encoding does not contain a value for: ${key.toString()}`,
      )
    }
    return value
  }
  has(key: Uint8Array): boolean {
    return this.encoder.has(key.toString())
  }
  set(key: Uint8Array, value: number): this {
    this.encoder.set(key.toString(), value)
    return this
  }
  *entries(): IterableIterator<[Uint8Array, number]> {
    for (const [key, value] of this.encoder.entries()) {
      yield [new Uint8Array(key.split(',').map(Number)), value]
    }
  }
  *keys(): IterableIterator<Uint8Array> {
    for (const key of this.encoder.keys()) {
      yield new Uint8Array(key.split(',').map(Number))
    }
  }
  values(): IterableIterator<number> {
    return this.encoder.values()
  }
  [Symbol.iterator](): IterableIterator<[Uint8Array, number]> {
    return this.entries()
  }
}
