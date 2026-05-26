import pytest

from orchestration.pipeline import AgentPipeline


@pytest.mark.asyncio
async def test_pipeline_end_to_end():
    pipeline = AgentPipeline()
    result = await pipeline.run(
        "yield curve recession and taylor rule inflation",
        {
            "yield_curve_signal": {"ten_year_yield": 3.8, "two_year_yield": 4.0},
            "taylor_rule": {"inflation_rate": 3.5, "output_gap": 0.5},
        },
        max_steps=2,
        parallel=True,
    )
    assert result.report.status == "success"
    assert result.report.validation is not None
    assert result.report.synthesis is not None


@pytest.mark.asyncio
async def test_equity_research_skill():
    pipeline = AgentPipeline()
    result = await pipeline.run_skill(
        "equity_research",
        "equity research macro technicals credit",
    )
    assert result.skill_artifact is not None
    assert result.skill_artifact.skill_name == "equity_research"
    assert len(result.skill_artifact.tools_used) == 3
