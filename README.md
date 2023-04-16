# gpt-tokenizer

[![Play with gpt-tokenizer](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/gpt-tokenizer-tjcjoz?fontsize=14&hidenavigation=1&theme=dark)

`gpt-tokenizer` is a highly optimized Token Byte Pair Encoder/Decoder for GPT-2, GPT-3, GPT-3.5 and GPT-4 designed for JavaScript applications. OpenAI's GPT models utilize byte pair encoding to transform text into a sequence of integers before feeding them into the model. This package is a JavaScript implementation of OpenAI's original Python encoder/decoder, which can be found [here](https://github.com/openai/gpt-2).

This package is a fork of [latitudegames/GPT-3-Encoder](https://github.com/latitudegames/GPT-3-Encoder), improving on various aspects, such as:

- Adding generator versions of both decoder and encoder
- Providing the ability to decode an asynchronous stream of data (using `decodeAsyncGenerator` and `decodeGenerator` with any iterable input)
- Removing the global cache to prevent memory leaks
- Adding a highly performant `isWithinTokenLimit` function to assess token limit without encoding the entire text
- Improving overall performance by eliminating transitive arrays
- Including precomputed `bpeRanks`
- Adding type-checking
- Fixing minor bugs (thanks to TypeScript)
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

## Caching Between Runs of Encode-related Functions

You may want to encode multiple pieces of text with similar content or structure. In such cases, using a single cache between runs of encode-related functions can help improve performance. By sharing the cache, you can reuse the results of previously calculated byte pair encodings, thereby reducing redundant computations.

However, it's important to be aware of potential memory consumption issues when using a shared cache when encoding lots of higher range unicode characters (non-latin/complex alphabets, emojis), potentially leading to performance degradation or even crashes due to excessive memory usage.

In such a case, it is recommended to use a custom `Map` implementation that uses a LRU cache to limit the size of the cache.

Here's an example of how to use a shared cache between runs of the `encode` function:

```typescript
import { encode } from 'gpt-tokenizer'

const cache = new Map()

const text1 = 'Hello, world!'
const text2 = 'Hello, everyone!'

const tokens1 = encode(text1, cache)
const tokens2 = encode(text2, cache)
```

## API

### `encode(text: string, cache?: Map<string, string>): number[]`

Encodes the given text into a sequence of tokens. Use this method when you need to transform a piece of text into the token format that GPT-2 or GPT-3 models can process. You can provide an optional cache to store and reuse byte pair encoding results between multiple calls.

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

### `isWithinTokenLimit(text: string, tokenLimit: number, cache?: Map<string, string>): false | number`

Checks if the text is within the token limit. Returns `false` if the limit is exceeded, otherwise returns the number of tokens. Use this method to quickly check if a given text is within the token limit imposed by GPT-2 or GPT-3 models, without encoding the entire text.

Example:

```typescript
import { isWithinTokenLimit } from 'gpt-tokenizer'

const text = 'Hello, world!'
const tokenLimit = 10
const withinTokenLimit = isWithinTokenLimit(text, tokenLimit)
```

### `encodeGenerator(text: string, cache?: Map<string, string>): Generator<number[], void, undefined>`

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
