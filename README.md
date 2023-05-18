# gpt-tokenizer

[![Play with gpt-tokenizer](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/gpt-tokenizer-tjcjoz?fontsize=14&hidenavigation=1&theme=dark)

`gpt-tokenizer` is a highly optimized Token Byte Pair Encoder/Decoder for all OpenAI's models (including those used by GPT-2, GPT-3, GPT-3.5 and GPT-4), written in TypeScript. OpenAI's GPT models utilize byte pair encoding to transform text into a sequence of integers before feeding them into the model.

This package started off as a fork of [latitudegames/GPT-3-Encoder](https://github.com/latitudegames/GPT-3-Encoder), but then in version 2.0 was rewritten from scratch by porting @dmitry-brazhenko's [SharpToken](https://github.com/dmitry-brazhenko/SharpToken), and adding additional features.

As of 2023, it is the most feature-complete, open-source GPT tokenizer on NPM. It implements some unique features, such as:

- Support for all current OpenAI models (available encodings: `r50k_base`, `p50k_base`, `p50k_edit` and `cl100k_base`)
- Generator function versions of both the decoder and encoder
- Provides the ability to decode an asynchronous stream of data (using `decodeAsyncGenerator` and `decodeGenerator` with any iterable input)
- No global cache (no accidental memory leaks, as with the original GPT-3-Encoder implementation)
- Includes a highly performant `isWithinTokenLimit` function to assess token limit without encoding the entire text
- Improves overall performance by eliminating transitive arrays
- Adds type-checking
- Works in the browser out-of-the-box

## Installation

As NPM package:

```bash
npm install gpt-tokenizer
```

As an UMD module:

```html
<script src="https://unpkg.com/gpt-tokenizer" />
```

## Playground

You can play with the package in the browser using the [Playground](https://codesandbox.io/s/gpt-tokenizer-tjcjoz?fontsize=14&hidenavigation=1&theme=dark).

[![GPT Tokenizer Playground](./docs/gpt-tokenizer.png)](https://codesandbox.io/s/gpt-tokenizer-tjcjoz?fontsize=14&hidenavigation=1&theme=dark)

The playground mimics the official [OpenAI Tokenizer](https://platform.openai.com/tokenizer).

## Usage

```typescript
import {
  encode,
  decode,
  isWithinTokenLimit,
  encodeGenerator,
  decodeGenerator,
  decodeAsyncGenerator,
} from 'gpt-tokenizer'

const text = 'Hello, world!'
const tokenLimit = 10

// Encode text into tokens
const tokens = encode(text)

// Decode tokens back into text
const decodedText = decode(tokens)

// Check if text is within the token limit
// returns false if the limit is exceeded, otherwise returns the actual number of tokens (truthy value)
const withinTokenLimit = isWithinTokenLimit(text, tokenLimit)

// Encode text using generator
for (const tokenChunk of encodeGenerator(text)) {
  console.log(tokenChunk)
}

// Decode tokens using generator
for (const textChunk of decodeGenerator(tokens)) {
  console.log(textChunk)
}

// Decode tokens using async generator
// (assuming `asyncTokens` is an AsyncIterableIterator<number>)
for await (const textChunk of decodeAsyncGenerator(asyncTokens)) {
  console.log(textChunk)
}
```

By default, importing from `'gpt-tokenizer'` uses `cl100k_base` encoding, used by GPT-3.5 and GPT-4.

To get a tokenizer for a different model, import it directly, for example:

```ts
import {
  encode,
  decode,
  isWithinTokenLimit,
} from 'gpt-tokenizer/model/text-davinci-003'
```

Supported models and their encodings:

chat:

- gpt-4 (cl100k_base)
- gpt-3.5-turbo (cl100k_base)

text:

- text-davinci-003 (p50k_base)
- text-davinci-002 (p50k_base)
- text-davinci-001 (r50k_base)
- text-curie-001 (r50k_base)
- text-babbage-001 (r50k_base)
- text-ada-001 (r50k_base)
- davinci (r50k_base)
- curie (r50k_base)
- babbage (r50k_base)
- ada (r50k_base)

code:

- code-davinci-002 (p50k_base)
- code-davinci-001 (p50k_base)
- code-cushman-002 (p50k_base)
- code-cushman-001 (p50k_base)
- davinci-codex (p50k_base)
- cushman-codex (p50k_base)

edit:

- text-davinci-edit-001 (p50k_edit)
- code-davinci-edit-001 (p50k_edit)

embeddings:

- text-embedding-ada-002 (cl100k_base)

old embeddings:

- text-similarity-davinci-001 (r50k_base)
- text-similarity-curie-001 (r50k_base)
- text-similarity-babbage-001 (r50k_base)
- text-similarity-ada-001 (r50k_base)
- text-search-davinci-doc-001 (r50k_base)
- text-search-curie-doc-001 (r50k_base)
- text-search-babbage-doc-001 (r50k_base)
- text-search-ada-doc-001 (r50k_base)
- code-search-babbage-code-001 (r50k_base)
- code-search-ada-code-001 (r50k_base)

## API

### `encode(text: string): number[]`

Encodes the given text into a sequence of tokens. Use this method when you need to transform a piece of text into the token format that GPT-2 or GPT-3 models can process.

Example:

```typescript
import { encode } from 'gpt-tokenizer'

const text = 'Hello, world!'
const tokens = encode(text)
```

### `decode(tokens: number[]): string`

Decodes a sequence of tokens back into text. Use this method when you want to convert the output tokens from GPT-2 or GPT-3 models back into human-readable text.

Example:

```typescript
import { decode } from 'gpt-tokenizer'

const tokens = [18435, 198, 23132, 328]
const text = decode(tokens)
```

### `isWithinTokenLimit(text: string, tokenLimit: number): false | number`

Checks if the text is within the token limit. Returns `false` if the limit is exceeded, otherwise returns the number of tokens. Use this method to quickly check if a given text is within the token limit imposed by GPT-2 or GPT-3 models, without encoding the entire text.

Example:

```typescript
import { isWithinTokenLimit } from 'gpt-tokenizer'

const text = 'Hello, world!'
const tokenLimit = 10
const withinTokenLimit = isWithinTokenLimit(text, tokenLimit)
```

### `encodeGenerator(text: string): Generator<number[], void, undefined>`

Encodes the given text using a generator, yielding chunks of tokens.
Use this method when you want to encode text in chunks, which can be useful for processing large texts or streaming data.

Example:

```typescript
import { encodeGenerator } from 'gpt-tokenizer'

const text = 'Hello, world!'
const tokens = []
for (const tokenChunk of encodeGenerator(text)) {
  tokens.push(...tokenChunk)
}
```

### `decodeGenerator(tokens: Iterable<number>): Generator<string, void, undefined>`

Decodes a sequence of tokens using a generator, yielding chunks of decoded text.
Use this method when you want to decode tokens in chunks, which can be useful for processing large outputs or streaming data.

Example:

```typescript
import { decodeGenerator } from 'gpt-tokenizer'

const tokens = [18435, 198, 23132, 328]
let decodedText = ''
for (const textChunk of decodeGenerator(tokens)) {
  decodedText += textChunk
}
```

### `decodeAsyncGenerator(tokens: AsyncIterable<number>): AsyncGenerator<string, void, undefined>`

Decodes a sequence of tokens asynchronously using a generator, yielding chunks of decoded text. Use this method when you want to decode tokens in chunks asynchronously, which can be useful for processing large outputs or streaming data in an asynchronous context.

Example:

```javascript
import { decodeAsyncGenerator } from 'gpt-tokenizer'

async function processTokens(asyncTokensIterator) {
  let decodedText = ''
  for await (const textChunk of decodeAsyncGenerator(asyncTokensIterator)) {
    decodedText += textChunk
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please open a pull request or an issue to discuss your ideas, bug reports, or any other inquiries.
