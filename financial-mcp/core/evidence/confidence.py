from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional


class SourceConfidenceEngine:
    """
    Score confidence for engine-backed claims using tool success,
    source authority tier, and observation freshness.
    """

    AUTHORITY_TIERS: dict[str, float] = {
        "engine": 0.92,
        "fed": 0.88,
        "bls": 0.86,
        "academic": 0.84,
        "market_data": 0.80,
        "heuristic": 0.55,
    }

    def score(
        self,
        *,
        tool_name: str,
        authoritative_source: Optional[str] = None,
        observation_ts: Optional[str] = None,
        has_contradiction: bool = False,
    ) -> tuple[float, int]:
        base = self.AUTHORITY_TIERS["engine"]
        src = (authoritative_source or "").lower()
        if "fed" in src or "nber" in src:
            base = max(base, self.AUTHORITY_TIERS["fed"])
        elif "bls" in src or "cpi" in src:
            base = max(base, self.AUTHORITY_TIERS["bls"])
        elif any(x in src for x in ("merton", "black", "taylor", "damodaran", "cfa")):
            base = max(base, self.AUTHORITY_TIERS["academic"])

        freshness_days = self._freshness_days(observation_ts)
        if freshness_days > 90:
            base -= 0.08
        elif freshness_days > 30:
            base -= 0.04

        if has_contradiction:
            base -= 0.12

        if tool_name in ("rsi_indicator", "macd_indicator", "bollinger_bands"):
            base = min(base, 0.82)

        return round(max(0.35, min(0.98, base)), 4), freshness_days

    def _freshness_days(self, observation_ts: Optional[str]) -> int:
        if not observation_ts:
            return 0
        try:
            ts = datetime.fromisoformat(observation_ts.replace("Z", "+00:00"))
            delta = datetime.now(timezone.utc) - ts
            return max(0, delta.days)
        except (ValueError, TypeError):
            return 0
