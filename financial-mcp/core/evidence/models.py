from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class EvidenceClaim:
    """Structured, source-bound quantitative claim from engine output."""

    claim_id: str
    claim: str
    source: str
    confidence: float
    freshness_days: int
    tool_name: str
    field_path: str
    value: Any
    verified: bool = True
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class UnverifiedClaim:
    """LLM-facing flag for claims that lack engine backing."""

    text: str
    reason: str
    suggested_action: str = "cite_engine_or_remove"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
