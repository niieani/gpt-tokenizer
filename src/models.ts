import type { EncodingName } from './mapping.js'

// this data is compiled from:
// - https://platform.openai.com/docs/models/
// - https://platform.openai.com/docs/deprecations/
// - https://openai.com/api/pricing/

export interface CostEstimate {
  input?: number
  output?: number
  /** batch API input cost */
  batchInput?: number
  /** batch API output cost */
  batchOutput?: number
  /** cached input cost */
  cachedInput?: number
  /** training cost per million tokens */
  training?: number
}

export interface Model {
  humanName: string
  encoding: EncodingName
  description: string
  /** YYYY-MM-DD for when the model is shut down */
  shutdownDate?: string
  recommendedReplacement?: string
  /** how many tokens fit in the context window? */
  context?: number
  /** how many tokens can be in the generated output? */
  maxOutput?: number
  /** how many tokens can be in the input */
  maxInput?: number
  /** in YYYY-MM, e.g. 2023-10 for "up to Oct 2023" */
  trainingData?: string
  /** cost per million tokens in USD */
  cost?: CostEstimate
}

const gpt4oAugust2024: Model = {
  humanName: 'GPT-4o (Aug 2024)',
  description:
    'Our high-intelligence flagship model for complex, multi-step tasks. GPT-4o is cheaper and faster than GPT-4 Turbo. Currently points to gpt-4o-2024-08-06.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: {
    input: 2.5,
    output: 10,
    batchInput: 1.25,
    batchOutput: 5,
    cachedInput: 1.25,
  },
}

const gpt4oNovember2024: Model = {
  humanName: 'GPT-4o (Nov 2024)',
  description:
    'November 2024 snapshot of the GPT-4o model with enhanced capabilities.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: {
    input: 2.5,
    output: 10,
    batchInput: 1.25,
    batchOutput: 5,
    cachedInput: 1.25,
  },
}

const gpt4oMay2024: Model = {
  humanName: 'GPT-4o',
  description:
    'Original gpt-4o snapshot from May 13, 2024, offering advanced multimodal capabilities.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-10',
  cost: { input: 5, output: 15, batchInput: 2.5, batchOutput: 7.5 },
}

const gpt4oMiniJuly2024: Model = {
  humanName: 'GPT-4o Mini',
  description:
    'Our affordable and intelligent small model for fast, lightweight tasks. GPT-4o mini is cheaper and more capable than GPT-3.5 Turbo. Currently points to gpt-4o-mini-2024-07-18.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: {
    input: 0.15,
    output: 0.6,
    batchInput: 0.075,
    batchOutput: 0.3,
    cachedInput: 0.075,
  },
}

const o1December2024: Model = {
  humanName: 'OpenAI o1',
  description:
    'Our most intelligent model, optimal for complex tasks requiring deep understanding and expertise. Currently points to o1-2024-12-17.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 32_768,
  trainingData: '2023-10',
  cost: {
    input: 15,
    output: 60,
    batchInput: 7.5,
    batchOutput: 30,
    cachedInput: 7.5,
  },
}

const o1PreviewSeptember2024: Model = {
  humanName: 'OpenAI o1-preview',
  description: 'Preview version of the o1 model: o1-preview-2024-09-12.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 32_768,
  trainingData: '2023-10',
  cost: {
    input: 15,
    output: 60,
    batchInput: 7.5,
    batchOutput: 30,
    cachedInput: 7.5,
  },
}

const o1MiniSeptember2024: Model = {
  humanName: 'OpenAI o1-mini',
  description:
    'Points to the most recent o1-mini snapshot: o1-mini-2024-09-12.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 65_536,
  trainingData: '2023-10',
  cost: {
    input: 1.1,
    output: 4.4,
    batchInput: 0.55,
    batchOutput: 2.2,
    cachedInput: 0.55,
  },
}

const o3MiniModel: Model = {
  humanName: 'OpenAI o3-mini',
  description:
    "Small cost-efficient reasoning model that's optimized for coding, math, and science, and supports tools and Structured Outputs.",
  encoding: 'o200k_base',
  context: 200_000,
  maxOutput: 65_536,
  trainingData: '2023-10',
  cost: {
    input: 1.1,
    output: 4.4,
    batchInput: 0.55,
    batchOutput: 2.2,
    cachedInput: 0.55,
  },
}

