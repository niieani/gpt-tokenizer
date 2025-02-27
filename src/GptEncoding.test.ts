import fs from 'fs'
import path from 'path'
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from 'vitest'
import { ALL_SPECIAL_TOKENS } from './constants.js'
import { type ChatMessage, GptEncoding } from './GptEncoding.js'
import {
  type ChatModelName,
  type EncodingName,
  chatModelParams,
  encodingNames,
} from './mapping.js'
import { models } from './models.js'
import { resolveEncoding } from './resolveEncoding.js'
import { EndOfText } from './specialTokens.js'

const sharedResults = {
  space: [220],
  tab: [197],
  'This is some text': [1_212, 318, 617, 2_420],
  indivisible: [521, 452, 12_843],
  'hello 👋 world 🌍': [31_373, 50_169, 233, 995, 12_520, 234, 235],
  decodedHelloWorldTokens: ['hello', ' ', '👋', ' world', ' ', '🌍'],
  'toString constructor hasOwnProperty valueOf': [
    1_462, 10_100, 23_772, 468, 23_858, 21_746, 1_988, 5_189,
  ],
  'hello, I am a text, and I have commas. a,b,c': [
    31_373, 11, 314, 716, 257, 2_420, 11, 290, 314, 423, 725, 292, 13, 257, 11,
    65, 11, 66,
  ],
}

const results = {
  o200k_base: {
    space: [220],
    tab: [197],
    'This is some text': [2_500, 382, 1_236, 2_201],
    indivisible: [521, 349, 181_386],
    'hello 👋 world 🌍': [24_912, 61_138, 233, 2_375, 130_321, 235],
    decodedHelloWorldTokens: ['hello', ' ', '👋', ' world', ' ', '🌍'],
    'toString constructor hasOwnProperty valueOf': [
      935, 916, 9_220, 853, 18_555, 3_895, 1_432, 2_566,
    ],
    'hello, I am a text, and I have commas. a,b,c': [
      24_912, 11, 357, 939, 261, 2_201, 11, 326, 357, 679, 179_663, 13, 261,
      17_568, 22_261,
    ],
  },
  cl100k_base: {
    space: [220],
    tab: [197],
    'This is some text': [2_028, 374, 1_063, 1_495],
    indivisible: [485, 344, 23_936],
    'hello 👋 world 🌍': [15_339, 62_904, 233, 1_917, 11_410, 234, 235],
    decodedHelloWorldTokens: ['hello', ' ', '👋', ' world', ' ', '🌍'],
    'toString constructor hasOwnProperty valueOf': [
      6_712, 4_797, 706, 19_964, 907, 2_173,
    ],
    'hello, I am a text, and I have commas. a,b,c': [
      15_339, 11, 358, 1_097, 264, 1_495, 11, 323, 358, 617, 77_702, 13, 264,
      8_568, 10_317,
    ],
  },
  p50k_base: sharedResults,
  p50k_edit: sharedResults,
  r50k_base: sharedResults,
} satisfies Record<EncodingName, unknown>

const offsetPrompts = [
  // Basic prompt with "hello world"
  'hello world',

  // Basic prompt with special token end of text token
  `hello world${EndOfText} green cow`,

  // Chinese text: "我非常渴望与人工智能一起工作"
  '我非常渴望与人工智能一起工作',

  // Contains the interesting tokens b'\xe0\xae\xbf\xe0\xae' and b'\xe0\xaf\x8d\xe0\xae'
  // in which \xe0 is the start of a 3-byte UTF-8 character
  'நடிகர் சூர்யா',

  // Contains the interesting token b'\xa0\xe9\x99\xa4'
  // in which \xe9 is the start of a 3-byte UTF-8 character and \xa0 is a continuation byte
  ' Ġ除',
]

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const testPlans = loadTestPlans()

