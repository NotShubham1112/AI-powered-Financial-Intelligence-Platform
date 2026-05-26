from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import structlog

logger = structlog.get_logger(__name__)


@dataclass
class Span:
    trace_id: str
    span_id: str
    name: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    start_ms: float = 0.0
    end_ms: Optional[float] = None
    success: Optional[bool] = None
    error: Optional[str] = None

    def finish(self, *, success: bool, latency_ms: Optional[float] = None, error: Optional[str] = None) -> None:
        self.end_ms = time.perf_counter() * 1000
        self.success = success
        self.error = error
        logger.info(
            "span_finished",
            trace_id=self.trace_id,
            span_id=self.span_id,
            name=self.name,
            success=success,
            latency_ms=latency_ms,
            error=error,
            **self.attributes,
        )


class ExecutionTracer:
    """Lightweight tracing; export to OpenTelemetry/Langfuse via adapter later."""

    def __init__(self) -> None:
        self._spans: List[Span] = []

    def start_span(self, name: str, **attributes: Any) -> Span:
        span = Span(
            trace_id=str(uuid.uuid4()),
            span_id=str(uuid.uuid4())[:8],
            name=name,
            attributes=attributes,
            start_ms=time.perf_counter() * 1000,
        )
        self._spans.append(span)
        logger.debug("span_started", name=name, **attributes)
        return span

    def get_spans(self) -> List[Span]:
        return list(self._spans)
