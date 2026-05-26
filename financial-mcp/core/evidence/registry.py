from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional

from core.evidence.claim_validator import ClaimValidator
from core.evidence.confidence import SourceConfidenceEngine
from core.evidence.models import EvidenceClaim
from registry.catalog import TOOL_CATALOG


class EvidenceRegistry:
    """
    Registers source-bound claims from deterministic tool outputs.
    """

    CLAIM_TEMPLATES: Dict[str, List[tuple[str, str, str]]] = {
        "yield_curve_signal": [
            ("spread_bps", "10Y-2Y yield spread is {value} bps", "spread_bps"),
            ("recession_signal", "Yield curve recession signal: {value}", "recession_signal"),
            ("curve_state", "Yield curve state: {value}", "curve_state"),
        ],
        "rsi_indicator": [
            ("rsi", "RSI({period}) = {value}", "rsi"),
            ("signal", "RSI regime signal: {value}", "signal"),
        ],
        "macd_indicator": [
            ("crossover", "MACD crossover: {value}", "crossover"),
            ("macd_line", "MACD line: {value}", "macd_line"),
        ],
        "merton_default_prob": [
            ("default_probability", "Structural default probability: {value:.2%}", "default_probability"),
            ("distance_to_default", "Distance to default: {value}", "distance_to_default"),
        ],
        "credit_spread_analysis_tool": [
            ("spread_bps", "Credit spread: {value} bps", "spread_bps"),
            ("implied_rating_bucket", "Implied rating bucket: {value}", "implied_rating_bucket"),
        ],
        "taylor_rule": [
            ("implied_policy_rate", "Taylor-rule implied policy rate: {value}%", "implied_policy_rate"),
            ("inflation_gap", "Inflation gap vs target: {value}", "inflation_gap"),
        ],
        "dcf_valuation_tool": [
            ("implied_share_price", "DCF implied share price: ${value}", "implied_share_price"),
            ("enterprise_value", "Enterprise value (DCF): ${value}", "enterprise_value"),
        ],
        "inflation_momentum_tool": [
            ("yoy_inflation_pct", "YoY inflation: {value}%", "yoy_inflation_pct"),
            ("momentum_signal", "Inflation momentum signal: {value}", "momentum_signal"),
        ],
    }

    def __init__(
        self,
        confidence_engine: Optional[SourceConfidenceEngine] = None,
        claim_validator: Optional[ClaimValidator] = None,
    ) -> None:
        self.confidence = confidence_engine or SourceConfidenceEngine()
        self.validator = claim_validator or ClaimValidator()
        self._claims: Dict[str, List[EvidenceClaim]] = {}
        self._catalog_sources = {
            t["name"]: t.get("authoritative_source", "FININTEL Engine")
            for t in TOOL_CATALOG
        }

    def register_tool_output(
        self,
        run_id: str,
        tool_name: str,
        output: Dict[str, Any],
        *,
        observation_ts: Optional[str] = None,
        has_contradiction: bool = False,
    ) -> List[EvidenceClaim]:
        validation_flags = self.validator.validate_engine_output(tool_name, output)
        source = self._catalog_sources.get(tool_name, "FININTEL Engine")
        conf, freshness = self.confidence.score(
            tool_name=tool_name,
            authoritative_source=source,
            observation_ts=observation_ts,
            has_contradiction=has_contradiction or bool(validation_flags),
        )

        registered: List[EvidenceClaim] = []
        templates = self.CLAIM_TEMPLATES.get(tool_name, [])
        for field_key, template, path in templates:
            if field_key not in output:
                continue
            value = output[field_key]
            claim_text = self._format_claim(template, value, output)
            claim = EvidenceClaim(
                claim_id=str(uuid.uuid4())[:8],
                claim=claim_text,
                source=f"{source} - {tool_name}",
                confidence=conf if not validation_flags else round(conf * 0.85, 4),
                freshness_days=freshness,
                tool_name=tool_name,
                field_path=path,
                value=value,
                verified=len(validation_flags) == 0,
                tags=[tool_name.split("_")[0]],
            )
            registered.append(claim)

        if not templates and output:
            for key, value in list(output.items())[:5]:
                registered.append(
                    EvidenceClaim(
                        claim_id=str(uuid.uuid4())[:8],
                        claim=f"{tool_name}: {key} = {value}",
                        source=f"{source} - {tool_name}",
                        confidence=conf,
                        freshness_days=freshness,
                        tool_name=tool_name,
                        field_path=key,
                        value=value,
                        verified=len(validation_flags) == 0,
                    )
                )

        self._claims.setdefault(run_id, []).extend(registered)
        return registered

    def get_claims(self, run_id: str) -> List[EvidenceClaim]:
        return list(self._claims.get(run_id, []))

    def to_dict_list(self, run_id: str) -> List[Dict[str, Any]]:
        return [c.to_dict() for c in self.get_claims(run_id)]

    def _format_claim(self, template: str, value: Any, output: Dict[str, Any]) -> str:
        fmt_value = value
        if isinstance(value, float) and "{value:.2%}" in template:
            fmt_value = f"{value:.1%}"
        elif isinstance(value, float) and "{value}" in template:
            fmt_value = round(value, 4) if abs(value) < 1000 else value
        period = output.get("period", 14)
        return template.format(value=fmt_value, period=period)
