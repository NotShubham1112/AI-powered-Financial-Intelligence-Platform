/** Provider health tracking for adaptive routing */

export type ProviderHealthScore = {
  modelId: string
  avgLatencyMs: number
  successRate: number
  rateLimitRate: number
  streamStability: number
  timeoutRate: number
  malformedRate: number
  score: number
  lastUpdated: number
}

type ModelStats = {
  attempts: number
  successes: number
  rateLimits: number
  timeouts: number
  streamFailures: number
  malformed: number
  latencySum: number
  latencyCount: number
}

const globalStats = new Map<string, ModelStats>()

function emptyStats(): ModelStats {
  return {
    attempts: 0,
    successes: 0,
    rateLimits: 0,
    timeouts: 0,
    streamFailures: 0,
    malformed: 0,
    latencySum: 0,
    latencyCount: 0,
  }
}

function getStats(modelId: string): ModelStats {
  let s = globalStats.get(modelId)
  if (!s) {
    s = emptyStats()
    globalStats.set(modelId, s)
  }
  return s
}

export class ProviderHealthManager {
  recordAttempt(modelId: string): void {
    getStats(modelId).attempts++
  }

  recordSuccess(modelId: string, latencyMs: number): void {
    const s = getStats(modelId)
    s.successes++
    s.latencySum += latencyMs
    s.latencyCount++
  }

  recordRateLimit(modelId: string): void {
    getStats(modelId).rateLimits++
  }

  recordTimeout(modelId: string): void {
    getStats(modelId).timeouts++
  }

  recordStreamFailure(modelId: string): void {
    getStats(modelId).streamFailures++
  }

  recordMalformed(modelId: string): void {
    getStats(modelId).malformed++
  }

  getScore(modelId: string): ProviderHealthScore {
    const s = getStats(modelId)
    const attempts = Math.max(s.attempts, 1)
    const successRate = s.successes / attempts
    const rateLimitRate = s.rateLimits / attempts
    const timeoutRate = s.timeouts / attempts
    const streamStability = 1 - (s.streamFailures + s.timeouts) / attempts
    const malformedRate = s.malformed / attempts
    const avgLatencyMs = s.latencyCount > 0 ? s.latencySum / s.latencyCount : 5000

    const score =
      successRate * 0.35 +
      streamStability * 0.3 +
      (1 - rateLimitRate) * 0.2 +
      (1 - Math.min(avgLatencyMs / 30_000, 1)) * 0.1 +
      (1 - malformedRate) * 0.05

    return {
      modelId,
      avgLatencyMs,
      successRate,
      rateLimitRate,
      streamStability,
      timeoutRate,
      malformedRate,
      score: Math.max(0, Math.min(1, score)),
      lastUpdated: Date.now(),
    }
  }

  getAllScores(): ProviderHealthScore[] {
    return [...globalStats.keys()].map((id) => this.getScore(id))
  }

  toMetrics(): Record<string, ProviderHealthScore> {
    const out: Record<string, ProviderHealthScore> = {}
    for (const id of globalStats.keys()) {
      out[id] = this.getScore(id)
    }
    return out
  }
}

export const providerHealth = new ProviderHealthManager()
