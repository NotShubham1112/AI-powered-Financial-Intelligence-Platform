from __future__ import annotations

import asyncio
import time
from typing import Any, Awaitable, Callable, Dict, List, Optional

import structlog

from core.executor.dag_builder import build_linear_dag, build_parallel_dag
from core.executor.models import (
    ExecutionDAG,
    ExecutionEvent,
    ExecutionEventType,
    ExecutionReport,
    NodeResult,
    NodeStatus,
)
from core.executor.retry import with_retry
from core.executor.timeout import with_timeout
from core.evidence.registry import EvidenceRegistry
from core.memory.compression import compress_tool_result
from core.memory.store import ResultMemoryStore
from core.signals.live import LiveSignalEngine
from core.synthesis.report_builder import InstitutionalReportBuilder
from core.telemetry.tracing import ExecutionTracer
from core.tool_registry import ToolRegistry
from core.validators.risk_validator import FinancialRiskValidator
from orchestration.agent_router import AgentRouter, ToolRecommendation
from orchestration.debate import DebateResolutionEngine

logger = structlog.get_logger(__name__)

EventCallback = Callable[[ExecutionEvent], Awaitable[None] | None]


class ExecutionRuntime:
    """
    Async DAG executor: parallel batches, retries, timeouts, cancellation, result memory.
    """

    def __init__(
        self,
        tool_registry: ToolRegistry,
        memory: Optional[ResultMemoryStore] = None,
        validator: Optional[FinancialRiskValidator] = None,
        tracer: Optional[ExecutionTracer] = None,
        evidence: Optional[EvidenceRegistry] = None,
        debate_engine: Optional[DebateResolutionEngine] = None,
        signal_engine: Optional[LiveSignalEngine] = None,
        report_builder: Optional[InstitutionalReportBuilder] = None,
    ) -> None:
        self.tools = tool_registry
        self.memory = memory or ResultMemoryStore()
        self.validator = validator or FinancialRiskValidator()
        self.tracer = tracer or ExecutionTracer()
        self.evidence = evidence or EvidenceRegistry()
        self.debate_engine = debate_engine or DebateResolutionEngine()
        self.signal_engine = signal_engine or LiveSignalEngine()
        self.report_builder = report_builder or InstitutionalReportBuilder()
        self._cancel_flags: Dict[str, asyncio.Event] = {}
        self._active_tasks: Dict[str, List[asyncio.Task[Any]]] = {}

    async def execute(
        self,
        dag: ExecutionDAG,
        *,
        on_event: Optional[EventCallback] = None,
    ) -> ExecutionReport:
        dag.validate()
        run_id = dag.run_id
        self._cancel_flags[run_id] = asyncio.Event()
        self._active_tasks[run_id] = []
        results: Dict[str, NodeResult] = {}
        run_started = time.perf_counter()

        await self._emit(
            on_event,
            ExecutionEvent(ExecutionEventType.PLAN_READY, run_id, {"levels": dag.execution_levels()}),
        )

        try:
            for level in dag.execution_levels():
                if self._cancel_flags[run_id].is_set():
                    break
                batch_tasks = [
                    asyncio.create_task(
                        self._run_node(node, dag, results, run_id, on_event)
                    )
                    for node in (dag.nodes[nid] for nid in level)
                ]
                self._active_tasks[run_id].extend(batch_tasks)
                level_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                for item in level_results:
                    if isinstance(item, Exception):
                        raise item

            validation = self.validator.validate_run(list(results.values()))
            await self._emit(
                on_event,
                ExecutionEvent(ExecutionEventType.VALIDATION, run_id, validation),
            )

            runtime_ms = (time.perf_counter() - run_started) * 1000
            node_list = list(results.values())
            evidence_claims = self.evidence.get_claims(run_id)
            debate = self.debate_engine.resolve(node_list, validation, evidence_claims)
            live_signals = [s.to_dict() for s in self.signal_engine.derive(node_list)]
            synthesis = self.report_builder.build(
                dag.query,
                node_list,
                validation,
                evidence_claims,
                debate,
                live_signals,
                runtime_ms=runtime_ms,
            )
            await self._emit(
                on_event,
                ExecutionEvent(ExecutionEventType.SYNTHESIS, run_id, synthesis),
            )

            status = "cancelled" if self._cancel_flags[run_id].is_set() else self._overall_status(results)
            report = ExecutionReport(
                run_id=run_id,
                query=dag.query,
                node_results=node_list,
                status=status,
                validation=validation,
                synthesis=synthesis,
                evidence=self.evidence.to_dict_list(run_id),
                debate=debate,
                live_signals=live_signals,
                metadata={
                    "tool_count": len(results),
                    "execution": synthesis.get("execution_metadata", {}),
                },
            )
            self.memory.store_run(run_id, report)
            await self._emit(
                on_event,
                ExecutionEvent(ExecutionEventType.RUN_COMPLETED, run_id, {"status": status}),
            )
            return report
        except Exception as exc:
            logger.exception("execution_failed", run_id=run_id)
            return ExecutionReport(
                run_id=run_id,
                query=dag.query,
                node_results=list(results.values()),
                status="failed",
                metadata={"error": str(exc)},
            )
        finally:
            self._active_tasks.pop(run_id, None)
            self._cancel_flags.pop(run_id, None)

    async def cancel(self, run_id: str) -> bool:
        flag = self._cancel_flags.get(run_id)
        if not flag:
            return False
        flag.set()
        for task in self._active_tasks.get(run_id, []):
            task.cancel()
        return True

    def plan_from_router(
        self,
        chain: List[ToolRecommendation],
        inputs_by_tool: Dict[str, Dict[str, Any]],
        query: str = "",
        parallel: bool = False,
    ) -> ExecutionDAG:
        if parallel:
            tools = [(rec.tool_name, inputs_by_tool.get(rec.tool_name, {})) for rec in chain]
            return build_parallel_dag(tools, query=query)
        return build_linear_dag(chain, inputs_by_tool, query=query)

    async def _run_node(
        self,
        node,
        dag: ExecutionDAG,
        results: Dict[str, NodeResult],
        run_id: str,
        on_event: Optional[EventCallback],
    ) -> NodeResult:
        if self._cancel_flags.get(run_id) and self._cancel_flags[run_id].is_set():
            nr = NodeResult(node.id, node.tool_name, NodeStatus.CANCELLED, error="Run cancelled")
            results[node.id] = nr
            return nr

        for dep in node.depends_on:
            dep_result = results.get(dep)
            if not dep_result or dep_result.status != NodeStatus.SUCCESS:
                nr = NodeResult(
                    node.id,
                    node.tool_name,
                    NodeStatus.SKIPPED,
                    error=f"Dependency {dep} not successful",
                )
                results[node.id] = nr
                return nr

        await self._emit(
            on_event,
            ExecutionEvent(
                ExecutionEventType.NODE_STARTED,
                run_id,
                {"node_id": node.id, "tool": node.tool_name},
            ),
        )

        span = self.tracer.start_span("tool.execute", tool=node.tool_name, node_id=node.id)
        start = time.perf_counter()
        attempts = 0
        last_error: Optional[str] = None

        async def _invoke_once() -> Dict[str, Any]:
            return await self.tools.invoke(node.tool_name, node.params)

        try:
            for attempt in range(node.max_retries + 1):
                if self._cancel_flags.get(run_id) and self._cancel_flags[run_id].is_set():
                    break
                attempts = attempt + 1
                try:
                    output = await with_timeout(_invoke_once(), node.timeout_seconds)
                    compressed = compress_tool_result(node.tool_name, output)
                    obs = self.memory.add_observation(
                        run_id,
                        node.tool_name,
                        output,
                        compressed=compressed,
                    )
                    self.evidence.register_tool_output(
                        run_id,
                        node.tool_name,
                        output,
                        observation_ts=obs.timestamp,
                    )
                    latency = (time.perf_counter() - start) * 1000
                    nr = NodeResult(
                        node.id,
                        node.tool_name,
                        NodeStatus.SUCCESS,
                        output=output,
                        latency_ms=latency,
                        attempts=attempts,
                    )
                    results[node.id] = nr
                    span.finish(success=True, latency_ms=latency)
                    await self._emit(
                        on_event,
                        ExecutionEvent(
                            ExecutionEventType.NODE_COMPLETED,
                            run_id,
                            {"node_id": node.id, "tool": node.tool_name, "latency_ms": latency},
                        ),
                    )
                    return nr
                except asyncio.TimeoutError:
                    last_error = f"Timeout after {node.timeout_seconds}s"
                except Exception as exc:
                    last_error = str(exc)
                if attempt < node.max_retries:
                    await asyncio.sleep(node.retry_backoff_seconds * (2**attempt))

            status = NodeStatus.TIMEOUT if "Timeout" in (last_error or "") else NodeStatus.FAILED
            latency = (time.perf_counter() - start) * 1000
            nr = NodeResult(
                node.id,
                node.tool_name,
                status,
                error=last_error,
                latency_ms=latency,
                attempts=attempts,
            )
            results[node.id] = nr
            span.finish(success=False, error=last_error)
            await self._emit(
                on_event,
                ExecutionEvent(
                    ExecutionEventType.NODE_FAILED,
                    run_id,
                    {"node_id": node.id, "tool": node.tool_name, "error": last_error},
                ),
            )
            return nr
        finally:
            pass

    def _overall_status(self, results: Dict[str, NodeResult]) -> str:
        if any(r.status == NodeStatus.CANCELLED for r in results.values()):
            return "cancelled"
        if any(r.status in (NodeStatus.FAILED, NodeStatus.TIMEOUT) for r in results.values()):
            return "partial" if any(r.status == NodeStatus.SUCCESS for r in results.values()) else "failed"
        if any(r.status == NodeStatus.SKIPPED for r in results.values()):
            return "partial"
        return "success"

    async def _emit(self, callback: Optional[EventCallback], event: ExecutionEvent) -> None:
        if callback is None:
            return
        maybe = callback(event)
        if asyncio.iscoroutine(maybe):
            await maybe
