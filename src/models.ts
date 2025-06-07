/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */

import {
  'gpt-3.5-turbo-0125' as gpt_3_5_turbo_0125_spec,
  'gpt-4-0613' as gpt_4_0613_spec,
} from './models.gen.js'
import type { ModelConfig, ModelSpec } from "./modelTypes.js"

// export all codegen-based models:
export * from './models.gen.js'

//
// --- BELOW ARE MODELS THAT WERE MISSING FROM DATASET, BUT PRESENT IN "OTHER MODELS" SECTION ---
// https://platform.openai.com/docs/pricing#other-models
//
//  - gpt-3.5-0301
const gpt_3_5_0301_spec = {
  ...gpt_3_5_turbo_0125_spec,
  name: 'gpt-3.5-0301',
  slug: 'gpt-3-5-0301',
  supported_endpoints: ['chat_completions', 'responses'],
  price_data: {
    main: { input: 1.5, output: 2 },
    batch: { input: 0.75, output: 1 },
  },
} as const satisfies ModelSpec

export {gpt_3_5_0301_spec as 'gpt-3.5-0301'}
export {gpt_3_5_0301_spec as 'gpt-3.5'}

//  - gpt-3.5-turbo-0613
const gpt_3_5_turbo_0613_spec = {
  ...gpt_3_5_turbo_0125_spec,
  name: 'gpt-3.5-turbo-0613',
  slug: 'gpt-3-5-turbo-0613',
  supported_endpoints: ['chat_completions', 'responses', 'batch'],
  price_data: {
    main: { input: 1.5, output: 2 },
    batch: { input: 0.75, output: 1 },
  },
} as const satisfies ModelSpec

export {gpt_3_5_turbo_0613_spec as 'gpt-3.5-turbo-0613'}


//  - gpt-4-1106-preview
const gpt_4_1106_preview_spec = {
  ...gpt_4_0613_spec,
  name: 'gpt-4-1106-preview',
  slug: 'gpt-4-1106-preview',
  performance: 2,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 128e3,
  max_output_tokens: 4_096,
  supported_features: ['fine_tuning'],
  supported_endpoints: ['chat_completions', 'responses', 'assistants'],
  price_data: {
    main: { input: 10, output: 30 },
    batch: { input: 5, output: 15 },
  },
} as const satisfies ModelSpec

export {gpt_4_1106_preview_spec as 'gpt-4-1106-preview'}


//  - gpt-4-32k
const gpt_4_32k_config = {
  name: 'gpt-4-32k',
  slug: 'gpt-4-32k',
  display_name: 'GPT-4-32k',
  current_snapshot: 'gpt-4-32k',
  tagline: 'Legacy GPT-4 model with a 32k context window',
  description:
    'Legacy version of GPT-4 with a 32,768 token context window.',
  type: 'chat',
  snapshots: ['gpt-4-32k'],
  point_to: 'gpt-4o',
  deprecated: true,
} as const satisfies ModelConfig

const gpt_4_32k_spec = {
  ...gpt_4_0613_spec,
  name: 'gpt-4-32k',
  slug: 'gpt-4-32k',
  context_window: 32_768,
  max_output_tokens: 8_192,
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
  ],
  price_data: {
    main: { input: 60, output: 120 },
    batch: { input: 30, output: 60 },
  },
} as const satisfies ModelSpec

export { gpt_4_32k_spec as 'gpt-4-32k' }

//
// --- BELOW ARE LEGACY, NO LONGER SUPPORTED MODELS ---
//
// --- text-ada-001 ---
const text_ada_config = {
  name: 'text-ada',
  slug: 'text-ada',
  display_name: 'Text Ada 001',
  current_snapshot: 'text-ada-001',
  tagline: 'Text Ada 001',
  description: 'Model for lightweight tasks.',
  type: 'other', // Legacy completions model
  snapshots: ['text-ada-001'],
  point_to: 'gpt-3.5-turbo-instruct',
  deprecated: true,
} as const satisfies ModelConfig

const text_ada_001_spec = {
  name: 'text-ada-001',
  slug: 'text-ada-001',
  performance: 1, // Assuming lowest performance for old models
  latency: 3, // Assuming higher latency for old models
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.4 } },
} as const satisfies ModelSpec
export { text_ada_001_spec as 'text-ada-001' }

