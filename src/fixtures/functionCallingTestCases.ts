import type { ChatCompletionRequest } from '../GptEncoding.js'

export type FunctionCallingTestCase = ChatCompletionRequest & { tokens: number }

export const functionCallingTestCases: FunctionCallingTestCase[] = [
  {
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful, pattern-following assistant that translates corporate jargon into plain English.',
      },
    ],
    tokens: 24,
  },
  {
    messages: [
      {
        role: 'system',
        name: 'example_user',
        content: 'New synergies will help drive top-line growth.',
      },
    ],
    tokens: 20,
  },
  {
    messages: [
      {
        role: 'system',
        name: 'example_assistant',
        content: 'Things working well together will increase revenue.',
      },
    ],
    tokens: 19,
  },
  {
    messages: [
      {
        role: 'system',
        name: 'example_user',
        content:
          "Let's circle back when we have more bandwidth to touch base on opportunities for increased leverage.",
      },
    ],
    tokens: 27,
  },
  {
    messages: [
      {
        role: 'system',
        name: 'example_assistant',
        content:
          "Let's talk later when we're less busy about how to do better.",
      },
    ],
    tokens: 24,
  },
  {
    messages: [
      {
        role: 'user',
        content:
          "This late pivot means we don't have time to boil the ocean for the client deliverable.",
      },
    ],
    tokens: 25,
  },
  {
    messages: [
      {
        role: 'user',
        content: 'hello',
      },
    ],
    tokens: 8,
  },
  {
    messages: [
      {
        role: 'user',
        content: 'hello world',
      },
    ],
    tokens: 9,
  },
  {
    messages: [
      {
        role: 'system',
        content: 'hello',
      },
    ],
    tokens: 8,
  },
  {
    messages: [
      {
        role: 'system',
        content: 'hello:',
      },
    ],
    tokens: 9,
  },
  {
    messages: [
      { role: 'system', content: "# Important: you're the best robot" },
      { role: 'user', content: 'hello robot' },
      { role: 'assistant', content: 'hello world' },
    ],
    tokens: 26,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'foo',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    tokens: 31,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'foo',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    function_call: 'none',
    tokens: 32,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'foo',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    function_call: 'auto',
    tokens: 31,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'foo',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    function_call: { name: 'foo' },
    tokens: 36,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'foo',
        description: 'Do a foo',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    tokens: 35,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'bing_bong',
        description: 'Do a bing bong',
        parameters: {
          type: 'object',
          properties: {
            foo: { type: 'string' },
          },
        },
      },
    ],
    tokens: 45,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'bing_bong',
        description: 'Do a bing bong',
        parameters: {
          type: 'object',
          properties: {
            foo: { type: 'string' },
            bar: { type: 'number', description: 'A number' },
          },
        },
      },
    ],
    tokens: 52,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'bing_bong',
        description: 'Do a bing bong',
        parameters: {
          type: 'object',
          properties: {
            foo: {
              type: 'object',
              properties: {
                bar: { type: 'string', enum: ['a', 'b', 'c'] },
                baz: { type: 'boolean' },
              },
            },
          },
        },
      },
    ],
    tokens: 64,
  },
  {
    messages: [
      { role: 'user', content: 'hello world' },
      { role: 'function', name: 'do_stuff', content: '{}' },
    ],
    tokens: 16,
  },
  {
    messages: [
      { role: 'user', content: 'hello world' },
      {
        role: 'function',
        name: 'do_stuff',
        content: '{"foo": "bar", "baz": 1.5}',
      },
    ],
    tokens: 29,
  },
  {
    messages: [
      {
        role: 'function',
        name: 'dance_the_tango',
        content: '{"a": { "b" : { "c": false}}}',
      },
    ],
    tokens: 25,
  },
  {
    messages: [
      {
        role: 'assistant',
        content: '',
        function_call: {
          name: 'do_stuff',
          arguments: '{"foo": "bar", "baz": 1.5}',
        },
      },
    ],
    tokens: 27,
  },
  {
    messages: [
      {
        role: 'assistant',
        content: '',
        function_call: {
          name: 'do_stuff',
          arguments: '{"foo":"bar", "baz":\n\n 1.5}',
        },
      },
    ],
    tokens: 26,
  },
  {
    messages: [
      { role: 'system', content: 'Hello' },
      { role: 'user', content: 'Hi there' },
    ],
    functions: [
      {
        name: 'do_stuff',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    tokens: 36,
  },
  {
    messages: [
      { role: 'system', content: 'Hello:' },
      { role: 'user', content: 'Hi there' },
    ],
    functions: [
      {
        name: 'do_stuff',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    tokens: 36,
  },
  {
    messages: [
      { role: 'system', content: 'Hello:' },
      { role: 'system', content: 'Hello' },
      { role: 'user', content: 'Hi there' },
    ],
    functions: [
      {
        name: 'do_stuff',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    tokens: 41,
  },
  {
    messages: [
      { role: 'system', content: 'Hello:' },
      { role: 'system', content: 'Hello' },
      { role: 'user', content: 'Hi there' },
    ],
    functions: [
      {
        name: 'do_stuff',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'do_other_stuff',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    tokens: 51,
  },
  {
    messages: [
      { role: 'system', content: 'Hello:' },
      { role: 'system', content: 'Hello' },
      { role: 'user', content: 'Hi there' },
    ],
    functions: [
      {
        name: 'do_stuff',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'do_other_stuff',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
    function_call: { name: 'do_stuff' },
    tokens: 58,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'get_recipe',
        parameters: {
          type: 'object',
          required: ['ingredients', 'instructions', 'time_to_cook'],
          properties: {
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'unit', 'amount'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  unit: {
                    enum: ['grams', 'ml', 'cups', 'pieces', 'teaspoons'],
                    type: 'string',
                  },
                  amount: {
                    type: 'number',
                  },
                },
              },
            },
            instructions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Steps to prepare the recipe (no numbering)',
            },
            time_to_cook: {
              type: 'number',
              description: 'Total time to prepare the recipe in minutes',
            },
          },
        },
      },
    ],
    tokens: 105,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'function',
        description: 'description',
        parameters: {
          type: 'object',
          properties: {
            quality: {
              type: 'object',
              properties: {
                pros: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Write 3 points why this text is well written',
                },
              },
            },
          },
        },
      },
    ],
    tokens: 45,
  },
  {
    messages: [{ role: 'user', content: 'hello' }],
    functions: [
      {
        name: 'function',
        description: 'desctiption1',
        parameters: {
          type: 'object',
          description: 'desctiption2',
          properties: {
            mainField: {
              type: 'string',
              description: 'description3',
            },
            'field number one': {
              type: 'object',
              description: 'description4',
              properties: {
                yesNoField: {
                  type: 'string',
                  description: 'description5',
                  enum: ['Yes', 'No'],
                },
                howIsInteresting: {
                  type: 'string',
                  description: 'description6',
                },
                scoreInteresting: {
                  type: 'number',
                  description: 'description7',
                },
                isInteresting: {
                  type: 'string',
                  description: 'description8',
                  enum: ['Yes', 'No'],
                },
              },
            },
          },
        },
      },
    ],
    tokens: 93,
  },
]