const textEmbedding3Small: Model = {
  humanName: 'Text Embedding 3 Small',
  description: 'Embedding model for small-scale applications.',
  encoding: 'cl100k_base',
  maxInput: 8_191,
  cost: { input: 0.02, batchInput: 0.01 },
}

const textEmbedding3Large: Model = {
  humanName: 'Text Embedding 3 Large',
  description: 'Embedding model for large-scale applications.',
  encoding: 'cl100k_base',
  maxInput: 8_191,
  cost: { input: 0.13, batchInput: 0.065 },
}

const textEmbeddingAdaV2: Model = {
  humanName: 'Ada v2',
  description:
    'A versatile model suitable for text embeddings and lightweight NLP tasks.',
  encoding: 'cl100k_base',
  maxInput: 8_191,
  cost: { input: 0.1, output: 0, batchInput: 0.05, batchOutput: 0 },
}

// realtime audio
const gpt4oRealtimePreview: Model = {
  humanName: 'GPT-4o Realtime Preview',
  encoding: 'o200k_base',
  description: 'Preview release for the Realtime API.',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-10',
  cost: {
    input: 5,
    output: 20,
    cachedInput: 2.5,
  },
}

const gpt4oRealtimePreview20241001: Model = {
  humanName: 'GPT-4o Realtime Preview (Oct 2024)',
  encoding: 'o200k_base',
  description: 'Current snapshot for the Realtime API model.',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-10',
  cost: {
    input: 5,
    output: 20,
    cachedInput: 2.5,
  },
}

const gpt4oRealtimePreviewDecember2024: Model = {
  humanName: 'GPT-4o Realtime Preview (Dec 2024)',
  encoding: 'o200k_base',
  description: 'December 2024 snapshot for the Realtime API model.',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-10',
  cost: {
    input: 5,
    output: 20,
    cachedInput: 2.5,
  },
}

const gpt4oMiniRealtimePreviewDecember2024: Model = {
  humanName: 'GPT-4o Mini Realtime Preview (Dec 2024)',
  encoding: 'o200k_base',
  description: 'Mini version for the Realtime API with December 2024 snapshot.',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-10',
  cost: {
    input: 0.6,
    output: 2.4,
    cachedInput: 0.3,
  },
}

const gpt4oAudioPreview: Model = {
  humanName: 'GPT-4o Audio Preview',
  encoding: 'o200k_base',
  description: 'Preview release for audio inputs in chat completions.',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: {
    input: 2.5,
    output: 10,
  },
}

const gpt4oAudioPreview20241001: Model = {
  humanName: 'GPT-4o Audio Preview (Oct 2024)',
  encoding: 'o200k_base',
  description: 'Current snapshot for the Audio API model.',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: {
    input: 2.5,
    output: 10,
  },
}

const gpt4oAudioPreviewDecember2024: Model = {
  humanName: 'GPT-4o Audio Preview (Dec 2024)',
  encoding: 'o200k_base',
  description: 'December 2024 snapshot for the Audio API model.',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: {
    input: 2.5,
    output: 10,
  },
}

const gpt4oMiniAudioPreviewDecember2024: Model = {
  humanName: 'GPT-4o Mini Audio Preview (Dec 2024)',
  encoding: 'o200k_base',
  description: 'Mini version for the Audio API with December 2024 snapshot.',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: {
    input: 0.15,
    output: 0.6,
  },
}

// finetuning and training
const gpt4oFinetuning: Model = {
  humanName: 'GPT-4o 2024-08-06 Finetuning',
  description: 'GPT-4o finetuned for custom tasks.',
  encoding: 'o200k_base',
  cost: {
    input: 3.75,
    output: 15,
    batchInput: 1.875,
    batchOutput: 7.5,
    cachedInput: 1.875,
    training: 25,
  },
}

const gpt4oMiniFinetuning: Model = {
  humanName: 'GPT-4o Mini 2024-07-18 Finetuning',
  description: 'GPT-4o mini finetuned for custom tasks.',
  encoding: 'o200k_base',
  cost: {
    input: 0.3,
    output: 1.2,
    batchInput: 0.15,
    batchOutput: 0.6,
    cachedInput: 0.15,
    training: 3,
  },
}