// --- text-babbage-001 ---
const text_babbage_config = {
  name: 'text-babbage',
  slug: 'text-babbage',
  display_name: 'Text Babbage 001',
  current_snapshot: 'text-babbage-001',
  tagline: 'Text Babbage 001',
  description: 'Model for efficient processing.',
  type: 'other', // Legacy completions model
  snapshots: ['text-babbage-001'],
  point_to: 'gpt-3.5-turbo-instruct',
  deprecated: true,
} as const satisfies ModelConfig

const text_babbage_001_spec = {
  name: 'text-babbage-001',
  slug: 'text-babbage-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.5 } },
} as const satisfies ModelSpec
export { text_babbage_001_spec as 'text-babbage-001' }

// --- text-curie-001 ---
const text_curie_config = {
  name: 'text-curie',
  slug: 'text-curie',
  display_name: 'Text Curie 001',
  current_snapshot: 'text-curie-001',
  tagline: 'Text Curie 001',
  description: 'Mid-range model for various tasks.',
  type: 'other', // Legacy completions model
  snapshots: ['text-curie-001'],
  point_to: 'gpt-3.5-turbo-instruct',
  deprecated: true,
} as const satisfies ModelConfig

const text_curie_001_spec = {
  name: 'text-curie-001',
  slug: 'text-curie-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { text_curie_001_spec as 'text-curie-001' }

// --- text-davinci (001, 002, 003) ---
const text_davinci_config = {
  name: 'text-davinci',
  slug: 'text-davinci',
  display_name: 'Text Davinci',
  current_snapshot: 'text-davinci-003', // Points to the latest of these legacy ones
  tagline: 'Legacy high-performance text generation models',
  description:
    'Legacy high-performance model for complex tasks. Includes 001, 002, and 003 versions.',
  type: 'other', // Legacy completions model
  snapshots: ['text-davinci-003', 'text-davinci-002', 'text-davinci-001'],
  point_to: 'gpt-3.5-turbo-instruct',
  deprecated: true,
} as const satisfies ModelConfig

const text_davinci_001_spec = {
  name: 'text-davinci-001',
  slug: 'text-davinci-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { text_davinci_001_spec as 'text-davinci-001' }

const text_davinci_002_spec = {
  name: 'text-davinci-002',
  slug: 'text-davinci-002',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 4_000, // text-davinci-002/003 had larger context
  max_output_tokens: 4_000,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { text_davinci_002_spec as 'text-davinci-002' }

const text_davinci_003_spec = {
  name: 'text-davinci-003',
  slug: 'text-davinci-003',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 4_000,
  max_output_tokens: 4_000,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { text_davinci_003_spec as 'text-davinci-003' }

// --- ada ---
const ada_config = {
  name: 'ada',
  slug: 'ada',
  display_name: 'Ada',
  current_snapshot: 'ada', // No numbered version, so snapshot is 'ada'
  tagline: 'Ada - Base model for lightweight tasks',
  description: 'Base model for lightweight tasks.',
  type: 'other', // Legacy base model for completions
  snapshots: ['ada'],
  point_to: 'babbage-002',
  deprecated: true,
} as const satisfies ModelConfig

const ada_spec = {
  name: 'ada', // Spec name is 'ada'
  slug: 'ada',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.4 } },
} as const satisfies ModelSpec
export { ada_spec as 'ada' }

// --- babbage ---
const babbage_config = {
  name: 'babbage',
  slug: 'babbage',
  display_name: 'Babbage',
  current_snapshot: 'babbage',
  tagline: 'Babbage - Model for efficient processing',
  description: 'Model for efficient processing.',
  type: 'other', // Legacy base model for completions
  snapshots: ['babbage'],
  point_to: 'babbage-002',
  deprecated: true,
} as const satisfies ModelConfig

const babbage_spec = {
  name: 'babbage',
  slug: 'babbage',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.5 } },
} as const satisfies ModelSpec
export { babbage_spec as 'babbage' }

// --- curie ---
const curie_config = {
  name: 'curie',
  slug: 'curie',
  display_name: 'Curie',
  current_snapshot: 'curie',
  tagline: 'Curie - Mid-range model for a variety of applications',
  description: 'Mid-range model for a variety of applications.',
  type: 'other', // Legacy base model for completions
  snapshots: ['curie'],
  point_to: 'davinci-002',
  deprecated: true,
} as const satisfies ModelConfig