describe.each(encodingNames)('%s', (encodingName: EncodingName) => {
  const encoding = GptEncoding.getEncodingApi(encodingName, resolveEncoding)

  const {
    decode,
    decodeGenerator,
    decodeAsyncGenerator,
    encode,
    isWithinTokenLimit,
  } = encoding

  describe('encode and decode', () => {
    test.each(offsetPrompts)('offset prompt: %s', (str) => {
      expect(
        decode(encode(str, { allowedSpecial: ALL_SPECIAL_TOKENS })),
      ).toEqual(str)
    })
  })

  describe('basic functionality', () => {
    const result = results[encodingName]
    test('empty string', () => {
      const str = ''
      expect(encode(str)).toEqual([])
      expect(decode(encode(str))).toEqual(str)
      expect(isWithinTokenLimit(str, 0)).toBe(0)
      expect(isWithinTokenLimit(str, 3)).toBe(0)
    })

    test('space', () => {
      const str = ' '
      expect(encode(str)).toEqual(result.space)
      expect(decode(encode(str))).toEqual(str)
      expect(isWithinTokenLimit(str, 3)).toBe(1)
      expect(isWithinTokenLimit(str, 0)).toBe(false)
    })

    test('tab', () => {
      const str = '\t'
      expect(encode(str)).toEqual(result.tab)
      expect(decode(encode(str))).toEqual(str)
    })

    test('simple text', () => {
      const str = 'This is some text'
      expect(encode(str)).toEqual(result[str])
      expect(decode(encode(str))).toEqual(str)
      expect(isWithinTokenLimit(str, 3)).toBe(false)
      expect(isWithinTokenLimit(str, 5)).toBe(result[str].length)
    })

    test('multi-token word', () => {
      const str = 'indivisible'
      expect(encode(str)).toEqual(result.indivisible)
      expect(decode(encode(str))).toEqual(str)
      expect(isWithinTokenLimit(str, 3)).toBe(result.indivisible.length)
    })

    test('emojis', () => {
      const str = 'hello 👋 world 🌍'
      expect(encode(str)).toEqual(result[str])
      expect(decode(encode(str))).toEqual(str)
      expect(isWithinTokenLimit(str, 4)).toBe(false)
      expect(isWithinTokenLimit(str, 400)).toBe(result[str].length)
    })

    test('decode token-by-token via generator', () => {
      const str = 'hello 👋 world 🌍'
      const generator = decodeGenerator(result[str])
      result.decodedHelloWorldTokens.forEach((token: string) => {
        expect(generator.next().value).toBe(token)
      })
    })

    test('encodes and decodes special tokens', () => {
      const str = `hello ${EndOfText} world`
      const encoded = encode(str, {
        allowedSpecial: ALL_SPECIAL_TOKENS,
      })
      expect(decode(encoded)).toEqual(str)
    })

    async function* getHelloWorldTokensAsync() {
      const str = 'hello 👋 world 🌍'
      for (const token of result[str]) {
        // eslint-disable-next-line no-await-in-loop
        yield await Promise.resolve(token)
      }
    }

    test('decode token-by-token via async generator', async () => {
      const generator = decodeAsyncGenerator(getHelloWorldTokensAsync())
      const decoded = [...result.decodedHelloWorldTokens]
      for await (const value of generator) {
        expect(value).toEqual(decoded.shift())
      }
    })

    test('properties of Object', () => {
      const str = 'toString constructor hasOwnProperty valueOf'

      expect(encode(str)).toEqual(result[str])
      expect(decode(encode(str))).toEqual(str)
    })

    test('text with commas', () => {
      const str = 'hello, I am a text, and I have commas. a,b,c'
      expect(decode(encode(str))).toEqual(str)
      expect(encode(str)).toStrictEqual(result[str])
      expect(isWithinTokenLimit(str, result[str].length - 1)).toBe(false)
      expect(isWithinTokenLimit(str, 300)).toBe(result[str].length)
    })
  })

  describe('test plan', () => {
    testPlans[encodingName].forEach(({ sample, encoded }) => {
      test(`encodes ${sample}`, () => {
        expect(encode(sample)).toEqual(encoded)
      })
      test(`decodes ${sample}`, () => {
        expect(decode(encoded)).toEqual(sample)
      })
    })
  })
})

const chatModelNames = Object.keys(chatModelParams) as readonly ChatModelName[]

const exampleMessages: ChatMessage[] = [
  {
    role: 'system',
    content:
      'You are a helpful, pattern-following assistant that translates corporate jargon into plain English.',
  },
  {
    role: 'system',
    name: 'example_user',
    content: 'New synergies will help drive top-line growth.',
  },
  {
    role: 'system',
    name: 'example_assistant',
    content: 'Things working well together will increase revenue.',
  },
  {
    role: 'system',
    name: 'example_user',
    content:
      "Let's circle back when we have more bandwidth to touch base on opportunities for increased leverage.",
  },
  {
    role: 'system',
    name: 'example_assistant',
    content: "Let's talk later when we're less busy about how to do better.",
  },
  {
    role: 'user',
    content:
      "This late pivot means we don't have time to boil the ocean for the client deliverable.",
  },
] as const

describe.each(chatModelNames)('%s', (modelName) => {
  const encoding = GptEncoding.getEncodingApiForModel(
    modelName,
    resolveEncoding,
  )
  const expectedEncodedLength = modelName.startsWith('gpt-3.5-turbo')
    ? 127
    : modelName.startsWith('gpt-4o')
    ? 120
    : 121

  describe('chat functionality', () => {
    test('encodes a chat correctly', () => {
      const encoded = encoding.encodeChat(exampleMessages)
      expect(encoded).toMatchSnapshot()
      expect(encoded).toHaveLength(expectedEncodedLength)

      const decoded = encoding.decode(encoded)
      expect(decoded).toMatchSnapshot()
    })

    test('isWithinTokenLimit: false', () => {
      const isWithinTokenLimit = encoding.isWithinTokenLimit(
        exampleMessages,
        50,
      )
      expect(isWithinTokenLimit).toBe(false)
    })
    test('isWithinTokenLimit: true (number)', () => {
      const isWithinTokenLimit = encoding.isWithinTokenLimit(
        exampleMessages,
        150,
      )
      expect(isWithinTokenLimit).toBe(expectedEncodedLength)
    })
  })
})