const gpt35TurboFinetune: Model = {
  humanName: 'GPT-3.5 Turbo Finetuning',
  description: 'Finetuning GPT-3.5 Turbo with custom data.',
  encoding: 'cl100k_base',
  cost: {
    input: 3,
    output: 6,
    batchInput: 1.5,
    batchOutput: 3,
    training: 8,
  },
}

const gpt4oMiniTrainingJuly2024: Model = {
  humanName: 'GPT-4o Mini Training',
  description: 'Training GPT-4o Mini with custom datasets.',
  encoding: 'o200k_base',
  cost: { input: 3, output: 0, batchInput: 1.5, batchOutput: 0 },
}

const gpt35Turbo16k: Model = {
  humanName: 'GPT-3.5 Turbo 16k',
  description: 'GPT-3.5 model with 16k token context.',
  encoding: 'cl100k_base',
  cost: { input: 3, output: 4, batchInput: 1.5, batchOutput: 2 },
}

const gpt4TurboApril2024: Model = {
  humanName: 'GPT-4 Turbo 2024-04-09',
  description:
    'The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling. Currently points to gpt-4-turbo-2024-04-09.',
  encoding: 'cl100k_base',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-12',
  cost: { input: 10, output: 30, batchInput: 5, batchOutput: 15 },
}

const chatgpt4oLatest: Model = {
  humanName: 'ChatGPT 4o Latest',
  description:
    'The chatgpt-4o-latest model version continuously points to the version of GPT-4o used in ChatGPT, and is updated frequently when there are significant changes.',
  encoding: 'o200k_base',
  context: 128_000,
  maxOutput: 16_384,
  trainingData: '2023-10',
  cost: { input: 5, output: 15 },
}

const gpt40613: Model = {
  humanName: 'GPT-4',
  description: 'Currently points to gpt-4-0613. See continuous model upgrades.',
  encoding: 'cl100k_base',
  context: 8_192,
  maxOutput: 8_192,
  trainingData: '2021-09',
  cost: { input: 30, output: 60, batchInput: 15, batchOutput: 30 },
}

const gpt40125Preview: Model = {
  humanName: 'GPT-4 0125 Preview',
  description:
    'GPT-4 Turbo preview model intended to reduce cases of “laziness” where the model doesn’t complete a task.',
  encoding: 'cl100k_base',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-12',
  cost: { input: 10, output: 30, batchInput: 5, batchOutput: 15 },
}

const gpt41106Preview: Model = {
  ...gpt40125Preview,
  humanName: 'GPT-4 1106 Preview',
}

const gpt35Turbo0125: Model = {
  humanName: 'GPT-3.5 Turbo 0125',
  description:
    'The latest GPT-3.5 Turbo model with higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls.',
  encoding: 'cl100k_base',
  context: 16_385,
  maxOutput: 4_096,
  trainingData: '2021-09',
  cost: { input: 0.5, output: 1.5, batchInput: 0.25, batchOutput: 0.75 },
}

const gpt35TurboInstruct: Model = {
  humanName: 'GPT-3.5 Turbo Instruct',
  description:
    'Similar capabilities as GPT-3 era models. Compatible with legacy Completions endpoint and not Chat Completions.',
  encoding: 'cl100k_base',
  context: 4_096,
  maxOutput: 4_096,
  trainingData: '2021-09',
  cost: { input: 1.5, output: 2 },
}

const gpt35Turbo1106: Model = {
  humanName: 'GPT-3.5 Turbo 1106',
  description:
    'GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more.',
  encoding: 'cl100k_base',
  context: 16_385,
  maxOutput: 4_096,
  trainingData: '2021-09',
  cost: { input: 1, output: 2, batchInput: 0.5, batchOutput: 1 },
}

const davinci002: Model = {
  humanName: 'Davinci 002',
  description: 'Replacement for the GPT-3 curie and davinci base models.',
  encoding: 'p50k_base',
  context: 16_384,
  maxOutput: 16_384,
  trainingData: '2021-09',
  cost: { input: 2, output: 2, batchInput: 1, batchOutput: 1 },
}

