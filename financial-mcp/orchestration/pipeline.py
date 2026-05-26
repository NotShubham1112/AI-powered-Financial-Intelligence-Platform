"""
Full agent pipeline: decompose → plan DAG → execute → validate → synthesize.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from core.executor.models import ExecutionEvent, ExecutionReport
from core.executor.runtime import ExecutionRuntime
from core.skills.base import Skill, SkillContext, SkillArtifact
from core.skills.registry import get_skill
from core.telemetry.metrics import ExecutionMetrics
from core.tool_registry import ToolRegistry, build_default_tool_registry
from orchestration.agent_router import AgentRouter


@dataclass
class PipelineResult:
    query: str
    report: ExecutionReport
    recommendations: List[Dict[str, Any]] = field(default_factory=list)
    skill_artifact: Optional[SkillArtifact] = None


class AgentPipeline:
    """
    Planner → Dependency Graph → Executor → Result Memory → Validation → Synthesis
    """

    def __init__(
        self,
        router: Optional[AgentRouter] = None,
        runtime: Optional[ExecutionRuntime] = None,
        metrics: Optional[ExecutionMetrics] = None,
    ) -> None:
        registry = build_default_tool_registry()
        self.router = router or AgentRouter()
        self.runtime = runtime or ExecutionRuntime(registry)
        self.metrics = metrics or ExecutionMetrics()

    async def run(
        self,
        query: str,
        inputs_by_tool: Optional[Dict[str, Dict[str, Any]]] = None,
        *,
        max_steps: int = 3,
        parallel: bool = False,
        on_event=None,
    ) -> PipelineResult:
        chain = self.router.plan_tool_chain(query, max_steps=max_steps)
        inputs = inputs_by_tool or {}
        dag = self.runtime.plan_from_router(chain, inputs, query=query, parallel=parallel)
        report = await self.runtime.execute(dag, on_event=on_event)
        latency = sum(r.latency_ms for r in report.node_results)
        self.metrics.record_run(report.status, latency)
        for nr in report.node_results:
            self.metrics.record_tool(nr.tool_name)
        return PipelineResult(
            query=query,
            report=report,
            recommendations=[
                {
                    "tool_name": r.tool_name,
                    "category": r.category,
                    "score": r.score,
                }
                for r in chain
            ],
        )

    async def run_skill(
        self,
        skill_name: str,
        query: str,
        inputs: Optional[Dict[str, Dict[str, Any]]] = None,
        *,
        on_event=None,
    ) -> PipelineResult:
        skill = get_skill(skill_name)
        if not skill:
            raise ValueError(f"Unknown skill: {skill_name}")
        ctx = SkillContext(query=query, inputs=inputs or {})
        artifact = await skill.execute(ctx, self.runtime)
        run_id = artifact.report.get("run_id", "")
        run_memory = self.runtime.memory.get_run(run_id)
        report = run_memory.report if run_memory and run_memory.report else None
        if report is None:
            from core.executor.models import ExecutionReport

            report = ExecutionReport(
                run_id=run_id or "skill",
                query=query,
                node_results=[],
                status=artifact.report.get("status", "unknown"),
                validation=artifact.report.get("validation"),
                synthesis=artifact.report.get("synthesis"),
            )
        return PipelineResult(
            query=query,
            report=report,
            skill_artifact=artifact,
        )
