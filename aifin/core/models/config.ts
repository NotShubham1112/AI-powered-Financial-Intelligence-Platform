/** Free-tier model tiers and routing policy */

export const FAST_INTERACTIVE_MODELS = [
  "groq/llama-3.3-70b-versatile",
  "groq/llama-3.1-8b-instant",
  "groq/openai/gpt-oss-20b",
  "groq/qwen/qwen3-32b",
] as const

export const DEEP_REASONING_MODELS = [
  "groq/llama-3.3-70b-versatile",
  "groq/meta-llama/llama-4-scout-17b-16e-instruct",
  "groq/openai/gpt-oss-120b",
] as const

export const CODING_MODELS = [
  "groq/llama-3.3-70b-versatile",
  "groq/llama-3.1-8b-instant",
  "groq/openai/gpt-oss-20b",
  "groq/qwen/qwen3-32b",
] as const

export const FALLBACK_MODELS = [
  "groq/llama-3.1-8b-instant",
  "groq/openai/gpt-oss-20b",
  "groq/qwen/qwen3-32b",
] as const

/** Models blocked for live chat / streaming UX */
export const HEAVY_MODEL_PATTERNS = [
  /nemotron/i,
  /72b/i,
  /405b/i,
  /gemma-4-26b/i,
] as const

export const DEFAULT_INTERACTIVE_MODEL = FAST_INTERACTIVE_MODELS[0]

export const GROQ_MODELS = [
  {
    id: "groq/llama-3.3-70b-versatile",
    label: "llama-3.3-70b",
    tier: "fast" as const,
    provider: "groq" as const,
    description: "Fast 70B (recommended)",
  },
  {
    id: "groq/llama-3.1-8b-instant",
    label: "llama-3.1-8b",
    tier: "fast" as const,
    provider: "groq" as const,
    description: "Low-latency 8B model",
  },
  {
    id: "groq/openai/gpt-oss-120b",
    label: "gpt-oss-120b",
    tier: "deep" as const,
    provider: "groq" as const,
    description: "OpenAI GPT OSS 120B, deep reasoning",
  },
  {
    id: "groq/openai/gpt-oss-20b",
    label: "gpt-oss-20b",
    tier: "fast" as const,
    provider: "groq" as const,
    description: "OpenAI GPT OSS 20B, fast inference",
  },
  {
    id: "groq/meta-llama/llama-4-scout-17b-16e-instruct",
    label: "llama-4-scout",
    tier: "deep" as const,
    provider: "groq" as const,
    description: "Meta Llama 4 Scout 17B",
  },
  {
    id: "groq/qwen/qwen3-32b",
    label: "qwen3.5-32b",
    tier: "fast" as const,
    provider: "groq" as const,
    description: "Qwen 3 32B, balanced performance",
  },
] as const

export const OPENROUTER_MODELS = [
  {
    id: "google/gemini-flash:free",
    label: "gemini-flash",
    tier: "fast" as const,
    provider: "openrouter" as const,
    description: "Low-latency interactive (OpenRouter)",
  },
  {
    id: "openrouter/free",
    label: "openrouter-free",
    tier: "fast" as const,
    provider: "openrouter" as const,
    description: "Auto-routed free model pool",
  },
  {
    id: "qwen/qwen3.5-plus:free",
    label: "qwen3.5-plus",
    tier: "fast" as const,
    provider: "openrouter" as const,
    description: "Fast structured reasoning",
  },
  {
    id: "mistralai/devstral-2:free",
    label: "devstral-2",
    tier: "coding" as const,
    provider: "openrouter" as const,
    description: "Code and agent workflows",
  },
] as const

export const ALL_MODELS = [...GROQ_MODELS, ...OPENROUTER_MODELS]

export type ModelTier = "fast" | "deep" | "coding" | "fallback"

export type TimeoutProfile = {
  connectMs: number
  responseMs: number
  streamIdleMs: number
  streamMaxMs: number
  heartbeatMs: number
}

export const FAST_TIMEOUTS: TimeoutProfile = {
  connectMs: 10_000,
  responseMs: 25_000,
  streamIdleMs: 15_000,
  streamMaxMs: 90_000,
  heartbeatMs: 7_000,
}

export const DEEP_TIMEOUTS: TimeoutProfile = {
  connectMs: 20_000,
  responseMs: 120_000,
  streamIdleMs: 30_000,
  streamMaxMs: 180_000,
  heartbeatMs: 10_000,
}

export const DEPRECATED_MODEL_IDS = new Set([
  "groq/llama-3.3-70b-specdec",
  "groq/deepseek-r1-distill-llama-70b",
  "groq/mixtral-8x7b-32768",
  "groq/gemma2-9b-it",
  "nvidia/nemotron-3-super:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-3-12b-it:free",
  "qwen/qwen3-4b:free",
  "deepseek/deepseek-v4-flash:free",
])

const MODEL_ALIASES: Record<string, string> = {
  "qwen/qwen3-coder:free": "groq/llama-3.1-8b-instant",
  "google/gemini-flash:free": "groq/llama-3.3-70b-versatile",
  "qwen/qwen3.5-plus:free": "groq/llama-3.3-70b-versatile",
  "mistralai/devstral-2:free": "groq/llama-3.3-70b-versatile",
}

export function isHeavyModel(modelId: string): boolean {
  return HEAVY_MODEL_PATTERNS.some((re) => re.test(modelId))
}

export function resolveModel(requested: string): string {
  if (MODEL_ALIASES[requested]) return MODEL_ALIASES[requested]
  if (DEPRECATED_MODEL_IDS.has(requested) || isHeavyModel(requested)) {
    return DEFAULT_INTERACTIVE_MODEL
  }
  return requested
}

export function getTimeoutProfile(modelId: string): TimeoutProfile {
  if (isHeavyModel(modelId)) return DEEP_TIMEOUTS
  const isDeep = (DEEP_REASONING_MODELS as readonly string[]).includes(modelId)
  return isDeep ? DEEP_TIMEOUTS : FAST_TIMEOUTS
}

export function inferQueryIntent(text: string): ModelTier {
  const q = text.toLowerCase()
  if (
    q.includes("```") ||
    q.includes("implement") ||
    q.includes("refactor") ||
    q.includes("typescript") ||
    q.includes("python")
  ) {
    return "coding"
  }
  if (
    q.length > 400 ||
    q.includes("/research") ||
    q.includes("deep dive") ||
    q.includes("comprehensive") ||
    q.includes("valuation report")
  ) {
    return "deep"
  }
  return "fast"
}