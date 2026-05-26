from collections import defaultdict
from typing import Dict, List


class ModelLatencyTracker:
    def __init__(self) -> None:
        self._samples: Dict[str, List[float]] = defaultdict(list)

    def record(self, model_id: str, latency_ms: float) -> None:
        samples = self._samples[model_id]
        samples.append(latency_ms)
        if len(samples) > 50:
            del samples[0]
