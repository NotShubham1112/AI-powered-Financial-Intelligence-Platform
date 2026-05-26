from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from core.executor.runtime import ExecutionRuntime


@dataclass
class SkillContext:
    query: str
    inputs: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SkillArtifact:
    skill_name: str
    report: Dict[str, Any]
    tools_used: List[str]
    confidence: float
    flags: List[str] = field(default_factory=list)


class Skill(ABC):
    name: str
    description: str
    version: str = "1.0.0"

    @abstractmethod
    def build_tool_plan(self, ctx: SkillContext) -> tuple[List[str], Dict[str, Dict[str, Any]], bool]:
        """Return (tool_names, inputs_by_tool, run_parallel)."""

    async def execute(self, ctx: SkillContext, runtime: ExecutionRuntime) -> SkillArtifact:
        tools, inputs, parallel = self.build_tool_plan(ctx)
        from orchestration.agent_router import ToolRecommendation

        chain = [
            ToolRecommendation(
                tool_name=t,
                category="skill",
                score=1.0,
                description=self.description,
                requires_market_data=False,
                complexity="medium",
                tags=[self.name],
            )
            for t in tools
        ]
        dag = runtime.plan_from_router(chain, inputs, query=ctx.query, parallel=parallel)
        report = await runtime.execute(dag)
        return SkillArtifact(
            skill_name=self.name,
            report={
                "run_id": report.run_id,
                "status": report.status,
                "synthesis": report.synthesis,
                "validation": report.validation,
            },
            tools_used=tools,
            confidence=(report.validation or {}).get("confidence", 0.0),
            flags=(report.validation or {}).get("flags", []),
        )