const davinci002Finetune: Model = {
  humanName: 'Davinci-002 Finetuning',
  description: 'Davinci-002 finetuned for custom tasks.',
  encoding: 'p50k_base',
  cost: {
    input: 12,
    output: 12,
    batchInput: 6,
    batchOutput: 6,
    training: 6,
  },
}

const babbage002: Model = {
  humanName: 'Babbage 002',
  description: 'Replacement for the GPT-3 ada and babbage base models.',
  encoding: 'p50k_base',
  context: 16_384,
  trainingData: '2021-09',
  cost: { input: 0.4, output: 0.4, batchInput: 0.2, batchOutput: 0.2 },
}

const babbage002Finetune: Model = {
  humanName: 'Babbage-002 Finetuning',
  description: 'Babbage-002 finetuned for custom tasks.',
  encoding: 'p50k_base',
  cost: {
    input: 1.6,
    output: 1.6,
    batchInput: 0.8,
    batchOutput: 0.8,
    training: 0.4,
  },
}

// deprecated models:
const gpt432k0613: Model = {
  humanName: 'GPT-4 32k',
  encoding: 'cl100k_base',
  description:
    'Snapshot of gpt-4 from June 13th 2023 with improved function calling support.',
  shutdownDate: '2025-06-06',
  recommendedReplacement: 'gpt-4o',
  context: 32_768,
  maxOutput: 16_384,
  trainingData: '2021-09',
  cost: { input: 60, output: 120, batchInput: 30, batchOutput: 60 },
}

const gpt4VisionPreview: Model = {
  humanName: 'GPT-4 Vision Preview',
  encoding: 'cl100k_base',
  description: 'Vision capabilities preview of GPT-4.',
  shutdownDate: '2024-12-06',
  recommendedReplacement: 'gpt-4o',
  context: 128_000,
  maxOutput: 4_096,
  trainingData: '2023-12',
  cost: { input: 10, output: 30, batchInput: 5, batchOutput: 15 },
}

const gpt41106VisionPreview = gpt4VisionPreview

const gpt35Turbo0613: Model = {
  humanName: 'GPT-3.5 Turbo 0613',
  encoding: 'cl100k_base',
  description: 'Version of GPT-3.5 Turbo from June 2013.',
  shutdownDate: '2024-09-13',
  recommendedReplacement: 'gpt-3.5-turbo',
  context: 16_385,
  maxOutput: 4_096,
  trainingData: '2021-09',
  cost: { input: 1.5, output: 2, batchInput: 0.75, batchOutput: 1 },
}

const gpt35Turbo16k0613: Model = {
  humanName: 'GPT-3.5 Turbo 16k 0613',
  encoding: 'cl100k_base',
  description: '16k context version from June 2013.',
  shutdownDate: '2024-09-13',
  recommendedReplacement: 'gpt-3.5-turbo',
  context: 16_385,
  maxOutput: 4_096,
  trainingData: '2021-09',
  cost: { input: 3, output: 4, batchInput: 1.5, batchOutput: 2 },
}

const textAda001: Model = {
  humanName: 'Text Ada 001',
  encoding: 'r50k_base',
  description: 'Model for lightweight tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'gpt-3.5-turbo-instruct',
  cost: { input: 0.4 },
}

const textBabbage001: Model = {
  humanName: 'Text Babbage 001',
  encoding: 'r50k_base',
  description: 'Model for efficient processing.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'gpt-3.5-turbo-instruct',
  cost: { input: 0.5 },
}

const textCurie001: Model = {
  humanName: 'Text Curie 001',
  encoding: 'r50k_base',
  description: 'Mid-range model for various tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'gpt-3.5-turbo-instruct',
  cost: { input: 2 },
}

const textDavinci001: Model = {
  humanName: 'Text Davinci 001',
  encoding: 'r50k_base',
  description: 'High-performance model for complex tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'gpt-3.5-turbo-instruct',
  cost: { input: 20 },
}

const textDavinci002: Model = {
  humanName: 'Text Davinci 002',
  encoding: 'p50k_base',
  description: 'Legacy high-performance model.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'gpt-3.5-turbo-instruct',
  cost: { input: 20 },
}

