import asyncio
from typing import Awaitable, Callable, TypeVar

T = TypeVar("T")


async def with_retry(
    operation: Callable[[], Awaitable[T]],
    max_retries: int,
    backoff_seconds: float = 0.5,
) -> T:
    last_error: Exception | None = None
    for attempt in range(max_retries + 1):
        try:
            return await operation()
        except Exception as exc:
            last_error = exc
            if attempt >= max_retries:
                break
            await asyncio.sleep(backoff_seconds * (2**attempt))
    assert last_error is not None
    raise last_error
