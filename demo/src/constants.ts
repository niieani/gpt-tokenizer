import type { ChatMessageWithId } from './types'

export const DEFAULT_MODEL = 'gpt-5'

export const DEFAULT_PROMPT = `gpt-tokenizer is the fastest TypeScript implementation of OpenAI's tokenizers.
It supports GPT-5, GPT-4.1, o-series models, streaming encoding, chat prompts, cost estimation and much more.`

export const DEFAULT_CHAT: ChatMessageWithId[] = [
  {
    id: 'msg-1',
    role: 'system',
    content: 'You are an enthusiastic educator that loves to visualise how tokenization works.',
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Explain how gpt-tokenizer estimates token costs for GPT-5 in two concise bullet points.',
  },
]
