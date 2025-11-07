export type HarmonyTerminator = '<|end|>' | '<|return|>' | '<|call|>'

export interface ChatMessageFunctionCall {
  name?: string
  arguments?: string
}

export interface ChatMessage {
  role?: 'system' | 'user' | 'assistant' | 'developer' | (string & {})
  name?: string
  content: string
  function_call?: ChatMessageFunctionCall
  /** Harmony-only: channel label such as `analysis`, `commentary`, or `final`. */
  channel?: string
  /** Harmony-only: recipient metadata, e.g. `functions.get_weather` or `assistant`. */
  recipient?: string
  /** Controls where the recipient metadata is rendered in Harmony headers. Defaults to `channel`. */
  recipientPlacement?: 'role' | 'channel'
  /** Harmony-only: constraint label, e.g. `json`. */
  constraint?: string
  /** Harmony-only: overrides the closing token, defaults to `<|end|>`. */
  terminator?: HarmonyTerminator
}

export interface EncodeChatOptions {
  primeWithAssistantResponse?: string
}

export type ChatCompletionFunctionType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'null'
  | 'array'
  | 'object'

export interface ChatCompletionStringProperty {
  type: Extract<ChatCompletionFunctionType, 'string'>
  description?: string
  enum?: string[]
}

export interface ChatCompletionNumberProperty {
  type: Extract<ChatCompletionFunctionType, 'integer' | 'number'>
  description?: string
  minimum?: number
  maximum?: number
  enum?: (number | string)[]
}

export interface ChatCompletionBooleanProperty {
  type: Extract<ChatCompletionFunctionType, 'boolean'>
  description?: string
}

export interface ChatCompletionNullProperty {
  type: Extract<ChatCompletionFunctionType, 'null'>
  description?: string
}

export interface ChatCompletionArrayProperty {
  type: Extract<ChatCompletionFunctionType, 'array'>
  description?: string
  items?: ChatCompletionFunctionProperty
}

export interface ChatCompletionObjectProperty {
  type: Extract<ChatCompletionFunctionType, 'object'>
  description?: string
  required?: string[]
  properties?: Record<string, ChatCompletionFunctionProperty>
}

export type ChatCompletionFunctionProperty =
  | ChatCompletionStringProperty
  | ChatCompletionNumberProperty
  | ChatCompletionBooleanProperty
  | ChatCompletionNullProperty
  | ChatCompletionArrayProperty
  | ChatCompletionObjectProperty

export interface ChatCompletionFunctionParameters
  extends ChatCompletionObjectProperty {}

export interface ChatCompletionFunctionDefinition {
  name: string
  description?: string
  parameters?: ChatCompletionFunctionParameters
}

export type ChatCompletionFunctionCallOption =
  | 'auto'
  | 'none'
  | {
      name: string
    }

export interface ChatCompletionRequest {
  messages: readonly ChatMessage[]
  functions?: readonly ChatCompletionFunctionDefinition[]
  function_call?: ChatCompletionFunctionCallOption
}

export type CountStringTokens = (text: string) => number

export const MESSAGE_TOKEN_OVERHEAD = 3
export const MESSAGE_NAME_TOKEN_OVERHEAD = 1
export const FUNCTION_ROLE_TOKEN_DISCOUNT = 2
export const FUNCTION_CALL_METADATA_TOKEN_OVERHEAD = 3
export const FUNCTION_DEFINITION_TOKEN_OVERHEAD = 9
export const COMPLETION_REQUEST_TOKEN_OVERHEAD = 3
export const FUNCTION_CALL_NAME_TOKEN_OVERHEAD = 4
export const FUNCTION_CALL_NONE_TOKEN_OVERHEAD = 1
export const SYSTEM_FUNCTION_TOKEN_DEDUCTION = 4

const NEWLINE = '\n'

export function countMessageTokens(
  message: ChatMessage,
  countStringTokens: CountStringTokens,
): number {
  let tokens = 0

  if (message.role) {
    tokens += countStringTokens(message.role)
  }

  if (message.content) {
    tokens += countStringTokens(message.content)
  }

  if (message.name) {
    tokens += countStringTokens(message.name) + MESSAGE_NAME_TOKEN_OVERHEAD
  }

  if (message.function_call) {
    const { name, arguments: args } = message.function_call
    if (name) {
      tokens += countStringTokens(name)
    }
    if (args) {
      tokens += countStringTokens(args)
    }
    tokens += FUNCTION_CALL_METADATA_TOKEN_OVERHEAD
  }

  tokens += MESSAGE_TOKEN_OVERHEAD

  if (message.role === 'function') {
    tokens -= FUNCTION_ROLE_TOKEN_DISCOUNT
  }

  return tokens
}

