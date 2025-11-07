// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, it } from 'vitest'

import encoding from './model/gpt-4o.js'
import { functionCallingTestCases } from './fixtures/functionCallingTestCases.js'

const countChatCompletionTokens = encoding.countChatCompletionTokens

if (!countChatCompletionTokens) {
  throw new Error('Function calling token counting is not available for gpt-4o')
}

describe('countChatCompletionTokens', () => {
  it('matches known token counts', () => {
    functionCallingTestCases.forEach((testCase) => {
      const { tokens, ...request } = testCase
      expect(countChatCompletionTokens(request)).toBe(tokens)
    })
  })
})
