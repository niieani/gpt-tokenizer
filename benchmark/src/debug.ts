const { default: tokenizer } = await import('../../esm/encoding/cl100k_base.js')

const encoded = tokenizer.encode('🌸łopa')

console.log(encoded)
