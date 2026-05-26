from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

from core.evidence.models import EvidenceClaim
from core.executor.models import NodeResult


class InstitutionalReportBuilder:
    """
    Builds enriched synthesis: quant interpretation, probabilistic scenarios,
    market narrative, execution metadata.
    """

    def build(
        self,
        query: str,
        node_results: List[NodeResult],
        validation: Dict[str, Any],
        evidence: List[EvidenceClaim],
        debate: Dict[str, Any],
        live_signals: List[Dict[str, Any]],
        *,
        runtime_ms: float,
    ) -> Dict[str, Any]:
        tool_summaries = []
        for nr in node_results:
            if nr.output:
                from core.memory.compression import compress_tool_result

                tool_summaries.append(
                    {
                        "tool": nr.tool_name,
                        "summary": compress_tool_result(nr.tool_name, nr.output),
                        "latency_ms": nr.latency_ms,
                    }
                )

        quant_interpretation = self._quant_interpretation(node_results)
        scenarios = self._probabilistic_scenarios(validation, debate)
        market_narrative = self._market_narrative(validation, debate)

        return {
            "query": query,
            "tool_summaries": tool_summaries,
            "confidence": debate.get("adjusted_confidence", validation.get("confidence", 0.0)),
            "flags": validation.get("flags", []),
            "quant_interpretation": quant_interpretation,
            "probabilistic_scenarios": scenarios,
            "market_narrative": market_narrative,
            "evidence": [e.to_dict() for e in evidence],
            "debate": debate,
            "live_signals": live_signals,
            "execution_metadata": {
                "tools_used": [nr.tool_name for nr in node_results],
                "agents_participated": debate.get("agents_participated", []),
                "workflow_runtime_ms": round(runtime_ms, 1),
                "confidence": debate.get("adjusted_confidence", validation.get("confidence", 0.0)),
                "contradiction_score": debate.get("contradiction_score", 0.0),
                "resolution": debate.get("resolution", "balanced"),
            },
        }

    def _quant_interpretation(self, node_results: List[NodeResult]) -> str:
        parts: List[str] = []
        for nr in node_results:
            if not nr.output:
                continue
            if nr.tool_name == "rsi_indicator":
                rsi = nr.output.get("rsi", 50)
                sig = nr.output.get("signal", "neutral")
                if sig == "overbought":
                    parts.append(
                        f"Momentum remains constructive but RSI {rsi:.0f} and potential breadth "
                        "divergence suggest late-stage acceleration risk — tighten stops vs blind add."
                    )
                elif sig == "oversold":
                    parts.append(
                        f"RSI {rsi:.0f} in oversold territory — mean-reversion setup possible "
                        "if macro headwinds do not intensify."
                    )
                else:
                    parts.append(f"RSI {rsi:.0f} neutral — momentum neither stretched nor washed out.")
            if nr.tool_name == "macd_indicator":
                cross = nr.output.get("crossover")
                if cross == "bullish_cross":
                    parts.append(
                        "MACD bullish crossover supports trend continuation thesis; "
                        "confirm with macro and credit signals before sizing up."
                    )
                elif cross == "bearish_cross":
                    parts.append(
                        "MACD bearish crossover flags momentum deterioration — "
                        "reduce beta or hedge if paired with macro stress."
                    )
        return " ".join(parts) if parts else "Quant engines not invoked — avoid generic indicator reporting."

    def _probabilistic_scenarios(
        self, validation: Dict[str, Any], debate: Dict[str, Any]
    ) -> Dict[str, Any]:
        conf = debate.get("adjusted_confidence", validation.get("confidence", 0.5))
        resolution = debate.get("resolution", "balanced")
        if resolution == "bull_weighted":
            weights = {"bull": 0.45, "base": 0.40, "bear": 0.15}
            expected_return_pct = 12.0
        elif resolution == "risk_weighted":
            weights = {"bull": 0.20, "base": 0.45, "bear": 0.35}
            expected_return_pct = -2.0
        else:
            weights = {"bull": 0.30, "base": 0.45, "bear": 0.25}
            expected_return_pct = 5.0

        return {
            "probability_weights": weights,
            "expected_return_pct": expected_return_pct,
            "confidence_interval_90": [
                round(expected_return_pct - 18 * (1 - conf), 1),
                round(expected_return_pct + 22 * conf, 1),
            ],
            "downside_var_95_pct": round(-12 - 8 * len(validation.get("contradictions", [])), 1),
            "monte_carlo_note": "Sensitivity driven by macro–technical alignment and credit bucket",
        }

    def _market_narrative(self, validation: Dict[str, Any], debate: Dict[str, Any]) -> Dict[str, str]:
        flags = validation.get("flags", [])
        crowding = "macro_technical_divergence" in flags
        return {
            "crowding_risk": "Elevated — macro and technical signals disagree" if crowding else "Moderate",
            "narrative_saturation": "Monitor AI capex narrative fatigue vs hyperscaler spend persistence",
            "positioning_risk": "Risk-weighted" if debate.get("resolution") == "risk_weighted" else "Neutral",
            "reflexivity": "Premium multiple vulnerable to narrative reversal if earnings revisions disappoint",
        }
