from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


@dataclass
class MetricClassification:
    name: str
    status: str  # "observed" | "estimated" | "critical_unknown"
    source: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class ComputeInfrastructure:
    category: str  # "hyperscaler" | "startup_sme"
    capacity_mw: Optional[float]
    capex_usd_b: Optional[float]
    rack_density_kw: Optional[float]
    cooling_model: Optional[str]  # "air" | "liquid" | "hybrid"
    energy_constraint: Optional[str]
    pue: Optional[float]

    def is_complete(self) -> Tuple[bool, List[str]]:
        missing = []
        if self.rack_density_kw is None:
            missing.append("rack_density_kw")
        if self.cooling_model is None:
            missing.append("cooling_model")
        if self.energy_constraint is None:
            missing.append("energy_constraint")
        if self.pue is None:
            missing.append("pue")
        return (len(missing) == 0, missing)


@dataclass
class MacroProjectionCheck:
    label: str
    values: List[Tuple[int, float]]  # (year, value)
    has_structural_break: bool
    break_annotation: Optional[str]
    is_smooth: bool
    notes: List[str] = field(default_factory=list)


class MacroConsistencyValidator:
    def classify_metric(self, name: str, source: Optional[str] = None) -> MetricClassification:
        if source and source.lower() in (
            "fred", "bls", "bea", "imf", "world bank", "oecd",
            "nasdaq", "yfinance", "bloomberg", "reuters",
        ):
            return MetricClassification(name=name, status="observed", source=source)
        if source and source.lower() in (
            "consensus estimate", "model projection", "forecast",
            "economist survey", "simulation",
        ):
            return MetricClassification(name=name, status="estimated", source=source)
        return MetricClassification(
            name=name,
            status="critical_unknown",
            source=source,
            notes="Requires external validation",
        )

    def check_compute_infrastructure(
        self, infra: ComputeInfrastructure
    ) -> Dict[str, object]:
        complete, missing = infra.is_complete()
        if not complete:
            return {
                "status": "incomplete",
                "category": infra.category,
                "missing_fields": missing,
                "note": "Compute Model Incomplete",
            }
        return {
            "status": "complete",
            "category": infra.category,
            "capacity_mw": infra.capacity_mw,
            "capex_usd_b": infra.capex_usd_b,
            "rack_density_kw": infra.rack_density_kw,
            "cooling_model": infra.cooling_model,
            "energy_constraint": infra.energy_constraint,
            "pue": infra.pue,
        }

    def check_macro_projection(self, check: MacroProjectionCheck) -> Dict[str, object]:
        if len(check.values) < 3:
            return {
                "label": check.label,
                "status": "insufficient_data",
                "is_smooth": True,
                "notes": ["Less than 3 data points; cannot assess smoothness"],
            }

        sorted_vals = sorted(check.values, key=lambda x: x[0])
        annual_growth_rates = []

        for i in range(1, len(sorted_vals)):
            _, prev_v = sorted_vals[i - 1]
            _, curr_v = sorted_vals[i]
            if prev_v <= 0:
                continue
            growth = (curr_v - prev_v) / prev_v
            annual_growth_rates.append(growth)

        if not annual_growth_rates:
            return {
                "label": check.label,
                "status": "error",
                "is_smooth": False,
                "notes": ["Cannot compute growth rates (zero/negative base values)"],
            }

        max_jump = max(annual_growth_rates) if annual_growth_rates else 0.0
        mean_growth = sum(annual_growth_rates) / len(annual_growth_rates)
        std_growth = (
            (sum((g - mean_growth) ** 2 for g in annual_growth_rates) / len(annual_growth_rates)) ** 0.5
            if len(annual_growth_rates) > 1
            else 0.0
        )

        has_jump = std_growth > 0.15 and max_jump > 2.0 * mean_growth + std_growth
        notes = []

        if has_jump:
            if check.has_structural_break and check.break_annotation:
                notes.append(f"Structural break detected: {check.break_annotation}")
            else:
                notes.append(
                    "Exponential jump without justification — annotate as "
                    "'Structural break assumption applied' or revise projection"
                )

        if check.has_structural_break and not has_jump:
            notes.append(
                "Structural break annotated but no significant jump detected in data"
            )

        return {
            "label": check.label,
            "status": "ok",
            "is_smooth": not has_jump,
            "max_single_jump": round(max_jump, 4),
            "mean_growth": round(mean_growth, 4),
            "growth_volatility": round(std_growth, 4),
            "has_unannotated_jump": has_jump and not check.break_annotation,
            "notes": notes + check.notes,
        }

    def check_infrastructure_scale_mixing(
        self, metrics: List[Dict[str, object]]
    ) -> List[str]:
        violations = []
        hyperscaler_metrics = []
        startup_metrics = []

        for m in metrics:
            if m.get("scale") == "hyperscaler":
                hyperscaler_metrics.append(m.get("name", ""))
            elif m.get("scale") == "startup":
                startup_metrics.append(m.get("name", ""))

        if hyperscaler_metrics and startup_metrics:
            for hm in hyperscaler_metrics:
                for sm in startup_metrics:
                    violations.append(
                        f"Mixing hyperscaler-scale metric '{hm}' with startup-scale metric "
                        f"'{sm}' in same bucket — separate by scale category"
                    )

        return violations

    def check_arbitrary_percentages(
        self, metrics: List[Dict[str, object]]
    ) -> List[str]:
        violations = []
        arbitrary_fields = [
            "talent penetration", "migration rate", "enterprise adoption rate",
            "penetration rate", "adoption percentage", "talent adoption",
        ]

        for m in metrics:
            name = str(m.get("name", "")).lower()
            source = str(m.get("source", "")).lower()
            is_explicit = source in ("explicitly defined", "derived", "observed benchmark")

            for field in arbitrary_fields:
                if field in name and not is_explicit:
                    violations.append(
                        f"'{m.get('name')}' appears to be an arbitrary percentage — "
                        f"must be explicitly defined or derived from a source"
                    )
                    break

        return violations


