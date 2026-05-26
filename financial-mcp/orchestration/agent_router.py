"""
Agent orchestration layer: maps natural-language intents to MCP tools
using registry metadata (category, tags, complexity).
"""
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from registry.catalog import TOOL_CATALOG, get_tool_by_name


CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "valuation": ["dcf", "valuation", "intrinsic", "wacc", "fair value", "fundamental"],
    "derivatives": ["option", "black-scholes", "greeks", "volatility surface", "iv"],
    "macro": ["macro", "fed", "inflation", "cpi", "yield curve", "recession", "taylor", "rates"],
    "credit": ["credit", "default", "spread", "cds", "merton", "hazard", "distressed"],
    "technicals": ["rsi", "macd", "bollinger", "technical", "momentum", "overbought", "crossover"],
    "fixed_income": ["bond", "duration", "ytm", "convexity", "fixed income"],
    "risk": ["var", "stress", "risk", "portfolio"],
}


@dataclass
class ToolRecommendation:
    tool_name: str
    category: str
    score: float
    description: str
    requires_market_data: bool
    complexity: str
    tags: List[str]


class AgentRouter:
    """Selects MCP tools for an agent query from registry metadata."""

    def __init__(self, catalog: Optional[List[Dict[str, Any]]] = None):
        self.catalog = catalog or TOOL_CATALOG

    def recommend_tools(
        self,
        query: str,
        max_results: int = 5,
        category_filter: Optional[str] = None,
    ) -> List[ToolRecommendation]:
        q = query.lower()
        scored: List[ToolRecommendation] = []

        for entry in self.catalog:
            if category_filter and entry["category"] != category_filter:
                continue
            score = self._score_entry(entry, q)
            if score <= 0:
                continue
            scored.append(
                ToolRecommendation(
                    tool_name=entry["name"],
                    category=entry["category"],
                    score=score,
                    description=entry["description"],
                    requires_market_data=entry.get("requires_market_data", False),
                    complexity=entry.get("complexity", "medium"),
                    tags=entry.get("tags", []),
                )
            )

        scored.sort(key=lambda r: r.score, reverse=True)
        return scored[:max_results]

    def resolve_primary_tool(self, query: str) -> Optional[ToolRecommendation]:
        recs = self.recommend_tools(query, max_results=1)
        return recs[0] if recs else None

    def plan_tool_chain(self, query: str, max_steps: int = 3) -> List[ToolRecommendation]:
        """Ordered tools for multi-step agent workflows (e.g. macro -> valuation)."""
        recs = self.recommend_tools(query, max_results=max_steps * 2)
        seen_categories: set[str] = set()
        chain: List[ToolRecommendation] = []
        for rec in recs:
            if rec.category in seen_categories:
                continue
            seen_categories.add(rec.category)
            chain.append(rec)
            if len(chain) >= max_steps:
                break
        return chain

    def get_tool_metadata(self, tool_name: str) -> Optional[Dict[str, Any]]:
        return get_tool_by_name(tool_name)

    def _score_entry(self, entry: Dict[str, Any], query: str) -> float:
        score = 0.0
        name = entry["name"].replace("_", " ")
        if name in query or entry["name"] in query:
            score += 3.0
        for tag in entry.get("tags", []):
            if tag.lower() in query:
                score += 2.0
        if entry["category"] in query:
            score += 1.5
        for kw in CATEGORY_KEYWORDS.get(entry["category"], []):
            if kw in query:
                score += 1.0
        desc_words = entry["description"].lower().split()
        for word in desc_words:
            if len(word) > 4 and word in query:
                score += 0.5
        return score
