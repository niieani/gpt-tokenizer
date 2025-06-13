/* eslint-disable no-magic-numbers */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */

import type { ModelConfig, ModelSpec } from "./modelTypes.js"

const babbage_002_config = {
  name: 'babbage-002',
  slug: 'babbage-002',
  current_snapshot: 'babbage-002',
  tagline: 'Replacement for the GPT-3 ada and babbage base models',
  description: 'GPT base models can understand and generate natural language or code but are not trained with instruction following. These models are made to be replacements for our original GPT-3 base models and use the legacy Completions API. Most customers should use GPT-3.5 or GPT-4.\n',
  type: 'chat',
  snapshots: [
    'babbage-002',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'gpt-4o',
  ],
  point_to: 'gpt-4o',
  rate_limits: {
    tier_1: {
      rpm: 500,
      rpd: 1e4,
      tpm: 1e4,
      batch_queue_limit: 1e5,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 4e4,
      batch_queue_limit: 2e5,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e4,
      batch_queue_limit: 5e6,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 3e5,
      batch_queue_limit: 3e7,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 1e6,
      batch_queue_limit: 15e7,
    },
  },
} as const satisfies ModelConfig

const babbage_002_spec = {
  name: 'babbage-002',
  slug: 'babbage-002',
  performance: 1,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16304544e5),
  supported_features: [
    'fine_tuning',
  ],
  supported_endpoints: [
    'completions',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 0.4,
      output: 0.4,
    },
    batch: {
      input: 0.2,
      output: 0.2,
    },
  },
} as const satisfies ModelSpec
export {babbage_002_spec as 'babbage-002'}

const chatgpt_4o_latest_config = {
  name: 'chatgpt-4o-latest',
  slug: 'chatgpt-4o-latest',
  display_name: 'ChatGPT-4o',
  current_snapshot: 'chatgpt-4o-latest',
  tagline: 'GPT-4o model used in ChatGPT',
  description: 'ChatGPT-4o points to the GPT-4o snapshot currently used in ChatGPT. GPT-4o is our versatile, high-intelligence flagship model.\nIt accepts both text and image inputs, and produces text outputs.\nIt is the best model for most tasks, and is our most capable model outside of our o-series models.\n',
  type: 'chat',
  snapshots: [
    'chatgpt-4o-latest',
  ],
  compare_prices: [
    'gpt-4o',
    'gpt-4o-mini',
  ],
  examples: [
    'math_tutor',
    'travel_assistant',
    'clothing_recommendation',
    'recipe_generation',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const chatgpt_4o_latest_spec = {
  name: 'chatgpt-4o-latest',
  slug: 'chatgpt-4o-latest',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'predicted_outputs',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {chatgpt_4o_latest_spec as 'chatgpt-4o-latest'}

const codex_mini_latest_config = {
  name: 'codex-mini-latest',
  slug: 'codex-mini-latest',
  display_name: 'codex-mini-latest',
  current_snapshot: 'codex-mini-latest',
  tagline: 'Fast reasoning model optimized for the Codex CLI',
  description: 'codex-mini-latest is a fine-tuned version of o4-mini specifically\nfor use in Codex CLI. For direct use in the API, we recommend starting \nwith gpt-4.1.\n',
  type: 'other',
  snapshots: [
    'codex-mini-latest',
  ],
  compare_prices: [
    'o4-mini',
    'gpt-4.1',
  ],
  rate_limits: {
    tier_1: {
      rpm: 1e3,
      tpm: 1e5,
      batch_queue_limit: 1e6,
    },
    tier_2: {
      rpm: 2e3,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e6,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 3e4,
      tpm: 15e7,
      batch_queue_limit: 15e9,
    },
  },
} as const satisfies ModelConfig

const codex_mini_latest_spec = {
  name: 'codex-mini-latest',
  slug: 'codex-mini-latest',
  performance: 4,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 2e5,
  max_output_tokens: 1e5,
  knowledge_cutoff: new Date(17172e8),
  supported_features: [
    'streaming',
    'structured_outputs',
    'function_calling',
    'image_input',
    'prompt_caching',
    'evals',
    'stored_completions',
  ],
  supported_endpoints: [
    'responses',
  ],
  reasoning_tokens: true,
} as const satisfies ModelSpec
export {codex_mini_latest_spec as 'codex-mini-latest'}

const computer_use_preview_config = {
  name: 'computer-use-preview',
  slug: 'computer-use-preview',
  current_snapshot: 'computer-use-preview-2025-03-11',
  tagline: 'Specialized model for computer use tool',
  description: 'The computer-use-preview model is a specialized model for the computer use \ntool. It is trained to understand and execute computer tasks.\nSee the [computer use guide](/docs/guides/tools-computer-use) for more\ninformation. This model is only usable in the \n[Responses API](/docs/api-reference/responses).\n',
  type: 'other',
  snapshots: [
    'computer-use-preview-2025-03-11',
  ],
  compare_prices: [
    'o3-mini',
    'o1',
  ],
  grouped_models: null,
  rate_limits: {
    tier_3: {
      rpm: 3e3,
      tpm: 2e7,
      batch_queue_limit: 45e7,
    },
    tier_4: {
      rpm: 3e3,
      tpm: 2e7,
      batch_queue_limit: 45e7,
    },
    tier_5: {
      rpm: 3e3,
      tpm: 2e7,
      batch_queue_limit: 45e7,
    },
  },
} as const satisfies ModelConfig

const computer_use_preview_2025_03_11_spec = {
  name: 'computer-use-preview-2025-03-11',
  slug: 'computer-use-preview-2025-03-11',
  performance: 2,
  latency: 2,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 8_192,
  max_output_tokens: 1_024,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'function_calling',
  ],
  supported_endpoints: [
    'responses',
    'batch',
  ],
  reasoning_tokens: true,
  price_data: {
    main: {
      input: 3,
      output: 12,
    },
    batch: {
      input: 1.5,
      output: 6,
    },
  },
} as const satisfies ModelSpec
export {computer_use_preview_2025_03_11_spec as 'computer-use-preview-2025-03-11'}

// alias:
export { computer_use_preview_2025_03_11_spec as 'computer-use-preview' };

const dall_e_2_config = {
  name: 'dall-e-2',
  slug: 'dall-e-2',
  display_name: 'DALL·E 2',
  current_snapshot: 'dall-e-2',
  tagline: 'Our first image generation model',
  description: 'DALL·E is an AI system that creates realistic images and art from a natural language description. Older than DALL·E 3, DALL·E 2 offers more control in prompting and more requests at once.\n',
  type: 'other',
  snapshots: [
    'dall-e-2',
  ],
  compare_prices: [
    'dall-e-3',
  ],
  point_to: 'dall-e-3',
  rate_limits: {
    tier_free: {
      rpm: '5 img/min',
    },
    tier_1: {
      rpm: '500 img/min',
    },
    tier_2: {
      rpm: '2500 img/min',
    },
    tier_3: {
      rpm: '5000 img/min',
    },
    tier_4: {
      rpm: '7500 img/min',
    },
    tier_5: {
      rpm: '10000 img/min',
    },
  },
} as const satisfies ModelConfig

const dall_e_2_spec = {
  name: 'dall-e-2',
  slug: 'dall-e-2',
  performance: 1,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'image',
    ],
  },
  supported_endpoints: [
    'image_generation',
    'image_edit',
  ],
  supported_features: [
    'inpainting',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {dall_e_2_spec as 'dall-e-2'}

const dall_e_3_config = {
  name: 'dall-e-3',
  slug: 'dall-e-3',
  display_name: 'DALL·E 3',
  current_snapshot: 'dall-e-3',
  tagline: 'Previous generation image generation model',
  description: 'DALL·E is an AI system that creates realistic images and art from a natural language description. DALL·E 3 currently supports the ability, given a prompt, to create a new image with a specific size.\n',
  type: 'other',
  snapshots: [
    'dall-e-3',
  ],
  compare_prices: [
    'dall-e-2',
  ],
  rate_limits: {
    tier_free: {
      rpm: '1 img/min',
    },
    tier_1: {
      rpm: '500 img/min',
    },
    tier_2: {
      rpm: '2500 img/min',
    },
    tier_3: {
      rpm: '5000 img/min',
    },
    tier_4: {
      rpm: '7500 img/min',
    },
    tier_5: {
      rpm: '10000 img/min',
    },
  },
} as const satisfies ModelConfig

const dall_e_3_spec = {
  name: 'dall-e-3',
  slug: 'dall-e-3',
  performance: 3,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'image',
    ],
  },
  supported_endpoints: [
    'image_generation',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {dall_e_3_spec as 'dall-e-3'}

const davinci_002_config = {
  name: 'davinci-002',
  slug: 'davinci-002',
  current_snapshot: 'davinci-002',
  tagline: 'Replacement for the GPT-3 curie and davinci base models',
  description: 'GPT base models can understand and generate natural language or code but are not trained with instruction following. These models are made to be replacements for our original GPT-3 base models and use the legacy Completions API. Most customers should use GPT-3.5 or GPT-4.\n',
  type: 'chat',
  snapshots: [
    'davinci-002',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'gpt-4o',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      rpd: 1e4,
      tpm: 1e4,
      batch_queue_limit: 1e5,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 4e4,
      batch_queue_limit: 2e5,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e4,
      batch_queue_limit: 5e6,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 3e5,
      batch_queue_limit: 3e7,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 1e6,
      batch_queue_limit: 15e7,
    },
  },
} as const satisfies ModelConfig

const davinci_002_spec = {
  name: 'davinci-002',
  slug: 'davinci-002',
  performance: 1,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16304544e5),
  supported_features: [
    'fine_tuning',
  ],
  supported_endpoints: [
    'completions',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 2,
      output: 2,
    },
    batch: {
      input: 1,
      output: 1,
    },
  },
} as const satisfies ModelSpec
export {davinci_002_spec as 'davinci-002'}

