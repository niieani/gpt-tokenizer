# GPT-3-Encoder

Token Byte Pair Encoder/Decoder for GPT-2 / GPT-3 for JavaScript applications.

## About

GPT-2 and GPT-3 use byte pair encoding to turn text into a series of integers to feed into the model.
This is a JavaScript implementation of OpenAI's original Python encoder/decoder which can be found [here](https://github.com/openai/gpt-2).

It's a fork of https://github.com/latitudegames/GPT-3-Encoder, improving on a number of things, such as the ability to decode an asynchronous stream of data.

## Install with npm

```
npm install fast-gpt-3-encoder
```

## Usage

Compatible with Node >= 12

```js
const { encode, decode } = require('fast-gpt-3-encoder')

const str = 'This is an example sentence to try encoding out on!'
const cache = new Map()
const encoded = encode(str, cache)
console.log('Encoded this string looks like: ', encoded)

console.log('We can look at each token and what it represents')
for (let token of encoded) {
  console.log({ token, string: decode([token]) })
}

const decoded = decode(encoded)
console.log('We can decode it back into:\n', decoded)
```
