import { providerHealth, type ProviderHealthScore } from "./health"
import { modelLatency } from "./latency"

/** Ranks models by composite health + latency */
export class ProviderScoreEngine {
  rankModels(modelIds: string[]): string[] {
    const scored = modelIds.map((id) => ({
      id,
      composite: this.compositeScore(id),
    }))
    scored.sort((a, b) => b.composite - a.composite)
    return scored.map((s) => s.id)
  }

  compositeScore(modelId: string): number {
    const health: ProviderHealthScore = providerHealth.getScore(modelId)
    const ttft = modelLatency.getAvgTtft(modelId)
    const latencyBonus = 1 - Math.min(ttft / 20_000, 1)
    return health.score * 0.75 + latencyBonus * 0.25
  }
}

export const providerScoring = new ProviderScoreEngine()
