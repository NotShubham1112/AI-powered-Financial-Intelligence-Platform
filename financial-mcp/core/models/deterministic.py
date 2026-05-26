"""Engine-only synthesis when LLM providers are unavailable."""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class DeterministicSynthesizer:
    """Build structured JSON + markdown without LLM dependency."""

    def synthesize(
        self,
        query: str,
        tool_results: List[Dict[str, Any]],
        validation: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        summaries = [
            {"tool": r.get("tool_name", "unknown"), "summary": r.get("output", r)}
            for r in tool_results
        ]
        narrative_parts = [f"Deterministic analysis for: {query[:200]}"]
        for s in summaries[:6]:
            narrative_parts.append(f"- {s['tool']}: {s['summary']}")

        return {
            "mode": "deterministic",
            "narrative": "\n".join(narrative_parts),
            "tool_summaries": summaries,
            "validation": validation or {"confidence": 0.65, "flags": ["llm_unavailable"]},
            "recommendations": [
                "Retry inference when OpenRouter free tier recovers.",
                "Use slash commands for full engine workflows.",
            ],
        }
