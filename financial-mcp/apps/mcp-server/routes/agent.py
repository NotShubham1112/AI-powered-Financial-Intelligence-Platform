import json
from typing import Any, AsyncGenerator, Dict, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.executor.models import ExecutionEvent, ExecutionEventType
from orchestration.pipeline import AgentPipeline

router = APIRouter(prefix="/agent", tags=["agent"])
_pipeline = AgentPipeline()


class AgentRunRequest(BaseModel):
    query: str
    inputs_by_tool: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    max_steps: int = 3
    parallel: bool = False
    skill: Optional[str] = None


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.post("/run")
async def run_agent(req: AgentRunRequest) -> dict:
    if req.skill:
        result = await _pipeline.run_skill(req.skill, req.query, req.inputs_by_tool)
    else:
        result = await _pipeline.run(
            req.query,
            req.inputs_by_tool,
            max_steps=req.max_steps,
            parallel=req.parallel,
        )
    return {
        "run_id": result.report.run_id,
        "status": result.report.status,
        "validation": result.report.validation,
        "synthesis": result.report.synthesis,
        "evidence": result.report.evidence,
        "debate": result.report.debate,
        "live_signals": result.report.live_signals,
        "execution_metadata": result.report.metadata.get("execution"),
        "tools": [r.tool_name for r in result.report.node_results],
    }


@router.post("/run/stream")
async def run_agent_stream(req: AgentRunRequest) -> StreamingResponse:
    events: list[ExecutionEvent] = []

    async def on_event(event: ExecutionEvent) -> None:
        events.append(event)

    async def generate() -> AsyncGenerator[str, None]:
        yield _sse("status", {"stage": "started", "query": req.query})
        try:
            if req.skill:
                result = await _pipeline.run_skill(
                    req.skill, req.query, req.inputs_by_tool, on_event=on_event
                )
            else:
                result = await _pipeline.run(
                    req.query,
                    req.inputs_by_tool,
                    max_steps=req.max_steps,
                    parallel=req.parallel,
                    on_event=on_event,
                )
            for ev in events:
                yield _sse(ev.type.value, {"run_id": ev.run_id, **ev.payload})
            yield _sse(
                "final",
                {
                    "run_id": result.report.run_id,
                    "status": result.report.status,
                    "validation": result.report.validation,
                    "synthesis": result.report.synthesis,
                    "evidence": result.report.evidence,
                    "debate": result.report.debate,
                    "live_signals": result.report.live_signals,
                    "execution_metadata": result.report.metadata.get("execution"),
                },
            )
        except Exception as exc:
            yield _sse("error", {"message": str(exc)})

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/metrics")
async def agent_metrics() -> dict:
    from core.models.runtime import get_inference_metrics

    return {
        "execution": _pipeline.metrics.to_dict(),
        "inference": get_inference_metrics(),
    }
