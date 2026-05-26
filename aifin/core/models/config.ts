/** Free-tier model tiers and routing policy */

export const FAST_INTERACTIVE_MODELS = [
  "google/gemini-flash:free",
  "qwen/qwen3.5-plus:free",
  "openrouter/free",
] as const

export const DEEP_REASONING_MODELS = [
  "qwen/qwen3.5-plus:free",
  "mistralai/devstral-2:free",
  "openrouter/free",
] as const

export const CODING_MODELS = [
  "mistralai/devstral-2:free",
  "qwen/qwen3.5-plus:free",
] as const

export const FALLBACK_MODELS = [
  "openrouter/free",
  "google/gemini-flash:free",
] as const

/** Models blocked for live chat / streaming UX */
export const HEAVY_MODEL_PATTERNS = [
  /nemotron/i,
  /120b/i,
  /70b/i,
  /72b/i,
  /405b/i,
  /llama-3\.3-70b/i,
  /gemma-4-26b/i,
] as const

export const DEFAULT_INTERACTIVE_MODEL = FAST_INTERACTIVE_MODELS[0]

export const OPENROUTER_MODELS = [
  {
    id: "google/gemini-flash:free",
    label: "gemini-flash",
    tier: "fast" as const,
    description: "Low-latency interactive (recommended)",
  },
  {
    id: "openrouter/free",
    label: "openrouter-free",
    tier: "fast" as const,
    description: "Auto-routed free model pool",
  },
  {
    id: "qwen/qwen3.5-plus:free",
    label: "qwen3.5-plus",
    tier: "fast" as const,
    description: "Fast structured reasoning",
  },
  {
    id: "mistralai/devstral-2:free",
    label: "devstral-2",
    tier: "coding" as const,
    description: "Code and agent workflows",
  },
] as const

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
  "nvidia/nemotron-3-super:free": DEFAULT_INTERACTIVE_MODEL,
  "nvidia/nemotron-3-super-120b-a12b:free": DEFAULT_INTERACTIVE_MODEL,
  "qwen/qwen3-coder:free": "qwen/qwen3.5-plus:free",
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
