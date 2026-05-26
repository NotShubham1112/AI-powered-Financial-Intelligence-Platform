from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class NodeStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"
    SKIPPED = "skipped"


class ExecutionEventType(str, Enum):
    PLAN_READY = "plan_ready"
    NODE_STARTED = "node_started"
    NODE_COMPLETED = "node_completed"
    NODE_FAILED = "node_failed"
    VALIDATION = "validation"
    SYNTHESIS = "synthesis"
    RUN_COMPLETED = "run_completed"
    RUN_CANCELLED = "run_cancelled"


@dataclass
class ExecutionEvent:
    type: ExecutionEventType
    run_id: str
    payload: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExecutionNode:
    id: str
    tool_name: str
    params: Dict[str, Any] = field(default_factory=dict)
    depends_on: List[str] = field(default_factory=list)
    timeout_seconds: float = 30.0
    max_retries: int = 2
    retry_backoff_seconds: float = 0.5


@dataclass
class NodeResult:
    node_id: str
    tool_name: str
    status: NodeStatus
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    latency_ms: float = 0.0
    attempts: int = 1


@dataclass
class ExecutionDAG:
    """Directed acyclic graph of tool nodes."""

    nodes: Dict[str, ExecutionNode] = field(default_factory=dict)
    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    query: str = ""

    def add_node(self, node: ExecutionNode) -> None:
        if node.id in self.nodes:
            raise ValueError(f"Duplicate node id: {node.id}")
        self.nodes[node.id] = node

    def validate(self) -> None:
        for node in self.nodes.values():
            for dep in node.depends_on:
                if dep not in self.nodes:
                    raise ValueError(f"Node {node.id} depends on unknown node {dep}")

    def execution_levels(self) -> List[List[str]]:
        """Topological levels for parallel batch execution."""
        self.validate()
        remaining_deps: Dict[str, set[str]] = {
            nid: set(node.depends_on) for nid, node in self.nodes.items()
        }
        levels: List[List[str]] = []
        processed: set[str] = set()
        ready = [nid for nid, deps in remaining_deps.items() if not deps]

        while ready:
            levels.append(sorted(ready))
            processed.update(ready)
            next_ready: List[str] = []
            for nid in ready:
                for other_id, deps in remaining_deps.items():
                    if other_id in processed:
                        continue
                    deps.discard(nid)
                    if not deps and other_id not in next_ready:
                        next_ready.append(other_id)
            ready = [x for x in next_ready if x not in processed]

        if len(processed) != len(self.nodes):
            raise ValueError("Execution DAG contains a cycle")
        return levels


@dataclass
class ExecutionReport:
    run_id: str
    query: str
    node_results: List[NodeResult]
    status: str
    validation: Optional[Dict[str, Any]] = None
    synthesis: Optional[Dict[str, Any]] = None
    evidence: List[Dict[str, Any]] = field(default_factory=list)
    debate: Optional[Dict[str, Any]] = None
    live_signals: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
