/** Re-exports fault-tolerant model runtime (backward compatible) */

export {
  DEFAULT_INTERACTIVE_MODEL as DEFAULT_OPENROUTER_MODEL,
  OPENROUTER_MODELS,
  DEPRECATED_MODEL_IDS,
  resolveModel,
  FAST_INTERACTIVE_MODELS,
  FALLBACK_MODELS,
} from "@/core/models/config"

export { fallbackChain } from "@/core/models/fallbacks"

import { fallbackChain } from "@/core/models/fallbacks"
import {
  fetchOpenRouterStream,
  isRetryableError,
  type ProviderFetchResult,
} from "@/core/models/providers"

export type OpenRouterResult = ProviderFetchResult & {
  triedModels?: string[]
}

export function getFallbackModels(requested: string): string[] {
  return fallbackChain.buildChain(requested, "fast")
}

export async function fetchOpenRouterChat(
  apiKey: string,
  options: {
    model: string
    messages: Array<{ role: string; content: string }>
    referer: string
  }
): Promise<OpenRouterResult> {
  return fetchOpenRouterStream(apiKey, options)
}

export async function fetchWithModelFallback(
  apiKey: string,
  options: {
    model: string
    messages: Array<{ role: string; content: string }>
    referer: string
  }
): Promise<OpenRouterResult & { triedModels: string[] }> {
  const tried: string[] = []
  let lastResult: OpenRouterResult = { ok: false, status: 429, errorBody: "No models tried" }

  for (const model of getFallbackModels(options.model)) {
    tried.push(model)
    const result = await fetchOpenRouterStream(apiKey, { ...options, model })
    if (result.ok) {
      return { ...result, triedModels: tried }
    }
    lastResult = result
    console.warn(`OpenRouter ${model} failed (${result.status}), trying next…`)
    if (!isRetryableError(result.status, result.errorBody)) {
      return { ...result, triedModels: tried }
    }
  }

  return { ...lastResult, triedModels: tried, status: lastResult.status ?? 429 }
}
