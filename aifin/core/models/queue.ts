/** Concurrency control and backpressure */

const MAX_CONCURRENT = 4
const perModelLimits = new Map<string, number>()
const DEFAULT_PER_MODEL = 2

let activeGlobal = 0
const activePerModel = new Map<string, number>()
const waitQueue: Array<() => void> = []

function release(): void {
  activeGlobal = Math.max(0, activeGlobal - 1)
  const next = waitQueue.shift()
  if (next) next()
}

export async function withConcurrencyLimit<T>(
  modelId: string,
  fn: () => Promise<T>
): Promise<T> {
  const limit = perModelLimits.get(modelId) ?? DEFAULT_PER_MODEL
  await acquire(modelId, limit)
  try {
    return await fn()
  } finally {
    const n = (activePerModel.get(modelId) ?? 1) - 1
    if (n <= 0) activePerModel.delete(modelId)
    else activePerModel.set(modelId, n)
    release()
  }
}

function acquire(modelId: string, limit: number): Promise<void> {
  return new Promise((resolve) => {
    const tryAcquire = () => {
      const modelActive = activePerModel.get(modelId) ?? 0
      if (activeGlobal < MAX_CONCURRENT && modelActive < limit) {
        activeGlobal++
        activePerModel.set(modelId, modelActive + 1)
        resolve()
        return
      }
      waitQueue.push(tryAcquire)
    }
    tryAcquire()
  })
}

export function getQueueMetrics() {
  return {
    activeGlobal,
    queueDepth: waitQueue.length,
    activePerModel: Object.fromEntries(activePerModel),
  }
}
