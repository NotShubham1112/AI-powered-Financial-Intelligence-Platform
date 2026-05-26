import {
  DEFAULT_INTERACTIVE_MODEL,
  DEEP_REASONING_MODELS,
  type ModelTier,
  inferQueryIntent,
  isHeavyModel,
  resolveModel,
} from "./config"
import { fallbackChain } from "./fallbacks"
import { providerScoring } from "./scoring"

export type RoutingDecision = {
  interactiveModel: string
  backgroundModel: string | null
  chain: string[]
  tier: ModelTier
}

/** Selects models for interactive vs background workloads */
export class RuntimeModelRouter {
  route(requested: string, userQuery: string, mode: "interactive" | "background" = "interactive"): RoutingDecision {
    const resolved = resolveModel(requested)
    const tier = inferQueryIntent(userQuery)

    if (mode === "background") {
      const deepChain = fallbackChain.buildChain(
        isHeavyModel(resolved) ? DEEP_REASONING_MODELS[0] : resolved,
        "deep"
      )
      return {
        interactiveModel: DEFAULT_INTERACTIVE_MODEL,
        backgroundModel: deepChain[0] ?? null,
        chain: deepChain,
        tier: "deep",
      }
    }

    const safePrimary = isHeavyModel(resolved) ? DEFAULT_INTERACTIVE_MODEL : resolved
    const chain = fallbackChain.buildChain(safePrimary, tier)
    const ranked = providerScoring.rankModels(chain)
    const interactive = ranked[0] ?? DEFAULT_INTERACTIVE_MODEL
    const background =
      tier === "deep" || userQuery.length > 300
        ? fallbackChain.buildChain(DEEP_REASONING_MODELS[0], "deep")[0]
        : null

    return {
      interactiveModel: interactive,
      backgroundModel: background,
      chain: ranked,
      tier,
    }
  }
}

export const modelRouter = new RuntimeModelRouter()
