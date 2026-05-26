from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from core.executor.models import ExecutionReport


@dataclass
class StructuredObservation:
    run_id: str
    tool_name: str
    timestamp: str
    raw: Dict[str, Any]
    compressed: Dict[str, Any]
    category: Optional[str] = None


@dataclass
class RunMemory:
    run_id: str
    observations: List[StructuredObservation] = field(default_factory=list)
    report: Optional[ExecutionReport] = None


class ResultMemoryStore:
    """In-process result memory; swap for Redis/vector store in production."""

    def __init__(self) -> None:
        self._runs: Dict[str, RunMemory] = {}

    def add_observation(
        self,
        run_id: str,
        tool_name: str,
        raw: Dict[str, Any],
        *,
        compressed: Dict[str, Any],
        category: Optional[str] = None,
    ) -> StructuredObservation:
        run = self._runs.setdefault(run_id, RunMemory(run_id=run_id))
        obs = StructuredObservation(
            run_id=run_id,
            tool_name=tool_name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            raw=raw,
            compressed=compressed,
            category=category,
        )
        run.observations.append(obs)
        return obs

    def store_run(self, run_id: str, report: ExecutionReport) -> None:
        run = self._runs.setdefault(run_id, RunMemory(run_id=run_id))
        run.report = report

    def get_run(self, run_id: str) -> Optional[RunMemory]:
        return self._runs.get(run_id)

    def get_observations(self, run_id: str) -> List[StructuredObservation]:
        run = self._runs.get(run_id)
        return run.observations if run else []
