import pytest

from core.evidence.registry import EvidenceRegistry
from core.evidence.claim_validator import ClaimValidator
from core.executor.models import NodeResult, NodeStatus
from core.signals.live import LiveSignalEngine
from core.validators.risk_validator import FinancialRiskValidator
from orchestration.debate import DebateResolutionEngine


def test_evidence_registry_registers_rsi_claims():
    reg = EvidenceRegistry()
    claims = reg.register_tool_output(
        "run-1",
        "rsi_indicator",
        {"rsi": 68.2, "signal": "overbought", "period": 14},
        observation_ts="2026-05-25T12:00:00+00:00",
    )
    assert len(claims) >= 2
    assert all(c.confidence > 0.5 for c in claims)
    assert all(c.verified for c in claims)
    assert reg.get_claims("run-1")


def test_claim_validator_flags_hallucination_patterns():
    v = ClaimValidator()
    hits = v.scan_free_text("NVIDIA controls 80-85% market share with 4M+ developers")
    assert len(hits) >= 1


@pytest.mark.asyncio
async def test_debate_engine_reconciles_contradictions():
    validator = FinancialRiskValidator()
    results = [
        NodeResult(
            "1",
            "yield_curve_signal",
            NodeStatus.SUCCESS,
            output={"recession_signal": True, "spread_bps": -25, "curve_state": "inverted"},
        ),
        NodeResult(
            "2",
            "rsi_indicator",
            NodeStatus.SUCCESS,
            output={"rsi": 72, "signal": "overbought"},
        ),
    ]
    validation = validator.validate_run(results)
    reg = EvidenceRegistry()
    for nr in results:
        if nr.output:
            reg.register_tool_output("run-2", nr.tool_name, nr.output)
    debate = DebateResolutionEngine().resolve(
        results, validation, reg.get_claims("run-2")
    )
    assert debate["contradiction_score"] > 0
    assert debate["reconciliation"]
    assert "MacroAgent" in debate["agents_participated"]


def test_live_signals_from_tools():
    results = [
        NodeResult(
            "1",
            "rsi_indicator",
            NodeStatus.SUCCESS,
            output={"rsi": 68, "signal": "overbought"},
        ),
    ]
    signals = LiveSignalEngine().derive(results)
    assert any("Momentum" in s.label for s in signals)


@pytest.mark.asyncio
async def test_pipeline_includes_evidence_and_debate():
    from orchestration.pipeline import AgentPipeline

    pipeline = AgentPipeline()
    result = await pipeline.run(
        "yield curve recession rsi overbought",
        {
            "yield_curve_signal": {"ten_year_yield": 3.8, "two_year_yield": 4.2},
            "rsi_indicator": {"prices": [100 + i * 0.5 for i in range(30)], "period": 14},
        },
        max_steps=2,
        parallel=True,
    )
    assert result.report.evidence
    assert result.report.debate
    assert result.report.live_signals
    syn = result.report.synthesis or {}
    assert "quant_interpretation" in syn
    assert "execution_metadata" in syn
