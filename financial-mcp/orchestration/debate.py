from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Dict, List

from core.executor.models import NodeResult, NodeStatus
from core.evidence.models import EvidenceClaim


@dataclass
class DebatePosition:
    agent: str
    thesis: str
    confidence: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class DebateResolutionEngine:
    """
    Cross-agent debate synthesis: bull vs risk thesis, contradiction scoring,
    confidence adjustment, and reconciled narrative.
    """

    AGENT_MAP = {
        "yield_curve_signal": "MacroAgent",
        "taylor_rule": "MacroAgent",
        "inflation_momentum_tool": "MacroAgent",
        "rsi_indicator": "QuantAgent",
        "macd_indicator": "QuantAgent",
        "bollinger_bands": "QuantAgent",
        "dcf_valuation_tool": "ValuationAgent",
        "merton_default_prob": "RiskAgent",
        "credit_spread_analysis_tool": "RiskAgent",
        "black_scholes": "DerivativesAgent",
    }

    def resolve(
        self,
        node_results: List[NodeResult],
        validation: Dict[str, Any],
        evidence: List[EvidenceClaim],
    ) -> Dict[str, Any]:
        bull: List[DebatePosition] = []
        bear: List[DebatePosition] = []
        agents_participated: List[str] = []

        for nr in node_results:
            if nr.status != NodeStatus.SUCCESS or not nr.output:
                continue
            agent = self.AGENT_MAP.get(nr.tool_name, "EngineAgent")
            if agent not in agents_participated:
                agents_participated.append(agent)
            thesis_bull, conf_bull = self._bull_case(nr)
            if thesis_bull:
                bull.append(DebatePosition(agent, thesis_bull, conf_bull))
            thesis_bear, conf_bear = self._bear_case(nr)
            if thesis_bear:
                bear.append(DebatePosition(agent, thesis_bear, conf_bear))

        contradictions = validation.get("contradictions", [])
        contradiction_score = min(1.0, 0.2 * len(contradictions))

        for c in contradictions:
            bear.append(
                DebatePosition(
                    "RiskAgent",
                    c,
                    round(max(0.5, validation.get("confidence", 0.5)), 4),
                )
            )

        base_conf = validation.get("confidence", 0.5)
        adjusted_confidence = round(max(0.2, base_conf - 0.1 * len(contradictions)), 4)

        reconciliation = self._reconcile(bull, bear, contradictions, evidence)
        resolution = "bull_weighted" if len(bull) > len(bear) and not contradictions else (
            "risk_weighted" if contradictions else "balanced"
        )

        return {
            "bull_thesis": [p.to_dict() for p in bull],
            "risk_thesis": [p.to_dict() for p in bear],
            "contradiction_score": round(contradiction_score, 4),
            "adjusted_confidence": adjusted_confidence,
            "resolution": resolution,
            "reconciliation": reconciliation,
            "agents_participated": agents_participated,
        }

    def _bull_case(self, nr: NodeResult) -> tuple[str | None, float]:
        data = nr.output or {}
        tool = nr.tool_name
        if tool == "rsi_indicator" and data.get("signal") in ("neutral", "oversold"):
            return f"Momentum supportive - RSI {data.get('rsi', 'N/A')} ({data.get('signal')})", 0.72
        if tool == "macd_indicator" and data.get("crossover") == "bullish_cross":
            return "MACD bullish crossover supports risk-on positioning", 0.75
        if tool == "yield_curve_signal" and not data.get("recession_signal"):
            return "No yield-curve recession signal - macro backdrop not flashing stress", 0.7
        if tool == "dcf_valuation_tool":
            px = data.get("implied_share_price")
            return f"DCF intrinsic anchor at ${px} supports valuation discipline", 0.68
        return None, 0.0

    def _bear_case(self, nr: NodeResult) -> tuple[str | None, float]:
        data = nr.output or {}
        tool = nr.tool_name
        if tool == "yield_curve_signal" and data.get("recession_signal"):
            return "Inverted yield curve - late-cycle macro risk elevated", 0.78
        if tool == "rsi_indicator" and data.get("signal") == "overbought":
            rsi = data.get("rsi", 70)
            return (
                f"Momentum remains constructive but RSI {rsi:.0f} suggests "
                "late-stage acceleration / breadth divergence risk",
                0.76,
            )
        if tool == "merton_default_prob" and data.get("default_probability", 0) > 0.08:
            return f"Structural default probability {data['default_probability']:.1%} - credit stress", 0.8
        if tool == "credit_spread_analysis_tool" and "tight" in str(data.get("implied_rating_bucket", "")):
            return "Tight credit spreads may be complacent vs macro - monitor lag risk", 0.74
        return None, 0.0

    def _reconcile(
        self,
        bull: List[DebatePosition],
        bear: List[DebatePosition],
        contradictions: List[str],
        evidence: List[EvidenceClaim],
    ) -> str:
        if contradictions:
            return (
                "Valuation premium risk and macro/technical divergence require explicit reconciliation: "
                f"{contradictions[0]}. "
                "Base-case conviction should be discounted until signals align or catalyst clarifies direction."
            )
        if bull and bear:
            return (
                "Bull and risk agents both contribute valid lenses - weight engine-backed evidence "
                f"({len(evidence)} claims) over narrative extrapolation. "
                "Favor probabilistic sizing until cross-domain alignment improves."
            )
        if bull:
            return "Cross-agent alignment skews constructive; monitor for regime shift in live signals."
        return "Insufficient engine coverage for strong directional conviction - widen scenario bands."