describe('estimateCost functionality', () => {
  const gpt4oEncoding = GptEncoding.getEncodingApiForModel(
    'gpt-4o',
    resolveEncoding,
  )
  const gpt35Encoding = GptEncoding.getEncodingApiForModel(
    'gpt-3.5-turbo',
    resolveEncoding,
  )

  test('estimates cost correctly for gpt-4o model', () => {
    const tokenCount = 1_000
    const cost = gpt4oEncoding.estimateCost(tokenCount)

    // gpt-4o has $2.5 per million tokens for input and $10 per million tokens for output
    expect(cost.input).toBeCloseTo(0.002_5, 6) // 1000/1M * $2.5
    expect(cost.output).toBeCloseTo(0.01, 6) // 1000/1M * $10
    expect(cost.batchInput).toBeCloseTo(0.001_25, 6) // 1000/1M * $1.25
    expect(cost.batchOutput).toBeCloseTo(0.005, 6) // 1000/1M * $5
  })

  test('estimates cost correctly for gpt-3.5-turbo model', () => {
    const tokenCount = 1_000
    const cost = gpt35Encoding.estimateCost(tokenCount)

    // gpt-3.5-turbo has $0.5 per million tokens for input and $1.5 per million tokens for output
    expect(cost.input).toBeCloseTo(0.000_5, 6) // 1000/1M * $0.5
    expect(cost.output).toBeCloseTo(0.001_5, 6) // 1000/1M * $1.5
    expect(cost.batchInput).toBeCloseTo(0.000_25, 6) // 1000/1M * $0.25
    expect(cost.batchOutput).toBeCloseTo(0.000_75, 6) // 1000/1M * $0.75
  })

  test('allows overriding model name', () => {
    const tokenCount = 1_000
    // Use gpt-4o encoding but override with gpt-3.5-turbo model name
    const cost = gpt4oEncoding.estimateCost(tokenCount, 'gpt-3.5-turbo')

    expect(cost.input).toBeCloseTo(0.000_5, 6) // 1000/1M * $0.5
    expect(cost.output).toBeCloseTo(0.001_5, 6) // 1000/1M * $1.5
  })

  test('throws error when model name is not provided', () => {
    const encoding = GptEncoding.getEncodingApi('cl100k_base', resolveEncoding)
    const tokenCount = 1_000

    // No model name was provided during initialization or function call
    expect(() => encoding.estimateCost(tokenCount)).toThrow(
      'Model name must be provided either during initialization or passed in to the method.',
    )
  })

  test('throws error for unknown model', () => {
    const tokenCount = 1_000
    expect(() =>
      gpt4oEncoding.estimateCost(tokenCount, 'non-existent-model' as any),
    ).toThrow('Unknown model: non-existent-model')
  })

  test('only includes properties that exist for the model', () => {
    // Find a model that only has input cost but no output cost
    const modelWithInputOnly = Object.entries(models).find(
      ([_, model]) =>
        model.cost?.input !== undefined && model.cost?.output === undefined,
    )

    if (modelWithInputOnly) {
      const [modelName] = modelWithInputOnly
      const cost = gpt4oEncoding.estimateCost(1_000, modelName as any)

      expect(cost.input).toBeDefined()
      expect(cost.output).toBeUndefined()
    } else {
      // Skip test if we can't find an appropriate model
      console.log('Skipping test: no model with input-only cost found')
    }
  })
})

function loadTestPlans() {
  const testPlanPath = path.join(__dirname, '../data/TestPlans.txt')
  const testPlanData = fs.readFileSync(testPlanPath, 'utf8')
  const tests: Record<
    EncodingName,
    { sample: string; encoded: readonly number[] }[]
  > = {
    cl100k_base: [],
    p50k_base: [],
    p50k_edit: [],
    r50k_base: [],
    o200k_base: [],
  }
  testPlanData.split('\n\n').forEach((testPlan) => {
    const [encodingNameLine, sampleLine, encodedLine] = testPlan.split('\n')
    if (!encodingNameLine || !sampleLine || !encodedLine) return
    const encodingName = encodingNameLine.split(': ')[1] as EncodingName
    tests[encodingName].push({
      sample: sampleLine.split(': ').slice(1).join(': ') ?? '',
      encoded: JSON.parse(encodedLine.split(': ')[1] ?? '[]'),
    })
  })
  return tests
}