const textDavinci003: Model = {
  humanName: 'Text Davinci 003',
  encoding: 'p50k_base',
  description: 'Latest of the Davinci series.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'gpt-3.5-turbo-instruct',
  cost: { input: 20 },
}

const ada: Model = {
  humanName: 'Ada',
  encoding: 'r50k_base',
  description: 'Base model for lightweight tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'babbage-002',
  cost: { input: 0.4 },
}

const babbage: Model = {
  humanName: 'Babbage',
  encoding: 'r50k_base',
  description: 'Model for efficient processing.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'babbage-002',
  cost: { input: 0.5 },
}

const curie: Model = {
  humanName: 'Curie',
  encoding: 'r50k_base',
  description: 'Mid-range model for a variety of applications.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'davinci-002',
  cost: { input: 2 },
}

const davinci: Model = {
  humanName: 'Davinci',
  encoding: 'p50k_base',
  description: 'High-performance legacy model.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'davinci-002',
  cost: { input: 20 },
}

const codeDavinci002: Model = {
  humanName: 'Code Davinci 002',
  encoding: 'p50k_base',
  description: 'Legacy coding model.',
  shutdownDate: '2023-03-23',
  recommendedReplacement: 'gpt-4o',
}

const codeDavinci001: Model = {
  humanName: 'Code Davinci 001',
  encoding: 'p50k_base',
  description: 'Older coding model.',
  shutdownDate: '2023-03-23',
  recommendedReplacement: 'gpt-4o',
}

const codeDavinciEdit001: Model = {
  humanName: 'Code Davinci 001',
  encoding: 'p50k_edit',
  description: 'Older coding model.',
  shutdownDate: '2023-03-23',
}

const codeCushman002: Model = {
  humanName: 'Code Cushman 002',
  encoding: 'p50k_base',
  description: 'Legacy model for coding.',
  shutdownDate: '2023-03-23',
  recommendedReplacement: 'gpt-4o',
}

const codeCushman001: Model = {
  humanName: 'Code Cushman 001',
  encoding: 'p50k_base',
  description: 'Older model for coding tasks.',
  shutdownDate: '2023-03-23',
  recommendedReplacement: 'gpt-4o',
}

const gpt40314: Model = {
  humanName: 'GPT-4 0314',
  encoding: 'cl100k_base',
  description: 'Variant of GPT-4 model.',
  shutdownDate: '2024-06-13',
  recommendedReplacement: 'gpt-4o',
  context: 8_192,
  maxOutput: 8_192,
  trainingData: '2021-09',
  cost: { input: 30, output: 60 },
}

const gpt35Turbo0301: Model = {
  humanName: 'GPT-3.5 Turbo 0301',
  encoding: 'cl100k_base',
  description: 'Earlier version of GPT-3.5 Turbo.',
  shutdownDate: '2024-09-13',
  recommendedReplacement: 'gpt-3.5-turbo',
  context: 16_385,
  maxOutput: 4_096,
  trainingData: '2021-09',
  cost: { input: 1.5, output: 2, batchInput: 0.75, batchOutput: 1 },
}

const gpt432k0314: Model = {
  ...gpt432k0613,
  humanName: 'GPT-4 32k 0314',
}

const textSimilarityAda001: Model = {
  humanName: 'Text Similarity Ada 001',
  encoding: 'r50k_base',
  description: 'Embedding model for similarity tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 4 },
}

const textSearchAdaDoc001: Model = {
  humanName: 'Text Search Ada Doc 001',
  encoding: 'r50k_base',
  description: 'Embedding model for document search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 4 },
}

const textSearchAdaQuery001: Model = {
  humanName: 'Text Search Ada Query 001',
  encoding: 'r50k_base',
  description: 'Embedding model for query search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 4 },
}

const codeSearchAdaCode001: Model = {
  humanName: 'Code Search Ada Code 001',
  encoding: 'r50k_base',
  description: 'Embedding model for code search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 4 },
}

const codeSearchAdaText001: Model = {
  humanName: 'Code Search Ada Text 001',
  encoding: 'r50k_base',
  description: 'Embedding model for text search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 4 },
}

const textDavinciEdit001: Model = {
  humanName: 'Text Davinci 001',
  encoding: 'p50k_edit',
  description: 'Older text model.',
  shutdownDate: '2023-03-23',
}

