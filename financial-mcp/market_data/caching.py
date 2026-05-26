import redis.asyncio as redis
from apps.mcp_server.settings import settings
import orjson

class MarketDataCache:
    def __init__(self):
        self.redis = redis.Redis.from_url(str(settings.REDIS_URL))

    async def get_or_set(self, key: str, func, ttl: int = 300):
        cached = await self.redis.get(key)
        if cached:
            return orjson.loads(cached)
        data = await func()
        await self.redis.setex(key, ttl, orjson.dumps(data))
        return data