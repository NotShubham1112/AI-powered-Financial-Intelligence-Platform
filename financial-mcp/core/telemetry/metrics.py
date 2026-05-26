from dataclasses import dataclass, field
from typing import Dict


@dataclass
class ExecutionMetrics:
    runs_total: int = 0
    runs_success: int = 0
    runs_failed: int = 0
    tool_invocations: Dict[str, int] = field(default_factory=dict)
    total_latency_ms: float = 0.0

    def record_run(self, status: str, latency_ms: float) -> None:
        self.runs_total += 1
        self.total_latency_ms += latency_ms
        if status == "success":
            self.runs_success += 1
        elif status in ("failed", "partial"):
            self.runs_failed += 1

    def record_tool(self, tool_name: str) -> None:
        self.tool_invocations[tool_name] = self.tool_invocations.get(tool_name, 0) + 1

    def to_dict(self) -> dict:
        return {
            "runs_total": self.runs_total,
            "runs_success": self.runs_success,
            "runs_failed": self.runs_failed,
            "avg_latency_ms": self.total_latency_ms / max(self.runs_total, 1),
            "tool_invocations": dict(self.tool_invocations),
        }
