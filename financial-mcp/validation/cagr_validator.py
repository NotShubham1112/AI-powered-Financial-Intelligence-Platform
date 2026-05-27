from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


class CAGRValidationError(ValueError):
    pass


@dataclass
class CAGRResult:
    computed_cagr: float
    stated_cagr: Optional[float]
    absolute_discrepancy: Optional[float]
    flag: str  
    values: Tuple[float, float]
    years: int

    def discrepancy_exceeds(self, threshold: float) -> bool:
        if self.absolute_discrepancy is None:
            return False
        return self.absolute_discrepancy > threshold


@dataclass
class CAGRValidationReport:
    entries: List[CAGRResult] = field(default_factory=list)
    passed: bool = True
    errors: List[str] = field(default_factory=list)
    corrections: List[str] = field(default_factory=list)


def compute_cagr(initial: float, final: float, years: int) -> float:
    if initial <= 0:
        raise CAGRValidationError(f"Initial value must be positive, got {initial}")
    if final <= 0:
        raise CAGRValidationError(f"Final value must be positive, got {final}")
    if years <= 0:
        raise CAGRValidationError(f"Years must be positive, got {years}")
    if initial == final:
        return 0.0
    return (final / initial) ** (1.0 / years) - 1.0


def validate_cagr(
    initial: float,
    final: float,
    years: int,
    stated_cagr: Optional[float] = None,
    label: str = "",
) -> CAGRResult:
    computed = compute_cagr(initial, final, years)
    flag = "ok"
    discrepancy = None

    if stated_cagr is not None:
        discrepancy = abs(computed - stated_cagr)
        if discrepancy >= 0.02:
            flag = "must_rewrite"
        elif discrepancy >= 0.005:
            flag = "flag_error"

    return CAGRResult(
        computed_cagr=round(computed, 6),
        stated_cagr=stated_cagr,
        absolute_discrepancy=round(discrepancy, 6) if discrepancy is not None else None,
        flag=flag,
        values=(initial, final),
        years=years,
    )


def validate_market_table(
    rows: List[dict],
    year_col: str = "year",
    value_col: str = "value",
    cagr_col: Optional[str] = None,
    label: str = "Market Table",
) -> CAGRValidationReport:
    report = CAGRValidationReport()

    if len(rows) < 2:
        report.errors.append(f"{label}: Need at least 2 rows for CAGR validation")
        report.passed = False
        return report

    sorted_rows = sorted(rows, key=lambda r: r.get(year_col, 0))
    first_year = sorted_rows[0].get(year_col)
    first_val = sorted_rows[0].get(value_col)
    last_year = sorted_rows[-1].get(year_col)
    last_val = sorted_rows[-1].get(value_col)

    if not isinstance(first_val, (int, float)) or first_val <= 0:
        report.errors.append(f"{label}: Invalid initial value {first_val}")
        report.passed = False
        return report
    if not isinstance(last_val, (int, float)) or last_val <= 0:
        report.errors.append(f"{label}: Invalid final value {last_val}")
        report.passed = False
        return report

    years_span = last_year - first_year
    if years_span <= 0:
        report.errors.append(f"{label}: Year span must be positive (got {years_span})")
        report.passed = False
        return report

    stated = None
    if cagr_col and cagr_col in sorted_rows[-1]:
        stated = sorted_rows[-1].get(cagr_col)
        if stated is not None:
            stated = float(stated)

    result = validate_cagr(first_val, last_val, years_span, stated, label)
    report.entries.append(result)

    intermediate_checks = []
    for i in range(1, len(sorted_rows) - 1):
        intermediate_checks.append(sorted_rows[i])

    if result.flag == "must_rewrite":
        report.passed = False
        report.errors.append(
            f"{label}: CAGR discrepancy ≥2% — must rewrite values. "
            f"Computed: {result.computed_cagr:.4f}, Stated: {result.stated_cagr:.4f}"
        )
        report.corrections.append(
            f"Recalculate {label} values to align with CAGR of {result.computed_cagr:.4f} "
            f"or adjust stated CAGR to {result.computed_cagr:.2%}"
        )
    elif result.flag == "flag_error":
        report.errors.append(
            f"{label}: CAGR discrepancy ≥0.5% — requires review. "
            f"Computed: {result.computed_cagr:.4f}, Stated: {result.stated_cagr:.4f}"
        )
        report.corrections.append(
            f"Review {label}: stated CAGR {result.stated_cagr:.4f} vs computed {result.computed_cagr:.4f}"
        )

    return report


def format_cagr_verification_block(
    initial: float,
    final: float,
    years: int,
    stated_cagr: Optional[float] = None,
    label: str = "",
) -> str:
    result = validate_cagr(initial, final, years, stated_cagr, label)
    lines = [
        "### CAGR Verification Block",
        "",
        f"**{label}**" if label else "",
        f"- Formula: CAGR = ({final} / {initial}) ^ (1 / {years}) - 1",
        f"- Computed CAGR: {result.computed_cagr:.4f} ({result.computed_cagr:.2%})",
    ]
    if stated_cagr is not None:
        lines.append(f"- Stated CAGR: {stated_cagr:.4f} ({stated_cagr:.2%})")
        lines.append(f"- Discrepancy: ±{result.absolute_discrepancy:.6f}")
        lines.append(f"- Status: {result.flag}")
        if result.flag == "must_rewrite":
            lines.append("  [FAIL] DISCREPANCY >= 2% - VALUES MUST BE REWRITTEN")
        elif result.flag == "flag_error":
            lines.append("  [WARN] DISCREPANCY >= 0.5% - FLAG ERROR")
        else:
            lines.append("  [PASS] CAGR verified")
    else:
        lines.append(f"- Status: No stated CAGR to compare (computed value shown)")

    return "\n".join(lines)


def build_data_integrity_section(
    verified: List[str],
    estimated: List[str],
    critical_unknown: List[str],
) -> str:
    lines = [
        "### Data Integrity Section",
        "",
        "**Verified (observed benchmarks):**",
    ]
    for item in verified:
        lines.append(f"- {item}")
    lines.append("")
    lines.append("**Estimated (model-derived):**")
    for item in estimated:
        lines.append(f"- {item}")
    lines.append("")
    lines.append("**Critical Unknown (requires external validation):**")
    for item in critical_unknown:
        lines.append(f"- {item}")

    return "\n".join(lines)