export function formatObjectProperties(
  obj: ChatCompletionObjectProperty,
  indent: number,
  formatType: (param: ChatCompletionFunctionProperty, indent: number) => string,
): string {
  if (!obj.properties) {
    return ''
  }

  const lines: string[] = []
  const requiredParams = new Set(obj.required ?? [])
  const indentString = ' '.repeat(indent)

  for (const [name, param] of Object.entries(obj.properties)) {
    if (param.description && indent < 2) {
      lines.push(`${indentString}// ${param.description}`)
    }

    const isRequired = requiredParams.has(name)
    const formattedType = formatType(param, indent)
    lines.push(
      `${indentString}${name}${isRequired ? '' : '?'}: ${formattedType},`,
    )
  }

  return lines.join('\n')
}

export function formatFunctionType(
  param: ChatCompletionFunctionProperty,
  indent: number,
): string {
  switch (param.type) {
    case 'string':
      return (
        param.enum?.map((value) => JSON.stringify(value)).join(' | ') ??
        'string'
      )
    case 'integer':
    case 'number':
      return param.enum?.map((value) => `${value}`).join(' | ') ?? 'number'
    case 'boolean':
      return 'boolean'
    case 'null':
      return 'null'
    case 'array':
      return param.items
        ? `${formatFunctionType(param.items, indent)}[]`
        : 'any[]'
    case 'object': {
      const inner = formatObjectProperties(
        param,
        indent + 2,
        formatFunctionType,
      )
      const closingIndent = ' '.repeat(indent)
      return `{
${inner}
${closingIndent}}`
    }
    default:
      return 'any'
  }
}

export function formatFunctionDefinitions(
  functions: readonly ChatCompletionFunctionDefinition[],
): string {
  const lines = ['namespace functions {', '']

  for (const fn of functions) {
    if (fn.description) {
      lines.push(`// ${fn.description}`)
    }

    const { parameters } = fn
    const properties = parameters?.properties

    if (!parameters || !properties || Object.keys(properties).length === 0) {
      lines.push(`type ${fn.name} = () => any;`)
    } else {
      lines.push(`type ${fn.name} = (_: {`)
      const formattedProperties = formatObjectProperties(
        parameters,
        0,
        formatFunctionType,
      )
      if (formattedProperties.length > 0) {
        lines.push(formattedProperties)
      }
      lines.push('}) => any;')
    }

    lines.push('')
  }

  lines.push('} // namespace functions')
  return lines.join('\n')
}

export function estimateTokensInFunctions(
  functions: readonly ChatCompletionFunctionDefinition[],
  countStringTokens: CountStringTokens,
): number {
  const formatted = formatFunctionDefinitions(functions)
  let tokens = countStringTokens(formatted)
  tokens += FUNCTION_DEFINITION_TOKEN_OVERHEAD
  return tokens
}

export function padSystemMessage(
  message: ChatMessage,
  hasFunctions: boolean,
  isSystemPadded: boolean,
): ChatMessage {
  if (!hasFunctions || isSystemPadded || message.role !== 'system') {
    return message
  }

  if (!message.content || message.content.endsWith(NEWLINE)) {
    return message
  }

  return {
    ...message,
    content: `${message.content}${NEWLINE}`,
  }
}

export function computeChatCompletionTokenCount(
  request: ChatCompletionRequest,
  countStringTokens: CountStringTokens,
): number {
  const { messages, functions, function_call: functionCall } = request
  const hasFunctions = Boolean(functions && functions.length > 0)

  let paddedSystem = false
  let total = 0

  for (const message of messages) {
    const messageToCount = padSystemMessage(message, hasFunctions, paddedSystem)

    if (messageToCount !== message && message.role === 'system') {
      paddedSystem = true
    } else if (message.role === 'system' && hasFunctions && !paddedSystem) {
      paddedSystem = true
    }

    total += countMessageTokens(messageToCount, countStringTokens)
  }

  total += COMPLETION_REQUEST_TOKEN_OVERHEAD

  if (hasFunctions && functions) {
    total += estimateTokensInFunctions(functions, countStringTokens)

    if (messages.some((message) => message.role === 'system')) {
      total -= SYSTEM_FUNCTION_TOKEN_DEDUCTION
    }
  }

  if (functionCall && functionCall !== 'auto') {
    if (functionCall === 'none') {
      total += FUNCTION_CALL_NONE_TOKEN_OVERHEAD
    } else if (typeof functionCall === 'object' && functionCall.name) {
      total +=
        countStringTokens(functionCall.name) + FUNCTION_CALL_NAME_TOKEN_OVERHEAD
    }
  }

  return total
}
