from __future__ import annotations

from typing import Any, Dict, List, Optional

from core.executor.models import ExecutionDAG, ExecutionNode
from orchestration.agent_router import ToolRecommendation


def build_linear_dag(
    chain: List[ToolRecommendation],
    inputs_by_tool: Dict[str, Dict[str, Any]],
    query: str = "",
    *,
    timeout_seconds: float = 30.0,
    max_retries: int = 2,
) -> ExecutionDAG:
    """Chain tools sequentially; later steps depend on prior outputs in memory."""
    dag = ExecutionDAG(query=query)
    prev_id: Optional[str] = None
    for i, rec in enumerate(chain):
        node_id = f"step_{i}_{rec.tool_name}"
        dag.add_node(
            ExecutionNode(
                id=node_id,
                tool_name=rec.tool_name,
                params=inputs_by_tool.get(rec.tool_name, {}),
                depends_on=[prev_id] if prev_id else [],
                timeout_seconds=timeout_seconds,
                max_retries=max_retries,
            )
        )
        prev_id = node_id
    return dag


def build_parallel_dag(
    tools: List[tuple[str, Dict[str, Any]]],
    query: str = "",
    *,
    timeout_seconds: float = 30.0,
    max_retries: int = 2,
) -> ExecutionDAG:
    """Independent tools executed in one parallel batch."""
    dag = ExecutionDAG(query=query)
    for i, (tool_name, params) in enumerate(tools):
        dag.add_node(
            ExecutionNode(
                id=f"parallel_{i}_{tool_name}",
                tool_name=tool_name,
                params=params,
                depends_on=[],
                timeout_seconds=timeout_seconds,
                max_retries=max_retries,
            )
        )
    return dag


def build_fan_in_dag(
    parallel_tools: List[tuple[str, Dict[str, Any]]],
    aggregate_tool: tuple[str, Dict[str, Any]],
    query: str = "",
) -> ExecutionDAG:
    """Parallel research tools -> single synthesis/validation node."""
    dag = ExecutionDAG(query=query)
    parallel_ids: List[str] = []
    for i, (tool_name, params) in enumerate(parallel_tools):
        node_id = f"fan_{i}_{tool_name}"
        dag.add_node(ExecutionNode(id=node_id, tool_name=tool_name, params=params))
        parallel_ids.append(node_id)

    agg_name, agg_params = aggregate_tool
    dag.add_node(
        ExecutionNode(
            id="aggregate",
            tool_name=agg_name,
            params=agg_params,
            depends_on=parallel_ids,
        )
    )
    return dag