def format_compute_section(
    infra_list: List[ComputeInfrastructure],
) -> str:
    lines = ["### Compute Infrastructure Verification", ""]
    for infra in infra_list:
        lines.append(f"**Category: {infra.category}**")
        if infra.capacity_mw is not None:
            lines.append(f"- Capacity: {infra.capacity_mw} MW")
        if infra.capex_usd_b is not None:
            lines.append(f"- CapEx: ${infra.capex_usd_b}B")
        complete, missing = infra.is_complete()
        if complete:
            lines.append(f"- Rack Density: {infra.rack_density_kw} kW/rack")
            lines.append(f"- Cooling: {infra.cooling_model}")
            lines.append(f"- Energy: {infra.energy_constraint}")
            lines.append(f"- PUE: {infra.pue}")
            lines.append("  ✓ Compute Model Complete")
        else:
            lines.append(f"  ⚠ Compute Model Incomplete — missing: {', '.join(missing)}")
        lines.append("")
    return "\n".join(lines)


def format_macro_consistency_section(
    checks: List[Dict[str, object]],
) -> str:
    lines = ["### Macro Consistency Check", ""]
    all_ok = True
    for check in checks:
        label = check.get("label", "Unnamed")
        status = check.get("status", "unknown")
        is_smooth = check.get("is_smooth", True)
        notes = check.get("notes", [])

        if not is_smooth:
            all_ok = False

        icon = "✓" if is_smooth else "⚠"
        lines.append(f"{icon} {label}: {'Smooth' if is_smooth else 'Jump detected'}")
        for note in notes:
            lines.append(f"  - {note}")

    if all_ok:
        lines.append("")
        lines.append("Macro consistency: PASSED — all projections are smooth")
    return "\n".join(lines)