const textSimilarityBabbage001: Model = {
  humanName: 'Text Similarity Babbage 001',
  encoding: 'r50k_base',
  description: 'Embedding model for similarity tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 5 },
}

const textSearchBabbageDoc001: Model = {
  humanName: 'Text Search Babbage Doc 001',
  encoding: 'r50k_base',
  description: 'Embedding model for document search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 5 },
}

const textSearchBabbageQuery001: Model = {
  humanName: 'Text Search Babbage Query 001',
  encoding: 'r50k_base',
  description: 'Embedding model for query search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 5 },
}

const codeSearchBabbageCode001: Model = {
  humanName: 'Code Search Babbage Code 001',
  encoding: 'r50k_base',
  description: 'Embedding model for code search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 5 },
}

const codeSearchBabbageText001: Model = {
  humanName: 'Code Search Babbage Text 001',
  encoding: 'r50k_base',
  description: 'Embedding model for text search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 5 },
}

const textSimilarityCurie001: Model = {
  humanName: 'Text Similarity Curie 001',
  encoding: 'r50k_base',
  description: 'Embedding model for similarity tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 20 },
}

const textSearchCurieDoc001: Model = {
  humanName: 'Text Search Curie Doc 001',
  encoding: 'r50k_base',
  description: 'Embedding model for document search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 20 },
}

const textSearchCurieQuery001: Model = {
  humanName: 'Text Search Curie Query 001',
  encoding: 'r50k_base',
  description: 'Embedding model for query search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 20 },
}

const textSimilarityDavinci001: Model = {
  humanName: 'Text Similarity Davinci 001',
  encoding: 'r50k_base',
  description: 'Embedding model for similarity tasks.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 200 },
}

const textSearchDavinciDoc001: Model = {
  humanName: 'Text Search Davinci Doc 001',
  encoding: 'r50k_base',
  description: 'Embedding model for document search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 200 },
}

const textSearchDavinciQuery001: Model = {
  humanName: 'Text Search Davinci Query 001',
  encoding: 'r50k_base',
  description: 'Embedding model for query search.',
  shutdownDate: '2024-01-04',
  recommendedReplacement: 'text-embedding-3-small',
  cost: { input: 200 },
}

export const chatEnabledModels = {
  o1: o1December2024,
  'o1-2024-12-17': o1December2024,
  'o1-preview': o1PreviewSeptember2024,
  'o1-preview-2024-09-12': o1PreviewSeptember2024,
  'o1-mini': o1MiniSeptember2024,
  'o1-mini-2024-09-12': o1MiniSeptember2024,
  'o3-mini': o3MiniModel,

  'chatgpt-4o-latest': chatgpt4oLatest,

  'gpt-4o': gpt4oAugust2024,
  'gpt-4o-2024-11-20': gpt4oNovember2024,
  'gpt-4o-2024-08-06': gpt4oAugust2024,
  'gpt-4o-2024-05-13': gpt4oMay2024,
  'gpt-4o-mini': gpt4oMiniJuly2024,
  'gpt-4o-mini-2024-07-18': gpt4oMiniJuly2024,

  // audio models:
  'gpt-4o-realtime-preview': gpt4oRealtimePreview,
  'gpt-4o-realtime-preview-2024-10-01': gpt4oRealtimePreview20241001,
  'gpt-4o-realtime-preview-2024-12-17': gpt4oRealtimePreviewDecember2024,
  'gpt-4o-mini-realtime-preview': gpt4oMiniRealtimePreviewDecember2024,
  'gpt-4o-mini-realtime-preview-2024-12-17':
    gpt4oMiniRealtimePreviewDecember2024,
  'gpt-4o-audio-preview': gpt4oAudioPreview,
  'gpt-4o-audio-preview-2024-10-01': gpt4oAudioPreview20241001,
  'gpt-4o-audio-preview-2024-12-17': gpt4oAudioPreviewDecember2024,
  'gpt-4o-mini-audio-preview': gpt4oMiniAudioPreviewDecember2024,
  'gpt-4o-mini-audio-preview-2024-12-17': gpt4oMiniAudioPreviewDecember2024,

  // finetune and training:
  'gpt-4o-2024-08-06-finetune': gpt4oFinetuning,
  'gpt-4o-mini-2024-07-18-finetune': gpt4oMiniFinetuning,
  'gpt-4o-mini-training': gpt4oMiniTrainingJuly2024,
  'gpt-4o-mini-training-2024-07-18': gpt4oMiniTrainingJuly2024,
  'davinci-002-finetune': davinci002Finetune,
  'babbage-002-finetune': babbage002Finetune,

  // older models:
  'gpt-4-turbo': gpt4TurboApril2024,
  'gpt-4-turbo-2024-04-09': gpt4TurboApril2024,
  'gpt-4-turbo-preview': gpt40125Preview,
  'gpt-4-0125-preview': gpt40125Preview,
  'gpt-4-1106-preview': gpt41106Preview,
  'gpt-4': gpt40613,
  'gpt-4-0613': gpt40613,
  'gpt-3.5-turbo': gpt35Turbo0125,
  'gpt-3.5-turbo-0125': gpt35Turbo0125,
  'gpt-3.5-turbo-1106': gpt35Turbo1106,
  'gpt-3.5-turbo-finetune': gpt35TurboFinetune,
  'gpt-3.5-turbo-16k': gpt35Turbo16k,

  // -- deprecated models -- //
  'gpt-4-32k': gpt432k0613,
  'gpt-4-32k-0613': gpt432k0613,
  'gpt-4-vision-preview': gpt4VisionPreview,
  'gpt-4-1106-vision-preview': gpt41106VisionPreview,
  'gpt-4-0314': gpt40314,
  'gpt-4-32k-0314': gpt432k0314,
  'gpt-3.5-turbo-0613': gpt35Turbo0613,
  'gpt-3.5-turbo-16k-0613': gpt35Turbo16k0613,
  'gpt-3.5-turbo-0301': gpt35Turbo0301,
} as const satisfies Record<string, Model>

