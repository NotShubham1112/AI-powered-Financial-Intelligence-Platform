"""Provider health scoring (Python mirror for policy tests)."""
from dataclasses import dataclass


@dataclass
class ProviderHealthScore:
    model_id: str
    score: float = 0.5
    success_rate: float = 1.0
    avg_latency_ms: float = 5000.0
