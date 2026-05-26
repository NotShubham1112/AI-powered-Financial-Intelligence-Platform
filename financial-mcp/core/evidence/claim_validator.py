from __future__ import annotations

import re
from typing import Any, Dict, List

from core.evidence.models import UnverifiedClaim


class ClaimValidator:
    """
    Validates numeric ranges from engine outputs and flags
    common hallucination patterns in free-text (for LLM guidance).
    """

    RANGE_RULES: Dict[str, Dict[str, tuple[float, float]]] = {
        "rsi_indicator": {"rsi": (0.0, 100.0)},
        "merton_default_prob": {"default_probability": (0.0, 1.0)},
        "yield_curve_signal": {"ten_year_yield": (0.0, 20.0), "two_year_yield": (0.0, 20.0)},
    }

    HALLUCINATION_PATTERNS = [
        re.compile(r"\b\d{1,3}[-–]\d{1,3}%\s+market\s+share\b", re.I),
        re.compile(r"\b\d+(\.\d+)?[Mm]\+?\s+developers\b", re.I),
        re.compile(r"\b\d+x\s+(inference|efficiency)\b", re.I),
    ]

    def validate_engine_output(self, tool_name: str, output: Dict[str, Any]) -> List[str]:
        flags: List[str] = []
        rules = self.RANGE_RULES.get(tool_name, {})
        for field, (lo, hi) in rules.items():
            val = output.get(field)
            if val is None:
                continue
            try:
                num = float(val)
            except (TypeError, ValueError):
                flags.append(f"{tool_name}.{field}: non-numeric")
                continue
            if not lo <= num <= hi:
                flags.append(f"{tool_name}.{field}: out_of_range ({num})")
        return flags

    def scan_free_text(self, text: str) -> List[UnverifiedClaim]:
        """Detect likely unsourced quantitative claims in narrative text."""
        unverified: List[UnverifiedClaim] = []
        for pattern in self.HALLUCINATION_PATTERNS:
            for match in pattern.finditer(text):
                unverified.append(
                    UnverifiedClaim(
                        text=match.group(0),
                        reason="No engine-backed evidence binding for this quantitative claim.",
                        suggested_action="Replace with tool output or add explicit source citation.",
                    )
                )
        return unverified
