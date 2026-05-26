"""Runtime metrics stub for /agent/metrics aggregation."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class InferenceRuntimeMetrics:
    failover_count: int = 0
    deterministic_runs: int = 0
    provider_notes: Dict[str, str] = field(default_factory=dict)


_metrics = InferenceRuntimeMetrics()


def record_deterministic_run() -> None:
    _metrics.deterministic_runs += 1


def get_inference_metrics() -> dict:
    return {
        "failover_count": _metrics.failover_count,
        "deterministic_runs": _metrics.deterministic_runs,
        "policy": {
            "fast_interactive": "google/gemini-flash:free",
            "never_stream": list(("nemotron", "70b", "120b")),
        },
    }
