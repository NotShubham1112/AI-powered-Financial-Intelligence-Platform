"""Data models for the 4-phase reasoning pipeline."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Literal
from enum import Enum


class PhaseType(str, Enum):
    """Reasoning pipeline phases."""
    INTENT = "intent"
    PLANNING = "planning"
    EXECUTION = "execution"
    SYNTHESIS = "synthesis"


class StepStatus(str, Enum):
    """Step execution status."""
    NOT_STARTED = "not-started"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class Intent:
    """Phase 1: Intent Understanding output."""
    query: str
    domain: str  # "stocks", "crypto", "portfolio", "macro", etc.
    is_complex: bool
    intent_type: str  # "analysis", "comparison", "strategy", "forecast"
    entities: List[str] = field(default_factory=list)  # ["TSLA", "AAPL"]
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ReasoningStep:
    """A single step in the execution TODO list."""
    id: str
    title: str
    description: str
    depends_on: List[str] = field(default_factory=list)  # Step IDs this depends on
    status: StepStatus = StepStatus.NOT_STARTED
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    tools_needed: List[str] = field(default_factory=list)


@dataclass
class ReasoningPlan:
    """Phase 2: Planning output."""
    intent: Intent
    goal: str
    steps: List[ReasoningStep] = field(default_factory=list)
    total_steps: int = 0
    estimated_duration_ms: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        self.total_steps = len(self.steps)


@dataclass
class ExecutionContext:
    """Maintains state across execution steps."""
    plan: ReasoningPlan
    step_outputs: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    accumulated_knowledge: str = ""
    tool_calls: List[Dict[str, Any]] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)

    def add_step_output(self, step_id: str, output: Dict[str, Any]) -> None:
        """Record step output."""
        self.step_outputs[step_id] = output

    def get_step_output(self, step_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve step output for dependency resolution."""
        return self.step_outputs.get(step_id)

    def add_error(self, error: str) -> None:
        """Record execution error."""
        self.errors.append(error)

    def add_knowledge(self, knowledge: str) -> None:
        """Accumulate reasoning knowledge."""
        self.accumulated_knowledge += f"\n{knowledge}"


@dataclass
class ExecutionReport:
    """Phase 3: Execution output (per step)."""
    step_id: str
    status: StepStatus
    output: Dict[str, Any] = field(default_factory=dict)
    duration_ms: int = 0
    tools_used: List[str] = field(default_factory=list)
    error: Optional[str] = None


@dataclass
class FinancialInsight:
    """A single insight from reasoning."""
    type: str  # "finding", "risk", "opportunity", "metric"
    content: str
    confidence: float  # 0-1
    supporting_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ReasoningSynthesis:
    """Phase 4: Final structured output."""
    goal: str
    summary: str
    steps_executed: List[ReasoningStep]
    insights: List[FinancialInsight] = field(default_factory=list)
    recommendation: str = ""
    tables: List[Dict[str, Any]] = field(default_factory=list)
    charts: List[Dict[str, Any]] = field(default_factory=list)
    confidence_score: float = 0.0
    execution_time_ms: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ReasoningResponse:
    """Complete response from reasoning pipeline."""
    intent: Intent
    plan: ReasoningPlan
    execution: List[ExecutionReport]
    synthesis: ReasoningSynthesis
    total_duration_ms: int
