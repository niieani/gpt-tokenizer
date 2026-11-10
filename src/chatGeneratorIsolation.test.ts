import { expect, test, vi } from 'vite-plus/test'
import type {
  ChatMessage,
  EncodeChatOptions,
  EncodeOptions,
} from './GptEncoding.js'
import { GptEncoding } from './GptEncoding.js'
import cl100kRanks from './bpeRanks/cl100k_base.js'
import gpt35 from './model/gpt-3.5-0301.js'
import gpt4o from './model/gpt-4o.js'
import gptOss from './model/gpt-oss-20b.js'
import { EndOfText } from './specialTokens.js'

for (const [name, encoding] of [
  ['gpt-3.5-0301', gpt35],
  ['gpt-4o', gpt4o],
] as const) {
  test.each(['role', 'name', 'role separator', 'message separator'] as const)(
    `${name} chat generator isolates yielded %s chunks`,
    (kind) => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'first' },
        { role: 'user', content: 'second' },
      ]
      if (kind === 'name') {
        messages[0]!.name = 'customer'
        messages[1]!.name = 'customer'
      }
      const expected = encoding.encodeChat(messages)
      const chunks: number[][] = []
      let index = 0
      for (const chunk of encoding.encodeChatGenerator(messages)) {
        chunks.push([...chunk])
        if (
          index ===
          (kind === 'message separator' ? 5 : kind === 'role separator' ? 2 : 1)
        ) {
          chunk.fill(0)
          chunk.push(999)
        }
        index++
      }
      expect(chunks.flat()).toEqual(expected)
      expect(encoding.encodeChat(messages)).toEqual(expected)
    },
  )
}

for (const [name, encoding] of [
  ['gpt-3.5-0301', gpt35],
  ['gpt-4o', gpt4o],
  ['gpt-oss-20b', gptOss],
] as const) {
  test.each(['', 'assistant', 'assistant response'])(
    `${name} chat consumers agree with prime %j after public chunk mutation`,
    (primeWithAssistantResponse) => {
      const messages: ChatMessage[] = [
        { content: '' },
        { role: 'user', name: 'customer', content: `Hello ${EndOfText}` },
        { role: 'user', name: 'customer', content: 'Hello again 👋' },
      ]
      const options: EncodeOptions & EncodeChatOptions = {
        allowedSpecial: new Set([EndOfText]),
        primeWithAssistantResponse,
      }
      const expected = [
        ...encoding.encodeChatGenerator(messages, undefined, options),
      ].flat()
      const observed: number[] = []
      for (const chunk of encoding.encodeChatGenerator(
        messages,
        undefined,
        options,
      )) {
        observed.push(...chunk)
        chunk.fill(0)
        chunk.push(999)
        // Reentrant calls must not share mutable public chunks either.
        expect(encoding.countTokens(messages, options)).toBe(expected.length)
      }
      expect(observed).toEqual(expected)
      const encoded = encoding.encodeChat(messages, undefined, options)
      expect(encoded).toEqual(expected)
      encoded.fill(0)
      expect(encoding.encodeChat(messages, undefined, options)).toEqual(
        expected,
      )
      expect(encoding.countTokens(messages, options)).toBe(expected.length)
      expect(
        encoding.isWithinTokenLimit(messages, expected.length, options),
      ).toBe(expected.length)
      expect(
        encoding.isWithinTokenLimit(messages, expected.length - 1, options),
      ).toBe(false)
    },
  )

  test(`${name} token limits close chat iterators without consuming later messages`, () => {
    let closed = false
    function* messages(): Generator<ChatMessage> {
      try {
        yield { role: 'user', content: 'first' }
        throw new Error('Later messages must not be requested')
      } finally {
        closed = true
      }
    }
    expect(encoding.isWithinTokenLimit(messages(), 0)).toBe(false)
    expect(closed).toBe(true)
  })

  test.each(['return', 'throw'] as const)(
    `${name} public generator %s closes its input iterator`,
    (action) => {
      let closed = false
      function* messages(): Generator<ChatMessage> {
        try {
          yield { role: 'user', content: 'first' }
          throw new Error('Later messages must not be requested')
        } finally {
          closed = true
        }
      }
      const generator = encoding.encodeChatGenerator(messages())
      generator.next()
      if (action === 'return') {
        generator.return(undefined)
      } else {
        const error = new Error('Stop encoding')
        expect(() => generator.throw(error)).toThrow(error)
      }
      expect(closed).toBe(true)
    },
  )

  test(`${name} chat consumers preserve public generator overrides`, () => {
    const generator = vi.spyOn(encoding, 'encodeChatGenerator')
    generator.mockImplementation(function* () {
      yield [42, 43]
    })
    try {
      const messages = [{ role: 'user', content: 'Hello' }]
      expect(encoding.encodeChat(messages)).toEqual([42, 43])
      expect(encoding.countTokens(messages)).toBe(2)
      expect(encoding.isWithinTokenLimit(messages, 2)).toBe(2)
      expect(generator).toHaveBeenCalledTimes(3)
      expect(generator).toHaveBeenNthCalledWith(
        1,
        messages,
        encoding.modelName,
        undefined,
      )
      expect(generator).toHaveBeenNthCalledWith(
        2,
        messages,
        undefined,
        undefined,
      )
      expect(generator).toHaveBeenNthCalledWith(
        3,
        messages,
        undefined,
        undefined,
      )
    } finally {
      generator.mockRestore()
    }
  })

  test(`${name} public chat generators keep validation lazy`, () => {
    const messages = [{ role: 'user', content: EndOfText }]
    const generator = encoding.encodeChatGenerator(messages)
    expect(() => [...generator]).toThrow('Disallowed special token found')
    expect(() => encoding.encodeChat(messages)).toThrow(
      'Disallowed special token found',
    )
    expect(() => encoding.countTokens(messages)).toThrow(
      'Disallowed special token found',
    )
    expect(() => encoding.isWithinTokenLimit(messages, Infinity)).toThrow(
      'Disallowed special token found',
    )
  })
}

test('chat consumers preserve prototype generator overrides installed before construction', () => {
  const generator = vi.spyOn(GptEncoding.prototype, 'encodeChatGenerator')
  generator.mockImplementation(function* () {
    yield [42, 43]
  })
  try {
    const encoding = GptEncoding.getEncodingApi(
      'cl100k_base',
      () => cl100kRanks,
    )
    expect(encoding.encodeChat([])).toEqual([42, 43])
    expect(encoding.countTokens([])).toBe(2)
    expect(encoding.isWithinTokenLimit([], 2)).toBe(2)
    expect(generator).toHaveBeenCalledTimes(3)
  } finally {
    generator.mockRestore()
  }
})
