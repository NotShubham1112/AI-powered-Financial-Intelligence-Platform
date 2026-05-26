/** In-memory cache with Redis interface abstraction */

export interface CacheStore {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
}

type Entry<T> = { value: T; expiresAt: number }

class MemoryCache implements CacheStore {
  private store = new Map<string, Entry<unknown>>()

  async get<T>(key: string): Promise<T | null> {
    const e = this.store.get(key)
    if (!e) return null
    if (Date.now() > e.expiresAt) {
      this.store.delete(key)
      return null
    }
    return e.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }
}

/** Redis stub — swap when REDIS_URL is configured */
class RedisCacheStub implements CacheStore {
  constructor(private fallback: CacheStore) {}

  async get<T>(key: string): Promise<T | null> {
    if (!process.env.REDIS_URL) return this.fallback.get<T>(key)
    return this.fallback.get<T>(key)
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    return this.fallback.set(key, value, ttlSeconds)
  }
}

const memory = new MemoryCache()
export const responseCache: CacheStore = new RedisCacheStub(memory)

export function cacheKey(parts: string[]): string {
  return parts.join("::")
}