export const models = {
  ...chatEnabledModels,

  // embedding models:
  'text-embedding-3-small': textEmbedding3Small,
  'text-embedding-3-large': textEmbedding3Large,
  'text-embedding-ada-002': textEmbeddingAdaV2,

  // older models:
  'gpt-3.5-turbo-instruct': gpt35TurboInstruct,
  'gpt-3.5-turbo-instruct-0914': gpt35TurboInstruct,
  'davinci-002': davinci002,
  'babbage-002': babbage002,

  // -- deprecated models -- //
  'text-ada-001': textAda001,
  'text-babbage-001': textBabbage001,
  'text-curie-001': textCurie001,
  'text-davinci-001': textDavinci001,
  'text-davinci-002': textDavinci002,
  'text-davinci-003': textDavinci003,
  ada,
  babbage,
  curie,
  davinci,
  // code models:
  'code-davinci-002': codeDavinci002,
  'code-davinci-001': codeDavinci001,
  'davinci-codex': codeDavinci001,
  'code-davinci-edit-001': codeDavinciEdit001,
  'code-cushman-002': codeCushman002,
  'code-cushman-001': codeCushman001,
  'cushman-codex': codeCushman001,
  'code-search-ada-code-001': codeSearchAdaCode001,
  'code-search-ada-text-001': codeSearchAdaText001,
  // text models:
  'text-davinci-edit-001': textDavinciEdit001,
  'text-similarity-ada-001': textSimilarityAda001,
  'text-search-ada-doc-001': textSearchAdaDoc001,
  'text-search-ada-query-001': textSearchAdaQuery001,
  'text-similarity-babbage-001': textSimilarityBabbage001,
  'text-search-babbage-doc-001': textSearchBabbageDoc001,
  'text-search-babbage-query-001': textSearchBabbageQuery001,
  'code-search-babbage-code-001': codeSearchBabbageCode001,
  'code-search-babbage-text-001': codeSearchBabbageText001,
  'text-similarity-curie-001': textSimilarityCurie001,
  'text-search-curie-doc-001': textSearchCurieDoc001,
  'text-search-curie-query-001': textSearchCurieQuery001,
  'text-similarity-davinci-001': textSimilarityDavinci001,
  'text-search-davinci-doc-001': textSearchDavinciDoc001,
  'text-search-davinci-query-001': textSearchDavinciQuery001,
} as const satisfies Record<string, Model>
