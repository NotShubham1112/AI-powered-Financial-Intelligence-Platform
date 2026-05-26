/** Rolling latency tracker per model */

type LatencySample = { ttftMs: number; totalMs: number; at: number }

const samples = new Map<string, LatencySample[]>()
const MAX_SAMPLES = 50

export class ModelLatencyTracker {
  record(modelId: string, ttftMs: number, totalMs: number): void {
    const list = samples.get(modelId) ?? []
    list.push({ ttftMs, totalMs, at: Date.now() })
    if (list.length > MAX_SAMPLES) list.shift()
    samples.set(modelId, list)
  }

  getAvgTtft(modelId: string): number {
    const list = samples.get(modelId)
    if (!list?.length) return 8000
    return list.reduce((a, s) => a + s.ttftMs, 0) / list.length
  }

  getAvgTotal(modelId: string): number {
    const list = samples.get(modelId)
    if (!list?.length) return 15000
    return list.reduce((a, s) => a + s.totalMs, 0) / list.length
  }

  toMetrics(): Record<string, { avgTtftMs: number; avgTotalMs: number; samples: number }> {
    const out: Record<string, { avgTtftMs: number; avgTotalMs: number; samples: number }> = {}
    for (const id of samples.keys()) {
      const list = samples.get(id)!
      out[id] = {
        avgTtftMs: this.getAvgTtft(id),
        avgTotalMs: this.getAvgTotal(id),
        samples: list.length,
      }
    }
    return out
  }
}

export const modelLatency = new ModelLatencyTracker()
