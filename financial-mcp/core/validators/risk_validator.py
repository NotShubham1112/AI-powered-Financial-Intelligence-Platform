from __future__ import annotations

from typing import Any, Dict, List

from core.executor.models import NodeResult, NodeStatus


class FinancialRiskValidator:
    """
    Post-execution validation: contradiction detection, confidence, risk flags.
    """

    def validate_run(self, node_results: List[NodeResult]) -> Dict[str, Any]:
        signals = self._extract_signals(node_results)
        flags: List[str] = []
        contradictions: List[str] = []

        recession = signals.get("recession_signal")
        rsi_signal = signals.get("rsi_signal")
        credit_bucket = signals.get("credit_bucket")
        macd_cross = signals.get("macd_crossover")

        if recession is True and rsi_signal == "overbought":
            contradictions.append(
                "Macro recession signal conflicts with overbought RSI (risk-on technicals)."
            )
            flags.append("macro_technical_divergence")

        if recession is True and macd_cross == "bullish_cross":
            contradictions.append(
                "Inverted yield curve signal conflicts with bullish MACD crossover."
            )
            flags.append("macro_momentum_divergence")

        if recession is True and credit_bucket in ("investment_grade_tight", "investment_grade"):
            flags.append("credit_complacent_vs_macro")
            contradictions.append(
                "Recession macro signal alongside tight credit spreads - monitor for lag."
            )

        if signals.get("default_probability", 0) > 0.15 and credit_bucket == "investment_grade_tight":
            contradictions.append("High structural default probability vs tight spread bucket.")
            flags.append("credit_model_spread_mismatch")

        confidence = self._score_confidence(node_results, contradictions)
        return {
            "confidence": confidence,
            "flags": flags,
            "contradictions": contradictions,
            "signals": signals,
            "passed": len(contradictions) == 0,
        }

    def _extract_signals(self, results: List[NodeResult]) -> Dict[str, Any]:
        out: Dict[str, Any] = {}
        for nr in results:
            if nr.status != NodeStatus.SUCCESS or not nr.output:
                continue
            data = nr.output
            if "recession_signal" in data:
                out["recession_signal"] = data["recession_signal"]
            if "signal" in data and nr.tool_name == "rsi_indicator":
                out["rsi_signal"] = data["signal"]
            if "crossover" in data:
                out["macd_crossover"] = data["crossover"]
            if "implied_rating_bucket" in data:
                out["credit_bucket"] = data["implied_rating_bucket"]
            if "default_probability" in data:
                out["default_probability"] = data["default_probability"]
        return out

    def _score_confidence(self, results: List[NodeResult], contradictions: List[str]) -> float:
        success = sum(1 for r in results if r.status == NodeStatus.SUCCESS)
        total = max(len(results), 1)
        base = success / total
        penalty = min(0.4, 0.15 * len(contradictions))
        return round(max(0.0, base - penalty), 4)
