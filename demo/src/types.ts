export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessage = {
  role?: ChatRole
  name?: string
  content: string
}

export type ChatMessageWithId = ChatMessage & { id: string }

export type TokenSegment = {
  token: number
  text: string
  start: number
  end: number
}
