import asyncio
from typing import Awaitable, TypeVar

T = TypeVar("T")


async def with_timeout(coro: Awaitable[T], seconds: float) -> T:
    return await asyncio.wait_for(coro, timeout=seconds)
