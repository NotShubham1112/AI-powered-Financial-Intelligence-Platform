/** Backward-compatible re-exports — now routes through provider router */

export {
  DEFAULT_INTERACTIVE_MODEL as DEFAULT_OPENROUTER_MODEL,
  GROQ_MODELS as OPENROUTER_MODELS,
  DEPRECATED_MODEL_IDS,
  resolveModel,
  FAST_INTERACTIVE_MODELS,
  GROQ_MODELS,
} from "@/core/models/config"

export { fallbackChain } from "@/core/models/fallbacks"

import { fallbackChain } from "@/core/models/fallbacks"
import {
  fetchProviderStream,
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
  return fetchProviderStream({
    model: options.model,
    messages: options.messages,
    referer: options.referer,
  }) as Promise<OpenRouterResult>
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
    const result = await fetchProviderStream({
      model,
      messages: options.messages,
      referer: options.referer,
    })
    if (result.ok) {
      return { ...result, triedModels: tried }
    }
    lastResult = result as OpenRouterResult
    console.warn(`Provider ${model} failed (${result.status}), trying next…`)
    if (!isRetryableError(result.status, result.errorBody)) {
      return { ...result, triedModels: tried }
    }
  }

  return { ...lastResult, triedModels: tried, status: lastResult.status ?? 429 }
}