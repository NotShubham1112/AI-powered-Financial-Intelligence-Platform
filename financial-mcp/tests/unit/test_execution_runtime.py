import asyncio

import pytest

from core.executor.dag_builder import build_parallel_dag
from core.executor.models import ExecutionDAG, ExecutionNode, NodeStatus
from core.executor.runtime import ExecutionRuntime
from core.tool_registry import build_default_tool_registry
from core.validators.risk_validator import FinancialRiskValidator


@pytest.mark.asyncio
async def test_parallel_dag_execution():
    dag = build_parallel_dag(
        [
            ("taylor_rule", {"inflation_rate": 3.0, "output_gap": 0.0}),
            ("yield_curve_signal", {"ten_year_yield": 3.8, "two_year_yield": 4.0}),
        ],
        query="macro check",
    )
    runtime = ExecutionRuntime(build_default_tool_registry())
    report = await runtime.execute(dag)
    assert report.status == "success"
    assert len(report.node_results) == 2
    assert all(r.status == NodeStatus.SUCCESS for r in report.node_results)


@pytest.mark.asyncio
async def test_dag_levels_parallel_batch():
    dag = ExecutionDAG(query="test")
    dag.add_node(ExecutionNode(id="a", tool_name="taylor_rule", params={"inflation_rate": 2.0, "output_gap": 0}))
    dag.add_node(ExecutionNode(id="b", tool_name="yield_curve_signal", params={"ten_year_yield": 4.0, "two_year_yield": 3.5}))
    dag.add_node(
        ExecutionNode(
            id="c",
            tool_name="rsi_indicator",
            params={"prices": [100 + i for i in range(20)]},
            depends_on=["a", "b"],
        )
    )
    levels = dag.execution_levels()
    assert levels[0] == ["a", "b"]
    assert levels[1] == ["c"]


@pytest.mark.asyncio
async def test_unknown_tool_marks_node_failed():
    dag = ExecutionDAG(query="missing-tool")
    dag.add_node(
        ExecutionNode(
            id="bad",
            tool_name="nonexistent_tool",
            params={},
            max_retries=0,
        )
    )
    runtime = ExecutionRuntime(build_default_tool_registry())
    report = await runtime.execute(dag)
    assert report.node_results[0].status == NodeStatus.FAILED


def test_risk_validator_detects_contradiction():
    from core.executor.models import NodeResult

    validator = FinancialRiskValidator()
    results = [
        NodeResult("1", "yield_curve_signal", NodeStatus.SUCCESS, output={"recession_signal": True}),
        NodeResult("2", "rsi_indicator", NodeStatus.SUCCESS, output={"signal": "overbought"}),
    ]
    v = validator.validate_run(results)
    assert v["passed"] is False
    assert len(v["contradictions"]) >= 1


@pytest.mark.asyncio
async def test_cancel_run():
    dag = build_parallel_dag(
        [("taylor_rule", {"inflation_rate": 2.0, "output_gap": 0})] * 1,
    )
    runtime = ExecutionRuntime(build_default_tool_registry())

    async def cancel_soon():
        await asyncio.sleep(0.001)
        await runtime.cancel(dag.run_id)

    task = asyncio.create_task(runtime.execute(dag))
    cancel_task = asyncio.create_task(cancel_soon())
    report = await task
    await cancel_task
    assert report.status in ("cancelled", "success", "partial")
