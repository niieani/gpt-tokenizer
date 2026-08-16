export type ModelKind = 'chat' | 'other' | 'reasoning'

export type RateLimitTier =
  | 'free'
  | 'tier_free'
  | 'tier_1'
  | 'tier_2'
  | 'tier_3'
  | 'tier_4'
  | 'tier_5'

export interface RateLimit {
  rpm?: number | string
  rpd?: number
  tpm?: number | string
  ipm?: number | string
  audio_min_per_min?: number | string
  batch_queue_limit?: number
}

export interface RateLimitGroup {
  name: string
  tooltip?: string
  rate_limits: Partial<Record<RateLimitTier, RateLimit>>
}

export type RateLimits =
  | Partial<Record<RateLimitTier, RateLimit | null>>
  | RateLimitGroup[]

export type SupportedTool =
  | 'function_calling'
  | 'web_search'
  | 'file_search'
  | 'image_generation'
  | 'code_interpreter'
  | 'hosted_shell'
  | 'apply_patch'
  | 'skills'
  | 'computer_use'
  | 'mcp'
  | 'tool_search'

export type SupportedFeature = Feature

export interface ModelBadge {
  label: string
  color: string
  variant: string
}

export interface ModelConfig {
  name: string
  slug?: string
  display_name?: string
  img_slug?: string
  icon_name?: string
  art_has_label?: boolean
  current_snapshot: string
  tagline?: string
  description?: string

  type: ModelKind

  supported_tools?: SupportedTool[]
  supported_features?: SupportedFeature[]
  supported_endpoints?: Endpoint[]

  snapshots: string[]
  compare_prices?: string[]
  compare_prices_columns?: string[]
  point_to?: string
  examples?: string[] | null
  grouped_models?: string[] | null
  playground_url?: string
  video_url?: string
  video_thumbnail?: string /** either a map keyed by RateLimitTier… */
  hide_pricing?: boolean
  pricing_notes?: string[]
  badge?: ModelBadge

  rate_limits?: RateLimits

  deprecated?: boolean
}

export type Modality = 'audio' | 'image' | 'text' | 'video'

export type Endpoint =
  | 'assistants'
  | 'batch'
  | 'chat_completions'
  | 'completions'
  | 'embeddings'
  | 'fine_tuning'
  | 'image_edit'
  | 'image_generation'
  | 'moderation'
  | 'realtime'
  | 'realtime_transcription'
  | 'realtime_translation'
  | 'responses'
  | 'speech_generation'
  | 'transcription'
  | 'translation'
  | 'videos'

export type Feature =
  | 'agents'
  | 'distillation'
  | 'evals'
  | 'file_search'
  | 'file_uploads'
  | 'fine_tuning'
  | 'function_calling'
  | 'image_generation'
  | 'image_input'
  | 'inpainting'
  | 'predicted_outputs'
  | 'prompt_caching'
  | 'mcp'
  | 'stored_completions'
  | 'streaming'
  | 'structured_outputs'
  | 'system_messages'
  | 'web_search'

export interface Modalities {
  input: Modality[]
  output: Modality[]
}

export interface PriceData {
  main?: {
    input?: number
    output?: number
    cached_input?: number
    cached_output?: number
  }
  batch?: {
    input?: number
    output?: number
    cached_input?: number
    cached_output?: number
  }
}

export interface ModelSpec {
  name: string
  slug?: string
  performance?: number
  latency?: number
  modalities: Modalities

  context_window?: number
  max_input_tokens?: number
  max_output_tokens?: number
  knowledge_cutoff?: Date

  supported_endpoints: Endpoint[]
  supported_features?: Feature[]
  supported_tools?: SupportedTool[]

  reasoning_tokens?: boolean
  price_data?: PriceData
  current_snapshot?: string
  deprecated?: boolean
}