const curie_spec = {
  name: 'curie',
  slug: 'curie',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { curie_spec as 'curie' }

// --- davinci ---
const davinci_config = {
  name: 'davinci',
  slug: 'davinci',
  display_name: 'Davinci',
  current_snapshot: 'davinci',
  tagline: 'Davinci - High-performance legacy model',
  description: 'High-performance legacy model.',
  type: 'other', // Legacy base model for completions
  snapshots: ['davinci'],
  point_to: 'davinci-002',
  deprecated: true,
} as const satisfies ModelConfig

const davinci_spec = {
  name: 'davinci',
  slug: 'davinci',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { davinci_spec as 'davinci' }

// --- code-davinci (001, 002) ---
const code_davinci_config = {
  name: 'code-davinci',
  slug: 'code-davinci',
  display_name: 'Code Davinci',
  current_snapshot: 'code-davinci-002',
  tagline: 'Legacy code generation models (Davinci series)',
  description: 'Legacy coding model. Includes 001 and 002 versions.',
  type: 'other', // Code-specific
  snapshots: ['code-davinci-002', 'code-davinci-001'],
  point_to: 'gpt-4o',
  deprecated: true,
} as const satisfies ModelConfig

const code_davinci_001_spec = {
  name: 'code-davinci-001',
  slug: 'code-davinci-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] }, // Code is text
  context_window: 8_000,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { code_davinci_001_spec as 'code-davinci-001' }

const code_davinci_002_spec = {
  name: 'code-davinci-002',
  slug: 'code-davinci-002',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_000,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { code_davinci_002_spec as 'code-davinci-002' }

// --- davinci-codex ---
const davinci_codex_config = {
  name: 'davinci-codex', // Exact match
  slug: 'davinci-codex',
  display_name: 'Code Davinci 001 (davinci-codex)',
  current_snapshot: 'davinci-codex',
  tagline: 'Alias for Code Davinci 001.',
  description: 'Alias for Code Davinci 001. Older coding model.',
  type: 'other', // Code-specific
  snapshots: ['davinci-codex'],
  point_to: 'gpt-4o',
  deprecated: true,
} as const satisfies ModelConfig

const davinci_codex_spec = {
  name: 'davinci-codex', // Spec name matches snapshot
  slug: 'davinci-codex',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_000, // Same as code-davinci-001
  max_output_tokens: 2_048, // Same as code-davinci-001
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { davinci_codex_spec as 'davinci-codex' }

// --- code-davinci-edit-001 ---
const code_davinci_edit_config = {
  name: 'code-davinci-edit',
  slug: 'code-davinci-edit',
  display_name: 'Code Davinci Edit 001',
  current_snapshot: 'code-davinci-edit-001',
  tagline: 'Older coding edit model.',
  description: 'Older coding edit model.',
  type: 'other', // Edit-specific
  snapshots: ['code-davinci-edit-001'],
  deprecated: true,
} as const satisfies ModelConfig

const code_davinci_edit_001_spec = {
  name: 'code-davinci-edit-001',
  slug: 'code-davinci-edit-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048, // Edit models often had smaller context
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'], // No specific 'edit' endpoint in new list
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { code_davinci_edit_001_spec as 'code-davinci-edit-001' }

// --- code-cushman (001, 002) ---
const code_cushman_config = {
  name: 'code-cushman',
  slug: 'code-cushman',
  display_name: 'Code Cushman',
  current_snapshot: 'code-cushman-002',
  tagline: 'Legacy code generation models (Cushman series)',
  description: 'Legacy model for coding. Includes 001 and 002 versions.',
  type: 'other', // Code-specific
  snapshots: ['code-cushman-002', 'code-cushman-001'],
  point_to: 'gpt-4o',
  deprecated: true,
} as const satisfies ModelConfig

const code_cushman_001_spec = {
  name: 'code-cushman-001',
  slug: 'code-cushman-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { code_cushman_001_spec as 'code-cushman-001' }

const code_cushman_002_spec = {
  name: 'code-cushman-002',
  slug: 'code-cushman-002',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { code_cushman_002_spec as 'code-cushman-002' }

// --- cushman-codex ---
const cushman_codex_config = {
  name: 'cushman-codex', // Exact match
  slug: 'cushman-codex',
  display_name: 'Code Cushman 001 (cushman-codex)',
  current_snapshot: 'cushman-codex',
  tagline: 'Alias for Code Cushman 001.',
  description: 'Alias for Code Cushman 001. Older model for coding tasks.',
  type: 'other', // Code-specific
  snapshots: ['cushman-codex'],
  point_to: 'gpt-4o',
  deprecated: true,
} as const satisfies ModelConfig

const cushman_codex_spec = {
  name: 'cushman-codex', // Spec name matches snapshot
  slug: 'cushman-codex',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048, // Same as code-cushman-001
  max_output_tokens: 2_048, // Same as code-cushman-001
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { cushman_codex_spec as 'cushman-codex' }

// --- code-search-ada-code-001 ---
const code_search_ada_code_config = {
  name: 'code-search-ada-code',
  slug: 'code-search-ada-code',
  display_name: 'Code Search Ada Code 001',
  current_snapshot: 'code-search-ada-code-001',
  tagline: 'Embedding model for code search.',
  description: 'Embedding model for code search.',
  type: 'other', // Embedding model
  snapshots: ['code-search-ada-code-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const code_search_ada_code_001_spec = {
  name: 'code-search-ada-code-001',
  slug: 'code-search-ada-code-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] }, // Output is an embedding vector (represented as text)
  context_window: 8_191, // maxInput for embedding models
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.4 } },
} as const satisfies ModelSpec
export { code_search_ada_code_001_spec as 'code-search-ada-code-001' }

// --- code-search-ada-text-001 ---
const code_search_ada_text_config = {
  name: 'code-search-ada-text',
  slug: 'code-search-ada-text',
  display_name: 'Code Search Ada Text 001',
  current_snapshot: 'code-search-ada-text-001',
  tagline: 'Embedding model for text search in code context.',
  description: 'Embedding model for text search in code context.',
  type: 'other', // Embedding model
  snapshots: ['code-search-ada-text-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const code_search_ada_text_001_spec = {
  name: 'code-search-ada-text-001',
  slug: 'code-search-ada-text-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.4 } },
} as const satisfies ModelSpec
export { code_search_ada_text_001_spec as 'code-search-ada-text-001' }

// --- text-davinci-edit-001 ---
const text_davinci_edit_config = {
  name: 'text-davinci-edit',
  slug: 'text-davinci-edit',
  display_name: 'Text Davinci Edit 001',
  current_snapshot: 'text-davinci-edit-001',
  tagline: 'Older text edit model.',
  description: 'Older text edit model.',
  type: 'other', // Edit-specific
  snapshots: ['text-davinci-edit-001'],
  deprecated: true,
} as const satisfies ModelConfig

const text_davinci_edit_001_spec = {
  name: 'text-davinci-edit-001',
  slug: 'text-davinci-edit-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 2_048,
  max_output_tokens: 2_048,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['completions'], // No specific 'edit' endpoint
  reasoning_tokens: false,
  price_data: { main: { input: 20 } },
} as const satisfies ModelSpec
export { text_davinci_edit_001_spec as 'text-davinci-edit-001' }

// --- text-similarity-ada-001 ---
const text_similarity_ada_config = {
  name: 'text-similarity-ada',
  slug: 'text-similarity-ada',
  display_name: 'Text Similarity Ada 001',
  current_snapshot: 'text-similarity-ada-001',
  tagline: 'Embedding model for similarity tasks.',
  description: 'Embedding model for similarity tasks.',
  type: 'other', // Embedding
  snapshots: ['text-similarity-ada-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_similarity_ada_001_spec = {
  name: 'text-similarity-ada-001',
  slug: 'text-similarity-ada-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.4 } },
} as const satisfies ModelSpec
export { text_similarity_ada_001_spec as 'text-similarity-ada-001' }

// --- text-search-ada-doc-001 ---
const text_search_ada_doc_config = {
  name: 'text-search-ada-doc',
  slug: 'text-search-ada-doc',
  display_name: 'Text Search Ada Doc 001',
  current_snapshot: 'text-search-ada-doc-001',
  tagline: 'Embedding model for document search.',
  description: 'Embedding model for document search.',
  type: 'other', // Embedding
  snapshots: ['text-search-ada-doc-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_ada_doc_001_spec = {
  name: 'text-search-ada-doc-001',
  slug: 'text-search-ada-doc-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.4 } },
} as const satisfies ModelSpec
export { text_search_ada_doc_001_spec as 'text-search-ada-doc-001' }

// --- text-search-ada-query-001 ---
const text_search_ada_query_config = {
  name: 'text-search-ada-query',
  slug: 'text-search-ada-query',
  display_name: 'Text Search Ada Query 001',
  current_snapshot: 'text-search-ada-query-001',
  tagline: 'Embedding model for query search.',
  description: 'Embedding model for query search.',
  type: 'other', // Embedding
  snapshots: ['text-search-ada-query-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_ada_query_001_spec = {
  name: 'text-search-ada-query-001',
  slug: 'text-search-ada-query-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.4 } },
} as const satisfies ModelSpec
export { text_search_ada_query_001_spec as 'text-search-ada-query-001' }

// --- text-similarity-babbage-001 ---
const text_similarity_babbage_config = {
  name: 'text-similarity-babbage',
  slug: 'text-similarity-babbage',
  display_name: 'Text Similarity Babbage 001',
  current_snapshot: 'text-similarity-babbage-001',
  tagline: 'Embedding model for similarity tasks.',
  description: 'Embedding model for similarity tasks.',
  type: 'other', // Embedding
  snapshots: ['text-similarity-babbage-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_similarity_babbage_001_spec = {
  name: 'text-similarity-babbage-001',
  slug: 'text-similarity-babbage-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.5 } },
} as const satisfies ModelSpec
export { text_similarity_babbage_001_spec as 'text-similarity-babbage-001' }

// --- text-search-babbage-doc-001 ---
const text_search_babbage_doc_config = {
  name: 'text-search-babbage-doc',
  slug: 'text-search-babbage-doc',
  display_name: 'Text Search Babbage Doc 001',
  current_snapshot: 'text-search-babbage-doc-001',
  tagline: 'Embedding model for document search.',
  description: 'Embedding model for document search.',
  type: 'other', // Embedding
  snapshots: ['text-search-babbage-doc-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_babbage_doc_001_spec = {
  name: 'text-search-babbage-doc-001',
  slug: 'text-search-babbage-doc-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.5 } },
} as const satisfies ModelSpec
export { text_search_babbage_doc_001_spec as 'text-search-babbage-doc-001' }

// --- text-search-babbage-query-001 ---
const text_search_babbage_query_config = {
  name: 'text-search-babbage-query',
  slug: 'text-search-babbage-query',
  display_name: 'Text Search Babbage Query 001',
  current_snapshot: 'text-search-babbage-query-001',
  tagline: 'Embedding model for query search.',
  description: 'Embedding model for query search.',
  type: 'other', // Embedding
  snapshots: ['text-search-babbage-query-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_babbage_query_001_spec = {
  name: 'text-search-babbage-query-001',
  slug: 'text-search-babbage-query-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.5 } },
} as const satisfies ModelSpec
export { text_search_babbage_query_001_spec as 'text-search-babbage-query-001' }

// --- code-search-babbage-code-001 ---
const code_search_babbage_code_config = {
  name: 'code-search-babbage-code',
  slug: 'code-search-babbage-code',
  display_name: 'Code Search Babbage Code 001',
  current_snapshot: 'code-search-babbage-code-001',
  tagline: 'Embedding model for code search.',
  description: 'Embedding model for code search.',
  type: 'other', // Embedding
  snapshots: ['code-search-babbage-code-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const code_search_babbage_code_001_spec = {
  name: 'code-search-babbage-code-001',
  slug: 'code-search-babbage-code-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.5 } },
} as const satisfies ModelSpec
export { code_search_babbage_code_001_spec as 'code-search-babbage-code-001' }

// --- code-search-babbage-text-001 ---
const code_search_babbage_text_config = {
  name: 'code-search-babbage-text',
  slug: 'code-search-babbage-text',
  display_name: 'Code Search Babbage Text 001',
  current_snapshot: 'code-search-babbage-text-001',
  tagline: 'Embedding model for text search in code context.',
  description: 'Embedding model for text search in code context.',
  type: 'other', // Embedding
  snapshots: ['code-search-babbage-text-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const code_search_babbage_text_001_spec = {
  name: 'code-search-babbage-text-001',
  slug: 'code-search-babbage-text-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 0.5 } },
} as const satisfies ModelSpec
export { code_search_babbage_text_001_spec as 'code-search-babbage-text-001' }

// --- text-similarity-curie-001 ---
const text_similarity_curie_config = {
  name: 'text-similarity-curie',
  slug: 'text-similarity-curie',
  display_name: 'Text Similarity Curie 001',
  current_snapshot: 'text-similarity-curie-001',
  tagline: 'Embedding model for similarity tasks.',
  description: 'Embedding model for similarity tasks.',
  type: 'other', // Embedding
  snapshots: ['text-similarity-curie-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_similarity_curie_001_spec = {
  name: 'text-similarity-curie-001',
  slug: 'text-similarity-curie-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { text_similarity_curie_001_spec as 'text-similarity-curie-001' }

// --- text-search-curie-doc-001 ---
const text_search_curie_doc_config = {
  name: 'text-search-curie-doc',
  slug: 'text-search-curie-doc',
  display_name: 'Text Search Curie Doc 001',
  current_snapshot: 'text-search-curie-doc-001',
  tagline: 'Embedding model for document search.',
  description: 'Embedding model for document search.',
  type: 'other', // Embedding
  snapshots: ['text-search-curie-doc-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_curie_doc_001_spec = {
  name: 'text-search-curie-doc-001',
  slug: 'text-search-curie-doc-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { text_search_curie_doc_001_spec as 'text-search-curie-doc-001' }

// --- text-search-curie-query-001 ---
const text_search_curie_query_config = {
  name: 'text-search-curie-query',
  slug: 'text-search-curie-query',
  display_name: 'Text Search Curie Query 001',
  current_snapshot: 'text-search-curie-query-001',
  tagline: 'Embedding model for query search.',
  description: 'Embedding model for query search.',
  type: 'other', // Embedding
  snapshots: ['text-search-curie-query-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_curie_query_001_spec = {
  name: 'text-search-curie-query-001',
  slug: 'text-search-curie-query-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 2 } },
} as const satisfies ModelSpec
export { text_search_curie_query_001_spec as 'text-search-curie-query-001' }

// --- text-similarity-davinci-001 ---
const text_similarity_davinci_config = {
  name: 'text-similarity-davinci',
  slug: 'text-similarity-davinci',
  display_name: 'Text Similarity Davinci 001',
  current_snapshot: 'text-similarity-davinci-001',
  tagline: 'Embedding model for similarity tasks.',
  description: 'Embedding model for similarity tasks.',
  type: 'other', // Embedding
  snapshots: ['text-similarity-davinci-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_similarity_davinci_001_spec = {
  name: 'text-similarity-davinci-001',
  slug: 'text-similarity-davinci-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 200 } },
} as const satisfies ModelSpec
export { text_similarity_davinci_001_spec as 'text-similarity-davinci-001' }

// --- text-search-davinci-doc-001 ---
const text_search_davinci_doc_config = {
  name: 'text-search-davinci-doc',
  slug: 'text-search-davinci-doc',
  display_name: 'Text Search Davinci Doc 001',
  current_snapshot: 'text-search-davinci-doc-001',
  tagline: 'Embedding model for document search.',
  description: 'Embedding model for document search.',
  type: 'other', // Embedding
  snapshots: ['text-search-davinci-doc-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_davinci_doc_001_spec = {
  name: 'text-search-davinci-doc-001',
  slug: 'text-search-davinci-doc-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 200 } },
} as const satisfies ModelSpec
export { text_search_davinci_doc_001_spec as 'text-search-davinci-doc-001' }

// --- text-search-davinci-query-001 ---
const text_search_davinci_query_config = {
  name: 'text-search-davinci-query',
  slug: 'text-search-davinci-query',
  display_name: 'Text Search Davinci Query 001',
  current_snapshot: 'text-search-davinci-query-001',
  tagline: 'Embedding model for query search.',
  description: 'Embedding model for query search.',
  type: 'other', // Embedding
  snapshots: ['text-search-davinci-query-001'],
  point_to: 'text-embedding-3-small',
  deprecated: true,
} as const satisfies ModelConfig

const text_search_davinci_query_001_spec = {
  name: 'text-search-davinci-query-001',
  slug: 'text-search-davinci-query-001',
  performance: 1,
  latency: 3,
  modalities: { input: ['text'], output: ['text'] },
  context_window: 8_191,
  knowledge_cutoff: new Date(Date.UTC(2_021, 9 - 1, 1)), // 2021-09
  supported_endpoints: ['embeddings'],
  reasoning_tokens: false,
  price_data: { main: { input: 200 } },
} as const satisfies ModelSpec
export { text_search_davinci_query_001_spec as 'text-search-davinci-query-001' }
