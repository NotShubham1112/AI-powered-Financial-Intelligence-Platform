"""In-memory cache abstraction (Redis optional via env)."""
from typing import Any, Dict, Optional


class MemoryCache:
    def __init__(self) -> None:
        self._store: Dict[str, Any] = {}

    def get(self, key: str) -> Optional[Any]:
        return self._store.get(key)

    def set(self, key: str, value: Any) -> None:
        self._store[key] = value
