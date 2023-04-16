/* eslint-disable compat/compat */
import {
  decode,
  decodeAsyncGenerator,
  decodeGenerator,
  encode,
  isWithinTokenLimit,
} from './encoder'

describe('basic functionality', () => {
  it('empty string', () => {
    const str = ''
    expect(encode(str)).toEqual([])
    expect(decode(encode(str))).toEqual(str)
    expect(isWithinTokenLimit(str, 0)).toBe(0)
    expect(isWithinTokenLimit(str, 3)).toBe(0)
  })

  it('space', () => {
    const str = ' '
    expect(encode(str)).toEqual([220])
    expect(decode(encode(str))).toEqual(str)
    expect(isWithinTokenLimit(str, 3)).toBe(1)
    expect(isWithinTokenLimit(str, 0)).toBe(false)
  })

  it('tab', () => {
    const str = '\t'
    expect(encode(str)).toEqual([197])
    expect(decode(encode(str))).toEqual(str)
  })

  it('simple text', () => {
    const str = 'This is some text'
    expect(encode(str)).toEqual([1_212, 318, 617, 2_420])
    expect(decode(encode(str))).toEqual(str)
    expect(isWithinTokenLimit(str, 3)).toBe(false)
    expect(isWithinTokenLimit(str, 5)).toBe(4)
  })

  it('multi-token word', () => {
    const str = 'indivisible'
    expect(encode(str)).toEqual([521, 452, 12_843])
    expect(decode(encode(str))).toEqual(str)
    expect(isWithinTokenLimit(str, 3)).toBe(3)
  })

  const helloWorldTokens = [31_373, 50_169, 233, 995, 12_520, 234, 235]

  it('emojis', () => {
    const str = 'hello 👋 world 🌍'
    expect(encode(str)).toEqual(helloWorldTokens)
    expect(decode(encode(str))).toEqual(str)
    expect(isWithinTokenLimit(str, 4)).toBe(false)
    expect(isWithinTokenLimit(str, 400)).toBe(7)
  })

  it('decode token-by-token via generator', () => {
    const generator = decodeGenerator(helloWorldTokens)
    expect(generator.next().value).toBe('hello')
    expect(generator.next().value).toBe(' ')
    expect(generator.next().value).toBe('👋')
    expect(generator.next().value).toBe(' world')
    expect(generator.next().value).toBe(' ')
    expect(generator.next().value).toBe('🌍')
  })

  async function* getHelloWorldTokensAsync() {
    for (const token of helloWorldTokens) {
      // eslint-disable-next-line no-await-in-loop
      yield await Promise.resolve(token)
    }
  }

  it('decode token-by-token via async generator', async () => {
    const generator = decodeAsyncGenerator(getHelloWorldTokensAsync())
    const decoded = ['hello', ' ', '👋', ' world', ' ', '🌍']
    for await (const value of generator) {
      expect(value).toEqual(decoded.shift())
    }
  })

  it('properties of Object', () => {
    const str = 'toString constructor hasOwnProperty valueOf'

    expect(encode(str)).toEqual([
      1_462, 10_100, 23_772, 468, 23_858, 21_746, 1_988, 5_189,
    ])
    expect(decode(encode(str))).toEqual(str)
  })

  it('text with commas', () => {
    const str = 'hello, I am a text, and I have commas. a,b,c'
    expect(decode(encode(str))).toEqual(str)
    expect(encode(str)).toStrictEqual([
      31_373, 11, 314, 716, 257, 2_420, 11, 290, 314, 423, 725, 292, 13, 257,
      11, 65, 11, 66,
    ])
    expect(isWithinTokenLimit(str, 15)).toBe(false)
    expect(isWithinTokenLimit(str, 300)).toBe(18)
  })
})
