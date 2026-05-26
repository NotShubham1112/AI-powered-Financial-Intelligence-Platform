import {
  CODING_MODELS,
  DEEP_REASONING_MODELS,
  FALLBACK_MODELS,
  FAST_INTERACTIVE_MODELS,
  type ModelTier,
  resolveModel,
} from "./config"
import { providerScoring } from "./scoring"

/** Builds ordered fallback chains with health-aware ranking */
export class AdaptiveFallbackChain {
  buildChain(requested: string, tier: ModelTier = "fast"): string[] {
    const primary = resolveModel(requested)
    const tierPool =
      tier === "coding"
        ? [...CODING_MODELS]
        : tier === "deep"
          ? [...DEEP_REASONING_MODELS]
          : [...FAST_INTERACTIVE_MODELS]

    const base = [primary, ...tierPool, ...FALLBACK_MODELS]
    const unique = [...new Set(base.map(resolveModel))]
    return providerScoring.rankModels(unique)
  }
}

export const fallbackChain = new AdaptiveFallbackChain()
