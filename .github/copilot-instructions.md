# gpt-tokenizer Development Instructions

Always follow these instructions first and only use additional search or bash commands when the information here is incomplete or incorrect.

## Overview

gpt-tokenizer is a pure JavaScript implementation of a BPE tokenizer for GPT-2/3/4 and other OpenAI models. It's a TypeScript library that outputs dual ESM/CJS builds plus UMD builds for web usage. The library claims to be the fastest tokenizer implementation available on NPM.

## Prerequisites and Setup

- **Node.js**: Requires Node.js 20+
- **Package Manager**: Uses Yarn 4.9.2 (specified in packageManager field)
- **Build System**: TypeScript with @niieani/scaffold tooling configuration

## Working Effectively

### Bootstrap and Build
- `yarn install` -- takes ~12-70 seconds (varies by cache status). NEVER CANCEL. Set timeout to 120+ seconds.
- `yarn build` -- takes ~40 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
  - Builds three output formats: ESM (`esm/`), CommonJS (`cjs/`), and UMD (`dist/`)
  - UMD builds create large files (2MB+) for different encodings: cl100k_base.js, o200k_base.js, p50k_base.js, r50k_base.js, p50k_edit.js

### Testing
- `yarn test` -- takes ~21 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
  - Runs 905 tests including format, lint, type checking, and unit tests
  - Uses Vitest (not Jest) as the test framework
- `yarn test:code` -- runs only the unit tests (~5 seconds)

### Code Quality
- `yarn format` -- takes ~2 seconds. Prettier formatting.
- `yarn test:format` -- checks Prettier formatting
- `yarn test:lint` -- **KNOWN ISSUE**: has 12 existing lint errors in resolveEncoding.ts and resolveEncodingAsync.ts. These are not your responsibility to fix. The errors are: "Unsafe return of an `any` typed value" and "Unsafe return of type `Promise<any>`". The command will exit with code 1 due to these errors.
- `yarn test:types` -- TypeScript type checking

### Code Generation
- `yarn codegen` -- **DOES NOT WORK** on Node.js 20 due to requiring `--experimental-transform-types` flag
- Model files in `src/model/` are pre-generated and should not be manually edited
- BPE ranks in `src/bpeRanks/` are also pre-generated

## Key Project Structure

### Source Code (`src/`)
- `main.ts` -- Main entry point, exports default cl100k_base encoding
- `GptEncoding.ts` -- Core tokenizer implementation
- `BytePairEncodingCore.ts` -- Low-level BPE algorithm
- `encoding/` -- Encoding-specific exports (cl100k_base, o200k_base, etc.)
- `model/` -- Auto-generated model-specific exports (100+ files)
- `encodingParams/` -- Encoding parameter definitions
- `bpeRanks/` -- Pre-generated BPE ranking data

### Build Outputs
- `esm/` -- ES modules build for modern environments
- `cjs/` -- CommonJS build for Node.js compatibility
- `dist/` -- UMD builds for browser usage

### Testing and Validation
- `data/TestPlans.txt` -- Comprehensive test cases validating compatibility with OpenAI's tiktoken
- Test suite covers multiple languages and edge cases
- Performance benchmarks in `benchmark/` subdirectory

## Validation and Testing Scenarios

### Manual Functionality Testing
Always test core encoding/decoding after making changes:

```javascript
import { encode, decode } from './esm/main.js';
const text = 'Hello world, how are you?';
const tokens = encode(text);
console.log('Tokens:', tokens); // Should output: [13225, 2375, 11, 1495, 553, 481, 30]
const decoded = decode(tokens);
console.log('Match:', text === decoded); // Should be true
```

### Testing Model-Specific Imports
```javascript
import { encode as encodeGPT4 } from './esm/model/gpt-4o.js';
import { encode as encodeGPT3 } from './esm/model/gpt-3.5-turbo.js';
const text = 'Test encoding differences';
console.log('GPT-4o tokens:', encodeGPT4(text).length);
console.log('GPT-3.5 tokens:', encodeGPT3(text).length);
```

### Performance Testing
- Benchmark suite in `benchmark/` directory has its own package.json
- Run `cd benchmark && yarn install && yarn start` to compare performance against other tokenizers
- Initial benchmark run takes ~60 seconds, produces a results table showing the local version significantly outperforms alternatives
- Benchmarks show gpt-tokenizer (local) has ~7.5ms encoding vs 107ms+ for other libraries
- **Benchmark has interactive mode**: Press Enter to re-run local version, 'd' to re-run all, CTRL+C to exit

## Common Development Tasks

### Adding Support for New Models
- Model definitions are in `src/models.ts` and `src/models.gen.ts`
- **DO NOT** manually edit generated files in `src/model/`
- Use the appropriate encoding (cl100k_base, o200k_base, etc.) for new models

### Working with Encodings
- Five main encodings: r50k_base, p50k_base, p50k_edit, cl100k_base, o200k_base
- Import specific encodings: `import { encode } from 'gpt-tokenizer/model/gpt-4'`
- Default export uses cl100k_base encoding

### Testing Changes
- Always run `yarn test` before committing
- Test format: `yarn test:format`
- **IGNORE** lint errors in resolveEncoding files - these are existing issues
- Add tests in `*.test.ts` files following existing patterns

## Build and CI Information

### CI Pipeline (`.github/workflows/ci-cd.yml`)
- Tests on Node.js 20 and 22
- Runs `yarn install`, `yarn build`, and `yarn test`
- Publishes to NPM on pushes to main/master branches

### Git Hooks
- Husky pre-commit hooks for commit message linting
- Uses commitlint configuration from @niieani/scaffold

## Known Issues and Limitations

1. **Codegen requires newer Node.js**: `yarn codegen` fails on Node.js 20 due to missing `--experimental-transform-types` support
2. **Existing lint errors**: 12 lint errors in resolveEncoding files - DO NOT fix these unless specifically asked
3. **Large build outputs**: UMD builds are 2MB+ due to embedded BPE data
4. **TypeScript version warning**: ESLint shows TypeScript 5.8.3 compatibility warnings - these are non-blocking
5. **External playground URLs blocked**: The playground URLs (https://gpt-tokenizer.dev/ and CodeSandbox) may be blocked in sandboxed environments

## Integration Points

### Browser Usage
- UMD builds in `dist/` for direct browser inclusion
- ESM builds work with modern bundlers
- Library works in edge runtimes (validated with edge-runtime tests)

### Package Exports
- Main: `gpt-tokenizer` (default cl100k_base)
- Model-specific: `gpt-tokenizer/model/gpt-4o`
- Encoding-specific: `gpt-tokenizer/encoding/o200k_base`
- CJS fallback: `gpt-tokenizer/cjs/model/gpt-4o`

## Performance Notes

This library is optimized for speed and claims to be the fastest tokenizer on NPM. The benchmark results show superior performance compared to tiktoken, js-tiktoken, and other alternatives in:
- Encoding speed (~7μs average)
- Decoding speed (~0.6μs average)
- Initialization time (~44ms)
- Memory usage (~36MB)

Always validate performance impact when making changes by running the benchmark suite.