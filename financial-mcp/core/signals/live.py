from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Dict, List

from core.executor.models import NodeResult, NodeStatus


@dataclass
class LiveSignal:
    label: str
    direction: str  # up | down | stable | elevated | compressed
    detail: str
    source_tool: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class LiveSignalEngine:
    """Derive live intelligence blocks from latest engine observations."""

    def derive(self, node_results: List[NodeResult]) -> List[LiveSignal]:
        signals: List[LiveSignal] = []
        for nr in node_results:
            if nr.status != NodeStatus.SUCCESS or not nr.output:
                continue
            data = nr.output
            tool = nr.tool_name

            if tool == "yield_curve_signal":
                recession = data.get("recession_signal")
                spread = data.get("spread_bps", 0)
                if recession:
                    signals.append(
                        LiveSignal(
                            "Macro recession signal",
                            "elevated",
                            f"Inverted / flat curve - spread {spread} bps",
                            tool,
                        )
                    )
                else:
                    signals.append(
                        LiveSignal(
                            "Yield curve regime",
                            "stable",
                            f"No inversion signal - spread {spread} bps",
                            tool,
                        )
                    )

            if tool == "rsi_indicator":
                rsi = data.get("rsi", 50)
                regime = data.get("signal", "neutral")
                direction = "up" if regime == "overbought" else "down" if regime == "oversold" else "stable"
                signals.append(
                    LiveSignal(
                        "Momentum breadth",
                        direction,
                        f"RSI {rsi:.1f} - {regime} - watch for late-stage acceleration risk if >65",
                        tool,
                    )
                )

            if tool == "macd_indicator":
                cross = data.get("crossover", "none")
                if cross == "bullish_cross":
                    signals.append(
                        LiveSignal(
                            "MACD momentum",
                            "up",
                            "Bullish crossover - constructive but confirm with macro",
                            tool,
                        )
                    )
                elif cross == "bearish_cross":
                    signals.append(
                        LiveSignal(
                            "MACD momentum",
                            "down",
                            "Bearish crossover - momentum deterioration",
                            tool,
                        )
                    )

            if tool == "inflation_momentum_tool":
                mom = data.get("momentum_signal", "stable")
                signals.append(
                    LiveSignal(
                        "Inflation momentum",
                        "up" if mom == "accelerating" else "down" if mom == "decelerating" else "stable",
                        f"CPI momentum: {mom}",
                        tool,
                    )
                )

            if tool == "credit_spread_analysis_tool":
                bucket = data.get("implied_rating_bucket", "unknown")
                signals.append(
                    LiveSignal(
                        "Credit conditions",
                        "compressed" if "tight" in str(bucket) else "elevated",
                        f"Spread bucket: {bucket}",
                        tool,
                    )
                )

            if tool == "merton_default_prob":
                dp = data.get("default_probability", 0)
                if dp > 0.1:
                    signals.append(
                        LiveSignal(
                            "Structural credit risk",
                            "elevated",
                            f"Default probability {dp:.1%}",
                            tool,
                        )
                    )

        if not signals:
            signals.append(
                LiveSignal(
                    "Engine coverage",
                    "stable",
                    "Awaiting tool execution for live signal feed",
                    "system",
                )
            )
        return signals