const gpt_3_5_turbo_16k_0613_config = {
  name: 'gpt-3.5-turbo-16k-0613',
  slug: 'gpt-3-5-turbo-16k-0613',
  current_snapshot: 'gpt-3.5-turbo-16k-0613',
  tagline: 'Legacy GPT model for cheaper chat and non-chat tasks',
  description: 'GPT-3.5 Turbo models can understand and generate natural language or code and have been optimized for chat using the Chat Completions API but work well for non-chat tasks as well. As of July 2024, use gpt-4o-mini in place of GPT-3.5 Turbo, as it is cheaper, more capable, multimodal, and just as fast. GPT-3.5 Turbo is still available for use in the API.\n',
  type: 'chat',
  snapshots: [
    'gpt-3.5-turbo-16k-0613',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o3-mini',
  ],
  rate_limits: {
    tier_1: {
      rpm: 35e2,
      rpd: 1e4,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_2: {
      rpm: 35e2,
      tpm: 2e6,
      batch_queue_limit: 5e6,
    },
    tier_3: {
      rpm: 35e2,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 5e7,
      batch_queue_limit: 1e10,
    },
  },
} as const satisfies ModelConfig

const gpt_3_5_turbo_16k_0613_spec = {
  name: 'gpt-3.5-turbo-16k-0613',
  slug: 'gpt-3-5-turbo-16k-0613',
  performance: 1,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 16_385,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16304544e5),
  supported_features: [
    'fine_tuning',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'batch',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 3,
      output: 4,
    },
    batch: {
      input: 1.5,
      output: 2,
    },
  },
} as const satisfies ModelSpec
export {gpt_3_5_turbo_16k_0613_spec as 'gpt-3.5-turbo-16k-0613'}

const gpt_3_5_turbo_instruct_config = {
  name: 'gpt-3.5-turbo-instruct',
  slug: 'gpt-3-5-turbo-instruct',
  current_snapshot: 'gpt-3.5-turbo-instruct',
  tagline: 'An older model only compatible with the legacy Completions endpoint',
  description: 'Similar capabilities as GPT-3 era models. Compatible with legacy Completions endpoint and not Chat Completions.\n',
  type: 'chat',
  snapshots: [
    'gpt-3.5-turbo-instruct',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o3-mini',
  ],
  rate_limits: {
    tier_1: {
      rpm: 35e2,
      rpd: 1e4,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_2: {
      rpm: 35e2,
      tpm: 2e6,
      batch_queue_limit: 5e6,
    },
    tier_3: {
      rpm: 35e2,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 5e7,
      batch_queue_limit: 1e10,
    },
  },
} as const satisfies ModelConfig

const gpt_3_5_turbo_instruct_spec = {
  name: 'gpt-3.5-turbo-instruct',
  slug: 'gpt-3-5-turbo-instruct',
  performance: 1,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 4_096,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16304544e5),
  supported_features: [
    'fine_tuning',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 1.5,
      output: 2,
    },
  },
} as const satisfies ModelSpec
export {gpt_3_5_turbo_instruct_spec as 'gpt-3.5-turbo-instruct'}

const gpt_3_5_turbo_config = {
  name: 'gpt-3.5-turbo',
  slug: 'gpt-3-5-turbo',
  display_name: 'GPT-3.5 Turbo',
  current_snapshot: 'gpt-3.5-turbo-0125',
  tagline: 'Legacy GPT model for cheaper chat and non-chat tasks',
  description: 'GPT-3.5 Turbo models can understand and generate natural language or code and have been optimized for chat using the Chat Completions API but work well for non-chat tasks as well. As of July 2024, use gpt-4o-mini in place of GPT-3.5 Turbo, as it is cheaper, more capable, multimodal, and just as fast. GPT-3.5 Turbo is still available for use in the API.\n',
  type: 'chat',
  snapshots: [
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-instruct',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o3-mini',
  ],
  point_to: 'gpt-4o-mini',
  rate_limits: {
    tier_1: {
      rpm: 35e2,
      rpd: 1e4,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_2: {
      rpm: 35e2,
      tpm: 2e6,
      batch_queue_limit: 5e6,
    },
    tier_3: {
      rpm: 35e2,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 5e7,
      batch_queue_limit: 1e10,
    },
  },
} as const satisfies ModelConfig

const gpt_3_5_turbo_0125_spec = {
  name: 'gpt-3.5-turbo-0125',
  slug: 'gpt-3-5-turbo-0125',
  performance: 1,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 16_385,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16304544e5),
  supported_features: [
    'fine_tuning',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 0.5,
      output: 1.5,
    },
    batch: {
      input: 0.25,
      output: 0.75,
    },
  },
} as const satisfies ModelSpec
export {gpt_3_5_turbo_0125_spec as 'gpt-3.5-turbo-0125'}

const gpt_3_5_turbo_1106_spec = {
  name: 'gpt-3.5-turbo-1106',
  slug: 'gpt-3-5-turbo-1106',
  performance: 1,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 16_385,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16304544e5),
  supported_features: [
    'fine_tuning',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 1,
      output: 2,
    },
    batch: {
      input: 0.5,
      output: 1,
    },
  },
} as const satisfies ModelSpec
export {gpt_3_5_turbo_1106_spec as 'gpt-3.5-turbo-1106'}

// alias:
export { gpt_3_5_turbo_0125_spec as 'gpt-3.5-turbo' };

const gpt_4_turbo_preview_config = {
  name: 'gpt-4-turbo-preview',
  slug: 'gpt-4-turbo-preview',
  display_name: 'GPT-4 Turbo Preview',
  current_snapshot: 'gpt-4-0125-preview',
  tagline: 'An older fast GPT model',
  description: 'This is a research preview of the GPT-4 Turbo model, an older high-intelligence GPT model.\n',
  type: 'chat',
  snapshots: [
    'gpt-4-0125-preview',
    'gpt-4-1106-vision-preview',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o3-mini',
  ],
  point_to: 'gpt-4o',
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 6e5,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 8e5,
      batch_queue_limit: 8e7,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 3e8,
    },
  },
} as const satisfies ModelConfig

