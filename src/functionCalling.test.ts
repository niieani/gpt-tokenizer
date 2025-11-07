// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, it } from 'vitest'
import { functionCallingTestCases } from './fixtures/functionCallingTestCases.js'
import encoding from './model/gpt-4o.js'

const { countChatCompletionTokens } = encoding

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