const gpt_4_0125_preview_spec = {
  name: 'gpt-4-0125-preview',
  slug: 'gpt-4-0125-preview',
  performance: 2,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(17013888e5),
  supported_features: [
    'fine_tuning',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4_0125_preview_spec as 'gpt-4-0125-preview'}

const gpt_4_1106_vision_preview_spec = {
  name: 'gpt-4-1106-vision-preview',
  slug: 'gpt-4-1106-vision-preview',
  performance: 2,
  latency: 3,
  deprecated: true,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(17013888e5),
  supported_features: [
    'fine_tuning',
    'streaming',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4_1106_vision_preview_spec as 'gpt-4-1106-vision-preview'}

// alias:
export { gpt_4_0125_preview_spec as 'gpt-4-turbo-preview' };

const gpt_4_turbo_config = {
  name: 'gpt-4-turbo',
  slug: 'gpt-4-turbo',
  display_name: 'GPT-4 Turbo',
  current_snapshot: 'gpt-4-turbo-2024-04-09',
  tagline: 'An older high-intelligence GPT model',
  description: 'GPT-4 Turbo is the next generation of GPT-4, an older high-intelligence GPT model. It was designed to be a cheaper, better version of GPT-4. Today, we recommend using a newer model like GPT-4o.\n',
  type: 'chat',
  snapshots: [
    'gpt-4-turbo-2024-04-09',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o3-mini',
  ],
  point_to: 'gpt-4o',
  grouped_models: [
    'gpt-4-turbo-preview',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 6e5,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 8e5,
      batch_queue_limit: 8e7,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 3e8,
    },
  },
} as const satisfies ModelConfig

const gpt_4_turbo_2024_04_09_spec = {
  name: 'gpt-4-turbo-2024-04-09',
  slug: 'gpt-4-turbo-2024-04-09',
  performance: 2,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(17013888e5),
  supported_features: [
    'streaming',
    'function_calling',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4_turbo_2024_04_09_spec as 'gpt-4-turbo-2024-04-09'}

// alias:
export { gpt_4_turbo_2024_04_09_spec as 'gpt-4-turbo' };

const gpt_4_1_mini_config = {
  name: 'gpt-4.1-mini',
  slug: 'gpt-4.1-mini',
  display_name: 'GPT-4.1 mini',
  current_snapshot: 'gpt-4.1-mini-2025-04-14',
  tagline: 'Balanced for intelligence, speed, and cost',
  description: 'GPT-4.1 mini provides a balance between intelligence, speed, and cost that\nmakes it an attractive model for many use cases.\n',
  type: 'chat',
  snapshots: [
    'gpt-4.1-mini-2025-04-14',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'gpt-4.1',
  ],
  supported_tools: [
    'function_calling',
    'web_search',
    'file_search',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: [
    {
      name: 'Standard',
      rate_limits: {
        free: {
          rpm: 3,
          rpd: 200,
          tpm: 4e4,
        },
        tier_1: {
          rpm: 500,
          rpd: 1e4,
          tpm: 2e5,
          batch_queue_limit: 2e6,
        },
        tier_2: {
          rpm: 5e3,
          tpm: 2e6,
          batch_queue_limit: 2e7,
        },
        tier_3: {
          rpm: 5e3,
          tpm: 4e6,
          batch_queue_limit: 4e7,
        },
        tier_4: {
          rpm: 1e4,
          tpm: 1e7,
          batch_queue_limit: 1e9,
        },
        tier_5: {
          rpm: 3e4,
          tpm: 15e7,
          batch_queue_limit: 15e9,
        },
      },
    },
    {
      name: 'Long Context',
      tooltip: '> 128k input tokens',
      rate_limits: {
        tier_1: {
          rpm: 200,
          tpm: 4e5,
          batch_queue_limit: 5e6,
        },
        tier_2: {
          rpm: 500,
          tpm: 1e6,
          batch_queue_limit: 4e7,
        },
        tier_3: {
          rpm: 1e3,
          tpm: 2e6,
          batch_queue_limit: 8e7,
        },
        tier_4: {
          rpm: 2e3,
          tpm: 1e7,
          batch_queue_limit: 2e8,
        },
        tier_5: {
          rpm: 8e3,
          tpm: 2e7,
          batch_queue_limit: 2e9,
        },
      },
    },
  ],
} as const satisfies ModelConfig

const gpt_4_1_mini_2025_04_14_spec = {
  name: 'gpt-4.1-mini-2025-04-14',
  slug: 'gpt-4.1-mini-2025-04-14',
  performance: 3,
  latency: 4,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 1_047_576,
  max_output_tokens: 32_768,
  knowledge_cutoff: new Date(17172e8),
  supported_features: [
    'streaming',
    'function_calling',
    'fine_tuning',
    'file_search',
    'file_uploads',
    'web_search',
    'structured_outputs',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4_1_mini_2025_04_14_spec as 'gpt-4.1-mini-2025-04-14'}

// alias:
export { gpt_4_1_mini_2025_04_14_spec as 'gpt-4.1-mini' };

const gpt_4_1_nano_config = {
  name: 'gpt-4.1-nano',
  slug: 'gpt-4.1-nano',
  display_name: 'GPT-4.1 nano',
  current_snapshot: 'gpt-4.1-nano-2025-04-14',
  tagline: 'Fastest, most cost-effective GPT-4.1 model',
  description: 'GPT-4.1 nano is the fastest, most cost-effective GPT-4.1 model.\n',
  type: 'chat',
  snapshots: [
    'gpt-4.1-nano-2025-04-14',
  ],
  compare_prices: [
    'gpt-4.1-mini',
    'gpt-4o-mini',
  ],
  supported_tools: [
    'function_calling',
    'file_search',
    'image_generation',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: [
    {
      name: 'Standard',
      rate_limits: {
        free: {
          rpm: 3,
          rpd: 200,
          tpm: 4e4,
        },
        tier_1: {
          rpm: 500,
          rpd: 1e4,
          tpm: 2e5,
          batch_queue_limit: 2e6,
        },
        tier_2: {
          rpm: 5e3,
          tpm: 2e6,
          batch_queue_limit: 2e7,
        },
        tier_3: {
          rpm: 5e3,
          tpm: 4e6,
          batch_queue_limit: 4e7,
        },
        tier_4: {
          rpm: 1e4,
          tpm: 1e7,
          batch_queue_limit: 1e9,
        },
        tier_5: {
          rpm: 3e4,
          tpm: 15e7,
          batch_queue_limit: 15e9,
        },
      },
    },
    {
      name: 'Long Context',
      tooltip: '> 128k input tokens',
      rate_limits: {
        tier_1: {
          rpm: 200,
          tpm: 4e5,
          batch_queue_limit: 5e6,
        },
        tier_2: {
          rpm: 500,
          tpm: 1e6,
          batch_queue_limit: 4e7,
        },
        tier_3: {
          rpm: 1e3,
          tpm: 2e6,
          batch_queue_limit: 8e7,
        },
        tier_4: {
          rpm: 2e3,
          tpm: 1e7,
          batch_queue_limit: 2e8,
        },
        tier_5: {
          rpm: 8e3,
          tpm: 2e7,
          batch_queue_limit: 2e9,
        },
      },
    },
  ],
} as const satisfies ModelConfig

const gpt_4_1_nano_2025_04_14_spec = {
  name: 'gpt-4.1-nano-2025-04-14',
  slug: 'gpt-4.1-nano-2025-04-14',
  performance: 2,
  latency: 5,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 1_047_576,
  max_output_tokens: 32_768,
  knowledge_cutoff: new Date(17172e8),
  supported_features: [
    'streaming',
    'function_calling',
    'file_search',
    'file_uploads',
    'structured_outputs',
    'image_input',
    'prompt_caching',
    'fine_tuning',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4_1_nano_2025_04_14_spec as 'gpt-4.1-nano-2025-04-14'}

// alias:
export { gpt_4_1_nano_2025_04_14_spec as 'gpt-4.1-nano' };

const gpt_4_1_config = {
  name: 'gpt-4.1',
  slug: 'gpt-4.1',
  display_name: 'GPT-4.1',
  current_snapshot: 'gpt-4.1-2025-04-14',
  tagline: 'Flagship GPT model for complex tasks',
  description: 'GPT-4.1 is our flagship model for complex tasks. It is well suited for problem\nsolving across domains.\n',
  type: 'chat',
  snapshots: [
    'gpt-4.1-2025-04-14',
  ],
  compare_prices: [
    'gpt-4o',
    'o3-mini',
  ],
  supported_tools: [
    'function_calling',
    'web_search',
    'file_search',
    'image_generation',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: [
    {
      name: 'default',
      rate_limits: {
        tier_1: {
          rpm: 500,
          tpm: 3e4,
          batch_queue_limit: 9e4,
        },
        tier_2: {
          rpm: 5e3,
          tpm: 45e4,
          batch_queue_limit: 135e4,
        },
        tier_3: {
          rpm: 5e3,
          tpm: 8e5,
          batch_queue_limit: 5e7,
        },
        tier_4: {
          rpm: 1e4,
          tpm: 2e6,
          batch_queue_limit: 2e8,
        },
        tier_5: {
          rpm: 1e4,
          tpm: 3e7,
          batch_queue_limit: 5e9,
        },
      },
    },
    {
      name: 'Long Context',
      tooltip: '> 128k input tokens',
      rate_limits: {
        tier_1: {
          rpm: 100,
          tpm: 2e5,
          batch_queue_limit: 2e6,
        },
        tier_2: {
          rpm: 250,
          tpm: 5e5,
          batch_queue_limit: 2e7,
        },
        tier_3: {
          rpm: 500,
          tpm: 1e6,
          batch_queue_limit: 4e7,
        },
        tier_4: {
          rpm: 1e3,
          tpm: 5e6,
          batch_queue_limit: 1e8,
        },
        tier_5: {
          rpm: 4e3,
          tpm: 1e7,
          batch_queue_limit: 1e9,
        },
      },
    },
  ],
} as const satisfies ModelConfig

const gpt_4_1_2025_04_14_spec = {
  name: 'gpt-4.1-2025-04-14',
  slug: 'gpt-4.1-2025-04-14',
  performance: 4,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 1_047_576,
  max_output_tokens: 32_768,
  knowledge_cutoff: new Date(17172e8),
  supported_features: [
    'streaming',
    'structured_outputs',
    'predicted_outputs',
    'distillation',
    'function_calling',
    'file_search',
    'file_uploads',
    'image_input',
    'web_search',
    'fine_tuning',
    'prompt_caching',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4_1_2025_04_14_spec as 'gpt-4.1-2025-04-14'}

// alias:
export { gpt_4_1_2025_04_14_spec as 'gpt-4.1' };

const gpt_4_5_preview_config = {
  name: 'gpt-4.5-preview',
  slug: 'gpt-4-5-preview',
  display_name: 'GPT-4.5 Preview',
  current_snapshot: 'gpt-4.5-preview-2025-02-27',
  tagline: 'Largest and most capable GPT model',
  description: 'This is a research preview of GPT-4.5, our largest and most capable GPT model yet. Its deep world knowledge and better understanding of user intent makes it good at creative tasks and agentic planning. GPT-4.5 excels at tasks that benefit from creative, open-ended thinking and conversation, such as writing, learning, or exploring new ideas. \n',
  video_url: 'https://www.youtube.com/embed/cfRYp0nItZ8',
  video_thumbnail: '/images/model-page/GPT-4.5-livestream.jpg',
  type: 'chat',
  snapshots: [
    'gpt-4.5-preview-2025-02-27',
  ],
  compare_prices: [
    'gpt-4o',
    'o3-mini',
  ],
  rate_limits: {
    tier_1: {
      rpm: 1e3,
      tpm: 125e3,
      batch_queue_limit: 5e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 25e4,
      batch_queue_limit: 5e5,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 5e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e6,
      batch_queue_limit: 1e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const gpt_4_5_preview_2025_02_27_spec = {
  name: 'gpt-4.5-preview-2025-02-27',
  slug: 'gpt-4.5-preview-2025-02-27',
  performance: 4,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'function_calling',
    'structured_outputs',
    'streaming',
    'system_messages',
    'evals',
    'prompt_caching',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4_5_preview_2025_02_27_spec as 'gpt-4.5-preview-2025-02-27'}

// alias:
export { gpt_4_5_preview_2025_02_27_spec as 'gpt-4.5-preview' };

const gpt_4_config = {
  name: 'gpt-4',
  slug: 'gpt-4',
  display_name: 'GPT-4',
  current_snapshot: 'gpt-4-0613',
  tagline: 'An older high-intelligence GPT model',
  description: 'GPT-4 is an older version of a high-intelligence GPT model, usable in Chat Completions.\n',
  type: 'chat',
  snapshots: [
    'gpt-4-0613',
    'gpt-4-0314',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o3-mini',
  ],
  point_to: 'gpt-4o',
  rate_limits: {
    tier_1: {
      rpm: 500,
      rpd: 1e4,
      tpm: 1e4,
      batch_queue_limit: 1e5,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 4e4,
      batch_queue_limit: 2e5,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e4,
      batch_queue_limit: 5e6,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 3e5,
      batch_queue_limit: 3e7,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 1e6,
      batch_queue_limit: 15e7,
    },
  },
} as const satisfies ModelConfig

const gpt_4_0613_spec = {
  name: 'gpt-4-0613',
  slug: 'gpt-4-0613',
  performance: 2,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 8_192,
  max_output_tokens: 8_192,
  knowledge_cutoff: new Date(17013888e5),
  supported_features: [
    'fine_tuning',
    'streaming',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 30,
      output: 60,
    },
    batch: {
      input: 15,
      output: 30,
    },
  },
} as const satisfies ModelSpec
export {gpt_4_0613_spec as 'gpt-4-0613'}

const gpt_4_0314_spec = {
  name: 'gpt-4-0314',
  slug: 'gpt-4-0314',
  performance: 2,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 8_192,
  max_output_tokens: 8_192,
  knowledge_cutoff: new Date(17013888e5),
  supported_features: [
    'fine_tuning',
    'streaming',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 30,
      output: 60,
    },
    batch: {
      input: 15,
      output: 30,
    },
  },
} as const satisfies ModelSpec
export {gpt_4_0314_spec as 'gpt-4-0314'}

// alias:
export { gpt_4_0613_spec as 'gpt-4' };

const gpt_4o_audio_preview_config = {
  name: 'gpt-4o-audio-preview',
  slug: 'gpt-4o-audio-preview',
  display_name: 'GPT-4o Audio',
  current_snapshot: 'gpt-4o-audio-preview-2024-12-17',
  tagline: 'GPT-4o models capable of audio inputs and outputs',
  description: 'This is a preview release of the GPT-4o Audio models. These models accept \naudio inputs and outputs, and can be used in the Chat Completions REST API.\n',
  type: 'chat',
  snapshots: [
    'gpt-4o-audio-preview-2025-06-03',
    'gpt-4o-audio-preview-2024-12-17',
    'gpt-4o-audio-preview-2024-10-01',
  ],
  supported_tools: [
    'web_search',
    'file_search',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e6,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_audio_preview_2025_06_03_spec = {
  name: 'gpt-4o-audio-preview-2025-06-03',
  slug: 'gpt-4o-audio-preview-2025-06-03',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'function_calling',
  ],
  supported_endpoints: [
    'chat_completions',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_audio_preview_2025_06_03_spec as 'gpt-4o-audio-preview-2025-06-03'}

const gpt_4o_audio_preview_2024_12_17_spec = {
  name: 'gpt-4o-audio-preview-2024-12-17',
  slug: 'gpt-4o-audio-preview-2024-12-17',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'function_calling',
  ],
  supported_endpoints: [
    'chat_completions',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_audio_preview_2024_12_17_spec as 'gpt-4o-audio-preview-2024-12-17'}

const gpt_4o_audio_preview_2024_10_01_spec = {
  name: 'gpt-4o-audio-preview-2024-10-01',
  slug: 'gpt-4o-audio-preview-2024-10-01',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'function_calling',
  ],
  supported_endpoints: [
    'chat_completions',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_audio_preview_2024_10_01_spec as 'gpt-4o-audio-preview-2024-10-01'}

// alias:
export { gpt_4o_audio_preview_2024_12_17_spec as 'gpt-4o-audio-preview' };

const gpt_4o_mini_audio_preview_config = {
  name: 'gpt-4o-mini-audio-preview',
  slug: 'gpt-4o-mini-audio-preview',
  display_name: 'GPT-4o mini Audio',
  current_snapshot: 'gpt-4o-mini-audio-preview-2024-12-17',
  tagline: 'Smaller model capable of audio inputs and outputs',
  description: 'This is a preview release of the smaller GPT-4o Audio mini model. It\'s designed to input audio or create audio outputs via the REST API.\n',
  type: 'chat',
  snapshots: [
    'gpt-4o-mini-audio-preview-2024-12-17',
  ],
  supported_tools: [
    'web_search',
    'file_search',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: {
    free: {
      rpm: 3,
      rpd: 200,
      tpm: 4e4,
    },
    tier_1: {
      rpm: 500,
      rpd: 1e4,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 2e6,
      batch_queue_limit: 2e7,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e6,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 3e4,
      tpm: 15e7,
      batch_queue_limit: 15e9,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_mini_audio_preview_2024_12_17_spec = {
  name: 'gpt-4o-mini-audio-preview-2024-12-17',
  slug: 'gpt-4o-mini-audio-preview-2024-12-17',
  performance: 2,
  latency: 4,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'function_calling',
  ],
  supported_endpoints: [
    'chat_completions',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_mini_audio_preview_2024_12_17_spec as 'gpt-4o-mini-audio-preview-2024-12-17'}

// alias:
export { gpt_4o_mini_audio_preview_2024_12_17_spec as 'gpt-4o-mini-audio-preview' };

const gpt_4o_mini_realtime_preview_config = {
  name: 'gpt-4o-mini-realtime-preview',
  slug: 'gpt-4o-mini-realtime-preview',
  display_name: 'GPT-4o mini Realtime',
  current_snapshot: 'gpt-4o-mini-realtime-preview-2024-12-17',
  tagline: 'Smaller realtime model for text and audio inputs and outputs',
  description: 'This is a preview release of the GPT-4o-mini Realtime model, capable of responding to audio and text inputs in realtime over WebRTC or a WebSocket interface.\n',
  type: 'other',
  playground_url: '/playground/realtime',
  snapshots: [
    'gpt-4o-mini-realtime-preview-2024-12-17',
  ],
  rate_limits: {
    tier_1: {
      rpm: 200,
      rpd: 1e3,
      tpm: 4e4,
    },
    tier_2: {
      rpm: 400,
      tpm: 2e5,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 4e6,
    },
    tier_5: {
      rpm: 2e4,
      tpm: 15e6,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_mini_realtime_preview_2024_12_17_spec = {
  name: 'gpt-4o-mini-realtime-preview-2024-12-17',
  slug: 'gpt-4o-mini-realtime-preview-2024-12-17',
  performance: 2,
  latency: 5,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'function_calling',
    'prompt_caching',
  ],
  supported_endpoints: [
    'realtime',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_mini_realtime_preview_2024_12_17_spec as 'gpt-4o-mini-realtime-preview-2024-12-17'}

// alias:
export { gpt_4o_mini_realtime_preview_2024_12_17_spec as 'gpt-4o-mini-realtime-preview' };

const gpt_4o_mini_search_preview_config = {
  name: 'gpt-4o-mini-search-preview',
  slug: 'gpt-4o-mini-search-preview',
  display_name: 'GPT-4o mini Search Preview',
  current_snapshot: 'gpt-4o-mini-search-preview-2025-03-11',
  tagline: 'Fast, affordable small model for web search',
  description: 'GPT-4o mini Search Preview is a specialized model trained to understand and execute [web search](/docs/guides/tools-web-search?api-mode=chat) queries with the Chat Completions API. In addition to token fees, web search queries have a fee per tool call. Learn more in the [pricing](/docs/pricing) page.\n',
  type: 'other',
  snapshots: [
    'gpt-4o-mini-search-preview-2025-03-11',
  ],
  compare_prices: [
    'gpt-4o',
    'gpt-4o-mini',
  ],
  examples: null,
  rate_limits: {
    free: {
      rpm: 3,
      rpd: 200,
      tpm: 4e4,
    },
    tier_1: {
      rpm: 500,
      rpd: 1e4,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 2e6,
      batch_queue_limit: 2e7,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e6,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 3e4,
      tpm: 15e7,
      batch_queue_limit: 15e9,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_mini_search_preview_2025_03_11_spec = {
  name: 'gpt-4o-mini-search-preview-2025-03-11',
  slug: 'gpt-4o-mini-search-preview-2025-03-11',
  performance: 2,
  latency: 4,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'structured_outputs',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4o_mini_search_preview_2025_03_11_spec as 'gpt-4o-mini-search-preview-2025-03-11'}

// alias:
export { gpt_4o_mini_search_preview_2025_03_11_spec as 'gpt-4o-mini-search-preview' };

const gpt_4o_mini_transcribe_config = {
  name: 'gpt-4o-mini-transcribe',
  slug: 'gpt-4o-mini-transcribe',
  display_name: 'GPT-4o mini Transcribe',
  current_snapshot: 'gpt-4o-mini-transcribe',
  tagline: 'Speech-to-text model powered by GPT-4o mini',
  description: 'GPT-4o mini Transcribe is a speech-to-text model that uses GPT-4o mini to transcribe audio.\nIt offers improvements to word error rate and better language recognition and accuracy compared to original Whisper models. Use it for more accurate transcripts.\n',
  type: 'other',
  snapshots: [
    'gpt-4o-mini-transcribe',
  ],
  compare_prices: [
    'whisper-1',
    'gpt-4o-mini',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 5e4,
    },
    tier_2: {
      rpm: 2e3,
      tpm: 15e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 6e5,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 8e6,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_mini_transcribe_spec = {
  name: 'gpt-4o-mini-transcribe',
  slug: 'gpt-4o-mini-transcribe',
  performance: 3,
  latency: 4,
  modalities: {
    input: [
      'audio',
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 16e3,
  max_output_tokens: 2e3,
  knowledge_cutoff: new Date(17172e8),
  supported_endpoints: [
    'transcription',
    'realtime',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4o_mini_transcribe_spec as 'gpt-4o-mini-transcribe'}

const gpt_4o_mini_tts_config = {
  name: 'gpt-4o-mini-tts',
  slug: 'gpt-4o-mini-tts',
  display_name: 'GPT-4o mini TTS',
  current_snapshot: 'gpt-4o-mini-tts',
  tagline: 'Text-to-speech model powered by GPT-4o mini',
  description: 'GPT-4o mini TTS is a text-to-speech model built on GPT-4o mini, a fast and powerful language model. Use it to convert text to natural sounding spoken text. The maximum number of input tokens is 2000.\n',
  type: 'other',
  playground_url: '/playground/tts',
  snapshots: [
    'gpt-4o-mini-tts',
  ],
  compare_prices: [
    'gpt-4o-mini-realtime-preview',
    'gpt-4o-realtime-preview',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 5e4,
    },
    tier_2: {
      rpm: 2e3,
      tpm: 15e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 6e5,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 8e6,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_mini_tts_spec = {
  name: 'gpt-4o-mini-tts',
  slug: 'gpt-4o-mini-tts',
  performance: 4,
  latency: 4,
  current_snapshot: 'gpt-4o-mini-tts',
  modalities: {
    input: [
      'text',
    ],
    output: [
      'audio',
    ],
  },
  supported_endpoints: [
    'speech_generation',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4o_mini_tts_spec as 'gpt-4o-mini-tts'}

const gpt_4o_mini_config = {
  name: 'gpt-4o-mini',
  slug: 'gpt-4o-mini',
  display_name: 'GPT-4o mini',
  current_snapshot: 'gpt-4o-mini-2024-07-18',
  tagline: 'Fast, affordable small model for focused tasks',
  description: 'GPT-4o mini (“o” for “omni”) is a fast, affordable small model for focused tasks. \nIt accepts both text and image inputs, and produces text outputs (including Structured Outputs). \nIt is ideal for fine-tuning, and model outputs from a larger model like GPT-4o can be distilled to GPT-4o-mini to produce similar results at lower cost and latency.\n',
  type: 'chat',
  snapshots: [
    'gpt-4o-mini-2024-07-18',
  ],
  compare_prices: [
    'gpt-4o',
    'o3-mini',
  ],
  examples: [
    'classification',
    'keywords_search',
    'translation',
    'extract_tags',
  ],
  supported_tools: [
    'function_calling',
    'web_search',
    'file_search',
    'image_generation',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: {
    free: {
      rpm: 3,
      rpd: 200,
      tpm: 4e4,
    },
    tier_1: {
      rpm: 500,
      rpd: 1e4,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 2e6,
      batch_queue_limit: 2e7,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e6,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 3e4,
      tpm: 15e7,
      batch_queue_limit: 15e9,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_mini_2024_07_18_spec = {
  name: 'gpt-4o-mini-2024-07-18',
  slug: 'gpt-4o-mini-2024-07-18',
  performance: 2,
  latency: 4,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'function_calling',
    'fine_tuning',
    'file_search',
    'file_uploads',
    'web_search',
    'structured_outputs',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4o_mini_2024_07_18_spec as 'gpt-4o-mini-2024-07-18'}

// alias:
export { gpt_4o_mini_2024_07_18_spec as 'gpt-4o-mini' };

const gpt_4o_realtime_preview_config = {
  name: 'gpt-4o-realtime-preview',
  slug: 'gpt-4o-realtime-preview',
  display_name: 'GPT-4o Realtime',
  current_snapshot: 'gpt-4o-realtime-preview-2024-12-17',
  tagline: 'Model capable of realtime text and audio inputs and outputs',
  description: 'This is a preview release of the GPT-4o Realtime model, capable of responding to audio and text inputs in realtime over WebRTC or a WebSocket interface.\n',
  type: 'other',
  playground_url: '/playground/realtime',
  snapshots: [
    'gpt-4o-realtime-preview-2025-06-03',
    'gpt-4o-realtime-preview-2024-12-17',
    'gpt-4o-realtime-preview-2024-10-01',
  ],
  rate_limits: {
    tier_1: {
      rpm: 200,
      rpd: 1e3,
      tpm: 4e4,
    },
    tier_2: {
      rpm: 400,
      tpm: 2e5,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 4e6,
    },
    tier_5: {
      rpm: 2e4,
      tpm: 15e6,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_realtime_preview_2025_06_03_spec = {
  name: 'gpt-4o-realtime-preview-2025-06-03',
  slug: 'gpt-4o-realtime-preview-2025-06-03',
  performance: 3,
  latency: 4,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'function_calling',
    'prompt_caching',
  ],
  supported_endpoints: [
    'realtime',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_realtime_preview_2025_06_03_spec as 'gpt-4o-realtime-preview-2025-06-03'}

const gpt_4o_realtime_preview_2024_12_17_spec = {
  name: 'gpt-4o-realtime-preview-2024-12-17',
  slug: 'gpt-4o-realtime-preview-2024-12-17',
  performance: 3,
  latency: 4,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'function_calling',
    'prompt_caching',
  ],
  supported_endpoints: [
    'realtime',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_realtime_preview_2024_12_17_spec as 'gpt-4o-realtime-preview-2024-12-17'}

const gpt_4o_realtime_preview_2024_10_01_spec = {
  name: 'gpt-4o-realtime-preview-2024-10-01',
  slug: 'gpt-4o-realtime-preview-2024-10-01',
  performance: 2,
  latency: 4,
  modalities: {
    input: [
      'text',
      'audio',
    ],
    output: [
      'text',
      'audio',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'function_calling',
    'prompt_caching',
  ],
  supported_endpoints: [
    'realtime',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_realtime_preview_2024_10_01_spec as 'gpt-4o-realtime-preview-2024-10-01'}

// alias:
export { gpt_4o_realtime_preview_2024_12_17_spec as 'gpt-4o-realtime-preview' };

const gpt_4o_search_preview_config = {
  name: 'gpt-4o-search-preview',
  slug: 'gpt-4o-search-preview',
  display_name: 'GPT-4o Search Preview',
  current_snapshot: 'gpt-4o-search-preview-2025-03-11',
  tagline: 'GPT model for web search in Chat Completions',
  description: 'GPT-4o Search Preview is a specialized model trained to understand and execute [web search](/docs/guides/tools-web-search?api-mode=chat) queries with the Chat Completions API. In addition to token fees, web search queries have a fee per tool call. Learn more in the [pricing](/docs/pricing) page.\n',
  type: 'other',
  snapshots: [
    'gpt-4o-search-preview-2025-03-11',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'gpt-4o',
  ],
  examples: null,
  rate_limits: {
    tier_1: {
      rpm: 100,
      tpm: 3e4,
      batch_queue_limit: 0,
    },
    tier_2: {
      rpm: 500,
      tpm: 45e3,
      batch_queue_limit: 0,
    },
    tier_3: {
      rpm: 500,
      tpm: 8e4,
      batch_queue_limit: 0,
    },
    tier_4: {
      rpm: 1e3,
      tpm: 2e5,
      batch_queue_limit: 0,
    },
    tier_5: {
      rpm: 1e3,
      tpm: 3e6,
      batch_queue_limit: 0,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_search_preview_2025_03_11_spec = {
  name: 'gpt-4o-search-preview-2025-03-11',
  slug: 'gpt-4o-search-preview-2025-03-11',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'structured_outputs',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_search_preview_2025_03_11_spec as 'gpt-4o-search-preview-2025-03-11'}

// alias:
export { gpt_4o_search_preview_2025_03_11_spec as 'gpt-4o-search-preview' };

const gpt_4o_transcribe_config = {
  name: 'gpt-4o-transcribe',
  slug: 'gpt-4o-transcribe',
  display_name: 'GPT-4o Transcribe',
  current_snapshot: 'gpt-4o-transcribe',
  tagline: 'Speech-to-text model powered by GPT-4o',
  description: 'GPT-4o Transcribe is a speech-to-text model that uses GPT-4o to transcribe audio.\nIt offers improvements to word error rate and better language recognition and accuracy compared to original Whisper models. Use it for more accurate transcripts.\n',
  type: 'other',
  snapshots: [
    'gpt-4o-transcribe',
  ],
  compare_prices: [
    'whisper-1',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 1e4,
    },
    tier_2: {
      rpm: 2e3,
      tpm: 1e5,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e5,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 6e6,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_transcribe_spec = {
  name: 'gpt-4o-transcribe',
  slug: 'gpt-4o-transcribe',
  performance: 4,
  latency: 3,
  modalities: {
    input: [
      'audio',
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 16e3,
  max_output_tokens: 2e3,
  knowledge_cutoff: new Date(17172e8),
  supported_endpoints: [
    'transcription',
    'realtime',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4o_transcribe_spec as 'gpt-4o-transcribe'}

const gpt_4o_config = {
  name: 'gpt-4o',
  slug: 'gpt-4o',
  display_name: 'GPT-4o',
  current_snapshot: 'gpt-4o-2024-08-06',
  tagline: 'Fast, intelligent, flexible GPT model',
  description: 'GPT-4o (“o” for “omni”) is our versatile, high-intelligence flagship model.\nIt accepts both text and image inputs, and produces text outputs (including Structured Outputs).\nIt is the best model for most tasks, and is our most capable model outside of our o-series models.\n',
  type: 'chat',
  snapshots: [
    'gpt-4o-2024-11-20',
    'gpt-4o-2024-08-06',
    'gpt-4o-2024-05-13',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o3-mini',
  ],
  examples: [
    'math_tutor',
    'travel_assistant',
    'clothing_recommendation',
    'recipe_generation',
  ],
  supported_tools: [
    'function_calling',
    'web_search',
    'file_search',
    'image_generation',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const gpt_4o_2024_11_20_spec = {
  name: 'gpt-4o-2024-11-20',
  slug: 'gpt-4o-2024-11-20',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'structured_outputs',
    'predicted_outputs',
    'distillation',
    'function_calling',
    'file_search',
    'file_uploads',
    'image_input',
    'web_search',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_2024_11_20_spec as 'gpt-4o-2024-11-20'}

const gpt_4o_2024_08_06_spec = {
  name: 'gpt-4o-2024-08-06',
  slug: 'gpt-4o-2024-08-06',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 16_384,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'structured_outputs',
    'predicted_outputs',
    'distillation',
    'file_search',
    'file_uploads',
    'fine_tuning',
    'function_calling',
    'image_input',
    'web_search',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: false,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {gpt_4o_2024_08_06_spec as 'gpt-4o-2024-08-06'}

const gpt_4o_2024_05_13_spec = {
  name: 'gpt-4o-2024-05-13',
  slug: 'gpt-4o-2024-05-13',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 4_096,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'function_calling',
    'fine_tuning',
    'file_search',
    'file_uploads',
    'image_input',
    'web_search',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_4o_2024_05_13_spec as 'gpt-4o-2024-05-13'}

// alias:
export { gpt_4o_2024_08_06_spec as 'gpt-4o' };

const gpt_image_1_config = {
  name: 'gpt-image-1',
  slug: 'gpt-image-1',
  display_name: 'GPT Image 1',
  current_snapshot: 'gpt-image-1',
  tagline: 'State-of-the-art image generation model',
  description: 'GPT Image 1 is our new state-of-the-art image generation model. It is a natively multimodal language model that accepts both text and image inputs, and produces image outputs.\n',
  type: 'other',
  snapshots: [
    'gpt-image-1',
  ],
  playground_url: '/playground/images',
  rate_limits: {
    tier_1: {
      tpm: 1e5,
      ipm: 5,
    },
    tier_2: {
      tpm: 25e4,
      ipm: 20,
    },
    tier_3: {
      tpm: 8e5,
      ipm: 50,
    },
    tier_4: {
      tpm: 3e6,
      ipm: 150,
    },
    tier_5: {
      tpm: 8e6,
      ipm: 250,
    },
  },
} as const satisfies ModelConfig

const gpt_image_1_spec = {
  name: 'gpt-image-1',
  slug: 'gpt-image-1',
  performance: 4,
  latency: 1,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'image',
    ],
  },
  supported_endpoints: [
    'image_generation',
    'image_edit',
  ],
  supported_features: [
    'inpainting',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {gpt_image_1_spec as 'gpt-image-1'}

const o1_mini_config = {
  name: 'o1-mini',
  slug: 'o1-mini',
  current_snapshot: 'o1-mini-2024-09-12',
  tagline: 'A small model alternative to o1',
  description: 'The o1 reasoning model is designed to solve hard problems across domains. o1-mini is a faster and more affordable reasoning model, but we recommend using the newer o3-mini model that features higher intelligence at the same latency and price as o1-mini.\n',
  type: 'reasoning',
  snapshots: [
    'o1-mini-2024-09-12',
  ],
  compare_prices: [
    'o1',
    'o3-mini',
  ],
  point_to: 'o3-mini',
  deprecated: true,
  supported_tools: [
    'file_search',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 2e5,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 2e6,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e6,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 3e4,
      tpm: 15e7,
      batch_queue_limit: 15e9,
    },
  },
} as const satisfies ModelConfig

const o1_mini_2024_09_12_spec = {
  name: 'o1-mini-2024-09-12',
  slug: 'o1-mini-2024-09-12',
  performance: 3,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 65_536,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'file_search',
    'file_uploads',
  ],
  supported_endpoints: [
    'chat_completions',
    'assistants',
  ],
  reasoning_tokens: true,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {o1_mini_2024_09_12_spec as 'o1-mini-2024-09-12'}

// alias:
export { o1_mini_2024_09_12_spec as 'o1-mini' };

const o1_preview_config = {
  name: 'o1-preview',
  slug: 'o1-preview',
  display_name: 'o1 Preview',
  current_snapshot: 'o1-preview-2024-09-12',
  tagline: 'Preview of our first o-series reasoning model',
  description: 'Research preview of the o1 series of models, trained with reinforcement learning to perform complex reasoning. o1 models think before they answer, producing a long internal chain of thought before responding to the user.\n',
  type: 'reasoning',
  snapshots: [
    'o1-preview-2024-09-12',
  ],
  compare_prices: [
    'o1',
    'o3-mini',
  ],
  point_to: 'o1',
  deprecated: true,
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const o1_preview_2024_09_12_spec = {
  name: 'o1-preview-2024-09-12',
  slug: 'o1-preview-2024-09-12',
  performance: 3,
  latency: 1,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 128e3,
  max_output_tokens: 32_768,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'structured_outputs',
    'file_search',
    'function_calling',
    'file_uploads',
  ],
  supported_endpoints: [
    'chat_completions',
    'assistants',
  ],
  reasoning_tokens: true,
  price_data: {
    main: {
      input: 10,
      output: 30,
    },
    batch: {
      input: 5,
      output: 15,
    },
  },
} as const satisfies ModelSpec
export {o1_preview_2024_09_12_spec as 'o1-preview-2024-09-12'}

// alias:
export { o1_preview_2024_09_12_spec as 'o1-preview' };

const o1_pro_config = {
  name: 'o1-pro',
  slug: 'o1-pro',
  current_snapshot: 'o1-pro-2025-03-19',
  tagline: 'Version of o1 with more compute for better responses',
  description: 'The o1 series of models are trained with reinforcement learning to think \nbefore they answer and perform complex reasoning. The o1-pro model uses more \ncompute to think harder and provide consistently better answers.\n\no1-pro is available in the [Responses API only](/docs/api-reference/responses)\nto enable support for multi-turn model interactions before responding to API\nrequests, and other advanced API features in the future.\n',
  type: 'reasoning',
  snapshots: [
    'o1-pro-2025-03-19',
  ],
  compare_prices: [
    'o1',
    'o3-mini',
  ],
  supported_tools: [
    'function_calling',
    'file_search',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const o1_pro_2025_03_19_spec = {
  name: 'o1-pro-2025-03-19',
  slug: 'o1-pro-2025-03-19',
  performance: 4,
  latency: 1,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 2e5,
  max_output_tokens: 1e5,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'structured_outputs',
    'function_calling',
    'image_input',
  ],
  supported_endpoints: [
    'responses',
    'batch',
  ],
  reasoning_tokens: true,
  price_data: {
    main: {
      input: 150,
      output: 600,
    },
    batch: {
      input: 75,
      output: 300,
    },
  },
} as const satisfies ModelSpec
export {o1_pro_2025_03_19_spec as 'o1-pro-2025-03-19'}

// alias:
export { o1_pro_2025_03_19_spec as 'o1-pro' };

const o1_config = {
  name: 'o1',
  slug: 'o1',
  current_snapshot: 'o1-2024-12-17',
  tagline: 'Previous full o-series reasoning model',
  description: 'The o1 series of models are trained with reinforcement learning to perform complex reasoning. o1 models think before they answer, producing a long internal chain of thought before responding to the user.\n',
  type: 'reasoning',
  snapshots: [
    'o1-2024-12-17',
  ],
  compare_prices: [
    'o1-mini',
    'o3-mini',
  ],
  grouped_models: [
    'o1-preview',
  ],
  supported_tools: [
    'function_calling',
    'file_search',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const o1_2024_12_17_spec = {
  name: 'o1-2024-12-17',
  slug: 'o1-2024-12-17',
  performance: 4,
  latency: 1,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 2e5,
  max_output_tokens: 1e5,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'structured_outputs',
    'file_search',
    'function_calling',
    'file_uploads',
    'image_input',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
  ],
  reasoning_tokens: true,
  price_data: {
    main: {
      input: 15,
      cached_output: 7.5,
      output: 60,
    },
    batch: {
      input: 7.5,
      output: 30,
    },
  },
} as const satisfies ModelSpec
export {o1_2024_12_17_spec as 'o1-2024-12-17'}

// alias:
export { o1_2024_12_17_spec as 'o1' };

const o3_mini_config = {
  name: 'o3-mini',
  slug: 'o3-mini',
  current_snapshot: 'o3-mini-2025-01-31',
  tagline: 'A small model alternative to o3',
  description: 'o3-mini is our newest small reasoning model, providing high intelligence at the same cost and latency targets of o1-mini. o3-mini supports key developer features, like Structured Outputs, function calling, and Batch API.\n',
  type: 'reasoning',
  snapshots: [
    'o3-mini-2025-01-31',
  ],
  compare_prices: [
    'gpt-4o-mini',
    'o1-mini',
  ],
  examples: [
    'landing_page_generation',
    'analyze_policy',
    'text_to_sql',
    'graph_entity_extraction',
  ],
  supported_tools: [
    'function_calling',
    'file_search',
    'code_interpreter',
    'mcp',
    'image_generation',
  ],
  rate_limits: {
    tier_1: {
      rpm: 1e3,
      tpm: 1e5,
      batch_queue_limit: 1e6,
    },
    tier_2: {
      rpm: 2e3,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e6,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 3e4,
      tpm: 15e7,
      batch_queue_limit: 15e9,
    },
  },
} as const satisfies ModelConfig

const o3_mini_2025_01_31_spec = {
  name: 'o3-mini-2025-01-31',
  slug: 'o3-mini-2025-01-31',
  performance: 4,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  context_window: 2e5,
  max_output_tokens: 1e5,
  knowledge_cutoff: new Date(16961184e5),
  supported_features: [
    'streaming',
    'structured_outputs',
    'function_calling',
    'file_search',
    'file_uploads',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'assistants',
    'batch',
  ],
  reasoning_tokens: true,
} as const satisfies ModelSpec
export {o3_mini_2025_01_31_spec as 'o3-mini-2025-01-31'}

// alias:
export { o3_mini_2025_01_31_spec as 'o3-mini' };

const o3_pro_config = {
  name: 'o3-pro',
  slug: 'o3-pro',
  current_snapshot: 'o3-pro-2025-06-10',
  tagline: 'Version of o3 with more compute for better responses',
  description: 'The o-series of models are trained with reinforcement learning to think \nbefore they answer and perform complex reasoning. The o3-pro model uses more \ncompute to think harder and provide consistently better answers.\n\no3-pro is available in the [Responses API only](/docs/api-reference/responses)\nto enable support for multi-turn model interactions before responding to API \nrequests, and other advanced API features in the future. Since o3-pro is designed \nto tackle tough problems, some requests may take several minutes to finish. \nTo avoid timeouts, try using [background mode](/docs/guides/background).\n',
  type: 'reasoning',
  snapshots: [
    'o3-pro-2025-06-10',
  ],
  compare_prices: [
    'o3',
    'o3-mini',
  ],
  supported_tools: [
    'function_calling',
    'file_search',
    'image_generation',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const o3_pro_2025_06_10_spec = {
  name: 'o3-pro-2025-06-10',
  slug: 'o3-pro-2025-06-10',
  performance: 5,
  latency: 1,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 2e5,
  max_output_tokens: 1e5,
  knowledge_cutoff: new Date(17172e8),
  supported_features: [
    'structured_outputs',
    'function_calling',
    'image_input',
  ],
  supported_endpoints: [
    'responses',
    'batch',
  ],
  reasoning_tokens: true,
  price_data: {
    main: {
      input: 20,
      output: 80,
    },
    batch: {
      input: 10,
      output: 40,
    },
  },
} as const satisfies ModelSpec
export {o3_pro_2025_06_10_spec as 'o3-pro-2025-06-10'}

// alias:
export { o3_pro_2025_06_10_spec as 'o3-pro' };

const o3_config = {
  name: 'o3',
  slug: 'o3',
  current_snapshot: 'o3-2025-04-16',
  tagline: 'Our most powerful reasoning model',
  description: 'o3 is a well-rounded and powerful model across domains. It sets a new standard for math, science, coding, and visual reasoning tasks. It also excels at technical writing and instruction-following. Use it to think through multi-step problems that involve analysis across text, code, and images. \n\nLearn more about how to use our reasoning models in our [reasoning](/docs/guides/reasoning?api-mode=responses) guide.\n',
  type: 'reasoning',
  snapshots: [
    'o3-2025-04-16',
  ],
  compare_prices: [
    'o1',
    'o4-mini',
  ],
  supported_tools: [
    'function_calling',
    'file_search',
    'image_generation',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 500,
      tpm: 3e4,
      batch_queue_limit: 9e4,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 45e4,
      batch_queue_limit: 135e4,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 8e5,
      batch_queue_limit: 5e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 2e6,
      batch_queue_limit: 2e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 3e7,
      batch_queue_limit: 5e9,
    },
  },
} as const satisfies ModelConfig

const o3_2025_04_16_spec = {
  name: 'o3-2025-04-16',
  slug: 'o3-2025-04-16',
  performance: 5,
  latency: 1,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 2e5,
  max_output_tokens: 1e5,
  knowledge_cutoff: new Date(17172e8),
  supported_features: [
    'streaming',
    'structured_outputs',
    'file_search',
    'function_calling',
    'file_uploads',
    'image_input',
    'prompt_caching',
    'evals',
    'stored_completions',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'batch',
  ],
  reasoning_tokens: true,
  price_data: {
    main: {
      input: 2,
      cached_output: .5,
      output: 8,
    },
    batch: {
      input: 1,
      output: 4,
    },
  },
} as const satisfies ModelSpec
export {o3_2025_04_16_spec as 'o3-2025-04-16'}

// alias:
export { o3_2025_04_16_spec as 'o3' };

const o4_mini_config = {
  name: 'o4-mini',
  slug: 'o4-mini',
  current_snapshot: 'o4-mini-2025-04-16',
  tagline: 'Faster, more affordable reasoning model',
  description: 'o4-mini is our latest small o-series model. It\'s optimized for fast, effective reasoning with exceptionally efficient performance in coding and visual tasks. \n\nLearn more about how to use our reasoning models in our [reasoning](/docs/guides/reasoning?api-mode=responses) guide.\n',
  type: 'reasoning',
  snapshots: [
    'o4-mini-2025-04-16',
  ],
  compare_prices: [
    'o3',
    'o3-mini',
  ],
  supported_tools: [
    'function_calling',
    'file_search',
    'code_interpreter',
    'mcp',
  ],
  rate_limits: {
    tier_1: {
      rpm: 1e3,
      tpm: 1e5,
      batch_queue_limit: 1e6,
    },
    tier_2: {
      rpm: 2e3,
      tpm: 2e5,
      batch_queue_limit: 2e6,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 4e6,
      batch_queue_limit: 4e7,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 1e9,
    },
    tier_5: {
      rpm: 3e4,
      tpm: 15e7,
      batch_queue_limit: 15e9,
    },
  },
} as const satisfies ModelConfig

const o4_mini_2025_04_16_spec = {
  name: 'o4-mini-2025-04-16',
  slug: 'o4-mini-2025-04-16',
  performance: 4,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  context_window: 2e5,
  max_output_tokens: 1e5,
  knowledge_cutoff: new Date(17172e8),
  supported_features: [
    'streaming',
    'structured_outputs',
    'function_calling',
    'file_search',
    'file_uploads',
    'image_input',
    'prompt_caching',
    'evals',
    'stored_completions',
    'fine_tuning',
  ],
  supported_endpoints: [
    'chat_completions',
    'responses',
    'batch',
    'fine_tuning',
  ],
  reasoning_tokens: true,
} as const satisfies ModelSpec
export {o4_mini_2025_04_16_spec as 'o4-mini-2025-04-16'}

// alias:
export { o4_mini_2025_04_16_spec as 'o4-mini' };

const omni_moderation_latest_config = {
  name: 'omni-moderation-latest',
  display_name: 'omni-moderation',
  slug: 'omni-moderation-latest',
  current_snapshot: 'omni-moderation-2024-09-26',
  tagline: 'Identify potentially harmful content in text and images',
  description: 'Moderation models are free models designed to detect harmful content.\nThis model is our most capable moderation model, accepting images as input as well.\n',
  type: 'other',
  snapshots: [
    'omni-moderation-2024-09-26',
  ],
  rate_limits: {
    free: {
      rpm: 250,
      rpd: 5e3,
      tpm: 1e4,
    },
    tier_1: {
      rpm: 500,
      rpd: 1e4,
      tpm: 1e4,
    },
    tier_2: {
      rpm: 500,
      tpm: 2e4,
    },
    tier_3: {
      rpm: 1e3,
      tpm: 5e4,
    },
    tier_4: {
      rpm: 2e3,
      tpm: 25e4,
    },
    tier_5: {
      rpm: 5e3,
      tpm: 5e5,
    },
  },
} as const satisfies ModelConfig

const omni_moderation_2024_09_26_spec = {
  name: 'omni-moderation-2024-09-26',
  slug: 'omni-moderation-2024-09-26',
  performance: 3,
  latency: 3,
  modalities: {
    input: [
      'text',
      'image',
    ],
    output: [
      'text',
    ],
  },
  supported_endpoints: [
    'moderation',
  ],
  reasoning_tokens: false,
  supported_features: [
    'image_input',
  ],
} as const satisfies ModelSpec
export {omni_moderation_2024_09_26_spec as 'omni-moderation-2024-09-26'}

// alias:
export { omni_moderation_2024_09_26_spec as 'omni-moderation-latest' };

const text_embedding_3_large_config = {
  name: 'text-embedding-3-large',
  slug: 'text-embedding-3-large',
  current_snapshot: 'text-embedding-3-large',
  tagline: 'Most capable embedding model',
  description: 'text-embedding-3-large is our most capable embedding model for both english and non-english tasks.\nEmbeddings are a numerical representation of text that can be used to measure the relatedness between two pieces of text.\nEmbeddings are useful for search, clustering, recommendations, anomaly detection, and classification tasks.\n',
  type: 'other',
  snapshots: [
    'text-embedding-3-large',
  ],
  compare_prices: [
    'text-embedding-3-small',
  ],
  rate_limits: {
    free: {
      rpm: 100,
      rpd: 2e3,
      tpm: 4e4,
    },
    tier_1: {
      rpm: 3e3,
      tpm: 1e6,
      batch_queue_limit: 3e6,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 1e6,
      batch_queue_limit: 2e7,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 5e6,
      batch_queue_limit: 1e8,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 5e6,
      batch_queue_limit: 5e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 4e9,
    },
  },
} as const satisfies ModelConfig

const text_embedding_3_large_spec = {
  name: 'text-embedding-3-large',
  slug: 'text-embedding-3-large',
  performance: 3,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  supported_endpoints: [
    'embeddings',
    'batch',
  ],
} as const satisfies ModelSpec
export {text_embedding_3_large_spec as 'text-embedding-3-large'}

const text_embedding_3_small_config = {
  name: 'text-embedding-3-small',
  slug: 'text-embedding-3-small',
  current_snapshot: 'text-embedding-3-small',
  tagline: 'Small embedding model',
  description: 'text-embedding-3-small is our improved, more performant version of our ada embedding model.\nEmbeddings are a numerical representation of text that can be used to measure the relatedness between two pieces of text.\nEmbeddings are useful for search, clustering, recommendations, anomaly detection, and classification tasks.\n',
  type: 'other',
  snapshots: [
    'text-embedding-3-small',
  ],
  compare_prices: [
    'text-embedding-3-large',
  ],
  rate_limits: {
    free: {
      rpm: 100,
      rpd: 2e3,
      tpm: 4e4,
    },
    tier_1: {
      rpm: 3e3,
      tpm: 1e6,
      batch_queue_limit: 3e6,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 1e6,
      batch_queue_limit: 2e7,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 5e6,
      batch_queue_limit: 1e8,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 5e6,
      batch_queue_limit: 5e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 4e9,
    },
  },
} as const satisfies ModelConfig

const text_embedding_3_small_spec = {
  name: 'text-embedding-3-small',
  slug: 'text-embedding-3-small',
  performance: 2,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  supported_endpoints: [
    'embeddings',
    'batch',
  ],
} as const satisfies ModelSpec
export {text_embedding_3_small_spec as 'text-embedding-3-small'}

const text_embedding_ada_002_config = {
  name: 'text-embedding-ada-002',
  slug: 'text-embedding-ada-002',
  current_snapshot: 'text-embedding-ada-002',
  tagline: 'Older embedding model',
  description: 'text-embedding-ada-002 is our improved, more performant version of our ada embedding model.\nEmbeddings are a numerical representation of text that can be used to measure the relatedness between two pieces of text.\nEmbeddings are useful for search, clustering, recommendations, anomaly detection, and classification tasks.\n',
  type: 'other',
  snapshots: [
    'text-embedding-ada-002',
  ],
  compare_prices: [
    'text-embedding-3-small',
  ],
  rate_limits: {
    free: {
      rpm: 100,
      rpd: 2e3,
      tpm: 4e4,
    },
    tier_1: {
      rpm: 3e3,
      tpm: 1e6,
      batch_queue_limit: 3e6,
    },
    tier_2: {
      rpm: 5e3,
      tpm: 1e6,
      batch_queue_limit: 2e7,
    },
    tier_3: {
      rpm: 5e3,
      tpm: 5e6,
      batch_queue_limit: 1e8,
    },
    tier_4: {
      rpm: 1e4,
      tpm: 5e6,
      batch_queue_limit: 5e8,
    },
    tier_5: {
      rpm: 1e4,
      tpm: 1e7,
      batch_queue_limit: 4e9,
    },
  },
} as const satisfies ModelConfig

const text_embedding_ada_002_spec = {
  name: 'text-embedding-ada-002',
  slug: 'text-embedding-ada-002',
  performance: 1,
  latency: 2,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  supported_endpoints: [
    'embeddings',
    'batch',
  ],
} as const satisfies ModelSpec
export {text_embedding_ada_002_spec as 'text-embedding-ada-002'}

const text_moderation_latest_config = {
  name: 'text-moderation-latest',
  display_name: 'text-moderation',
  slug: 'text-moderation-latest',
  current_snapshot: 'text-moderation-007',
  tagline: 'Previous generation text-only moderation model',
  type: 'other',
  point_to: 'omni-moderation',
  deprecated: true,
  snapshots: [
    'text-moderation-007',
  ],
  grouped_models: [
    'text-moderation-stable',
  ],
  description: 'Moderation models are free models designed to detect harmful content. This is our text only moderation model; we expect omni-moderation-* models to be the best default moving forward.\n',
} as const satisfies ModelConfig

const text_moderation_007_spec = {
  name: 'text-moderation-007',
  slug: 'text-moderation-007',
  performance: 2,
  latency: 3,
  modalities: {
    input: [
      'text',
    ],
    output: [
      'text',
    ],
  },
  max_output_tokens: 32_768,
  knowledge_cutoff: new Date(16304544e5),
  supported_endpoints: [
    'moderation',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {text_moderation_007_spec as 'text-moderation-007'}

// alias:
export { text_moderation_007_spec as 'text-moderation-latest' };

const text_moderation_stable_config = {
  name: 'text-moderation-stable',
  slug: 'text-moderation-stable',
  current_snapshot: 'text-moderation-007',
  tagline: 'Previous generation text-only moderation model',
  type: 'other',
  point_to: 'omni-moderation',
  deprecated: true,
  snapshots: [
    'text-moderation-007',
  ],
  description: 'Moderation models are free models designed to detect harmful content. This is our text only moderation model; we expect omni-moderation-* models to be the best default moving forward.\n',
} as const satisfies ModelConfig

// alias:
export { text_moderation_007_spec as 'text-moderation-stable' };

const tts_1_hd_config = {
  name: 'tts-1-hd',
  slug: 'tts-1-hd',
  display_name: 'TTS-1 HD',
  current_snapshot: 'tts-1-hd',
  tagline: 'Text-to-speech model optimized for quality',
  description: 'TTS is a model that converts text to natural sounding spoken text. The tts-1-hd model is optimized for high quality text-to-speech use cases. Use it with the Speech endpoint in the Audio API.\n',
  type: 'other',
  playground_url: '/playground/tts',
  snapshots: [
    'tts-1-hd',
  ],
  compare_prices: [
    'tts-1',
    'gpt-4o-mini-realtime-preview',
  ],
  rate_limits: {
    free: null,
    tier_1: {
      rpm: 500,
    },
    tier_2: {
      rpm: 25e2,
    },
    tier_3: {
      rpm: 5e3,
    },
    tier_4: {
      rpm: 75e2,
    },
    tier_5: {
      rpm: 1e4,
    },
  },
} as const satisfies ModelConfig

const tts_1_hd_spec = {
  name: 'tts-1-hd',
  slug: 'tts-1-hd',
  performance: 3,
  latency: 3,
  current_snapshot: 'tts-1-hd',
  modalities: {
    input: [
      'text',
    ],
    output: [
      'audio',
    ],
  },
  supported_endpoints: [
    'speech_generation',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {tts_1_hd_spec as 'tts-1-hd'}

const tts_1_config = {
  name: 'tts-1',
  slug: 'tts-1',
  display_name: 'TTS-1',
  current_snapshot: 'tts-1',
  tagline: 'Text-to-speech model optimized for speed',
  description: 'TTS is a model that converts text to natural sounding spoken text. The tts-1 model is optimized for realtime text-to-speech use cases. Use it with the Speech endpoint in the Audio API.\n',
  type: 'other',
  playground_url: '/playground/tts',
  snapshots: [
    'tts-1',
  ],
  compare_prices: [
    'tts-1-hd',
    'gpt-4o-mini-realtime-preview',
  ],
  rate_limits: {
    free: {
      rpm: 3,
      rpd: 200,
    },
    tier_1: {
      rpm: 500,
    },
    tier_2: {
      rpm: 25e2,
    },
    tier_3: {
      rpm: 5e3,
    },
    tier_4: {
      rpm: 75e2,
    },
    tier_5: {
      rpm: 1e4,
    },
  },
} as const satisfies ModelConfig

const tts_1_spec = {
  name: 'tts-1',
  slug: 'tts-1',
  performance: 2,
  latency: 4,
  current_snapshot: 'tts-1',
  modalities: {
    input: [
      'text',
    ],
    output: [
      'audio',
    ],
  },
  supported_endpoints: [
    'speech_generation',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {tts_1_spec as 'tts-1'}

const whisper_1_config = {
  name: 'whisper-1',
  slug: 'whisper-1',
  display_name: 'Whisper',
  current_snapshot: 'whisper-1',
  tagline: 'General-purpose speech recognition model',
  description: 'Whisper is a general-purpose speech recognition model, trained on a large dataset of diverse audio. You can also use it as a multitask model to perform multilingual speech recognition as well as speech translation and language identification.\n',
  type: 'other',
  snapshots: [
    'whisper-1',
  ],
  rate_limits: {
    free: {
      rpm: 3,
      rpd: 200,
    },
    tier_1: {
      rpm: 500,
    },
    tier_2: {
      rpm: 25e2,
    },
    tier_3: {
      rpm: 5e3,
    },
    tier_4: {
      rpm: 75e2,
    },
    tier_5: {
      rpm: 1e4,
    },
  },
} as const satisfies ModelConfig

const whisper_1_spec = {
  name: 'whisper-1',
  slug: 'whisper-1',
  performance: 2,
  latency: 3,
  modalities: {
    input: [
      'audio',
    ],
    output: [
      'text',
    ],
  },
  supported_endpoints: [
    'transcription',
    'translation',
  ],
  reasoning_tokens: false,
} as const satisfies ModelSpec
export {whisper_1_spec as 'whisper-1'}

/*
 --- Missing Models ---
 The following models were found in the pricing data but not in the main models/snapshots sources:
 - gpt-3.5-0301
 - gpt-3.5-turbo-0613
 - gpt-4-1106-preview
 - gpt-4-32k
*/
