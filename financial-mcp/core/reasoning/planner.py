"""Phase 1-2: Intent Understanding + Planning."""
from __future__ import annotations

import json
import re
from typing import Optional

from core.reasoning.models import (
    Intent,
    ReasoningPlan,
    ReasoningStep,
    StepStatus,
)


class IntentAnalyzer:
    """Phase 1: Understand user intent and domain."""

    FINANCIAL_DOMAINS = {
        "stocks": ["stock", "equity", "share", "ticker", "price", "eps", "pe"],
        "crypto": ["crypto", "bitcoin", "ethereum", "token", "defi", "nft"],
        "portfolio": ["portfolio", "allocation", "diversification", "rebalance"],
        "macro": ["macro", "gdp", "inflation", "yield", "rates", "economy"],
        "fixed_income": ["bond", "yield", "coupon", "duration", "credit"],
        "derivatives": ["option", "future", "swap", "call", "put", "volatility"],
    }

    INTENT_TYPES = {
        "analysis": ["analyze", "examine", "evaluate", "assess", "review"],
        "comparison": ["compare", "versus", "vs", "difference", "which"],
        "strategy": ["build", "create", "strategy", "allocate", "construct"],
        "forecast": ["predict", "forecast", "expect", "project", "outlook"],
        "risk": ["risk", "exposure", "volatility", "downside", "stress"],
    }

    @staticmethod
    def analyze(query: str) -> Intent:
        """Analyze query intent and domain."""
        query_lower = query.lower()
        
        # Detect domain
        domain = "general"
        for domain_name, keywords in IntentAnalyzer.FINANCIAL_DOMAINS.items():
            if any(kw in query_lower for kw in keywords):
                domain = domain_name
                break

        # Detect intent type
        intent_type = "analysis"
        for itype, keywords in IntentAnalyzer.INTENT_TYPES.items():
            if any(kw in query_lower for kw in keywords):
                intent_type = itype
                break

        # Extract entities (ticker symbols, keywords)
        entities = re.findall(r'\b([A-Z]{1,5})\b', query)
        
        # Complexity heuristic
        is_complex = (
            len(query) > 100 or
            len(entities) > 1 or
            intent_type in ["strategy", "forecast", "comparison"] or
            domain in ["macro", "portfolio"]
        )

        return Intent(
            query=query,
            domain=domain,
            is_complex=is_complex,
            intent_type=intent_type,
            entities=entities,
            metadata={"query_length": len(query), "entity_count": len(entities)},
        )


class ReasoningPlanner:
    """Phase 2: Generate step-by-step TODO list."""

    STEP_TEMPLATES = {
        "stocks": [
            {
                "title": "Gather company fundamentals",
                "description": "Fetch financial statements, earnings, guidance",
                "tools": ["financial_statements", "earnings_data"],
            },
            {
                "title": "Analyze valuation metrics",
                "description": "Calculate PE, PB, dividend yield, growth metrics",
                "tools": ["valuation_engine"],
            },
            {
                "title": "Assess competitive positioning",
                "description": "Industry comparison, market share, moats",
                "tools": ["market_data"],
            },
            {
                "title": "Synthesize investment thesis",
                "description": "Generate recommendation with risk/reward",
                "tools": ["synthesis"],
            },
        ],
        "portfolio": [
            {
                "title": "Inventory current holdings",
                "description": "Gather asset classes, allocations, performance",
                "tools": ["portfolio_analyzer"],
            },
            {
                "title": "Define optimization objective",
                "description": "Determine goals: max return, min risk, sharpe ratio",
                "tools": ["constraint_validator"],
            },
            {
                "title": "Run portfolio optimization",
                "description": "Apply modern portfolio theory, constraints",
                "tools": ["portfolio_optimizer"],
            },
            {
                "title": "Generate rebalancing strategy",
                "description": "Target allocations, execution roadmap",
                "tools": ["synthesis"],
            },
        ],
        "macro": [
            {
                "title": "Analyze economic indicators",
                "description": "GDP, inflation, employment, rates, spreads",
                "tools": ["macro_indicators"],
            },
            {
                "title": "Assess regime and momentum",
                "description": "Identify market regime, trend strength",
                "tools": ["technicals", "signals"],
            },
            {
                "title": "Model policy impact",
                "description": "Central bank actions, fiscal policy effects",
                "tools": ["macro_models"],
            },
            {
                "title": "Forecast asset class returns",
                "description": "Expected returns by asset class",
                "tools": ["synthesis"],
            },
        ],
        "default": [
            {
                "title": "Gather contextual data",
                "description": "Collect relevant financial and market data",
                "tools": ["market_data"],
            },
            {
                "title": "Perform analysis",
                "description": "Apply financial models and frameworks",
                "tools": ["analysis_engine"],
            },
            {
                "title": "Validate findings",
                "description": "Verify results and check consistency",
                "tools": ["validators"],
            },
            {
                "title": "Synthesize recommendations",
                "description": "Generate final insights and recommendations",
                "tools": ["synthesis"],
            },
        ],
    }

    @staticmethod
    def plan(intent: Intent) -> ReasoningPlan:
        """Generate reasoning plan from intent."""
        
        # Select template based on domain
        templates = ReasoningPlanner.STEP_TEMPLATES.get(
            intent.domain,
            ReasoningPlanner.STEP_TEMPLATES["default"],
        )

        # Create steps
        steps = []
        for idx, template in enumerate(templates):
            step = ReasoningStep(
                id=f"step_{idx + 1}",
                title=template["title"],
                description=template["description"],
                depends_on=[f"step_{idx}"] if idx > 0 else [],  # Linear dependency
                status=StepStatus.NOT_STARTED,
                tools_needed=template.get("tools", []),
            )
            steps.append(step)

        goal = f"{intent.intent_type.capitalize()} {intent.domain} for: {intent.query}"

        return ReasoningPlan(
            intent=intent,
            goal=goal,
            steps=steps,
            total_steps=len(steps),
            estimated_duration_ms=30000,  # 30s estimate
            metadata={
                "domain": intent.domain,
                "intent_type": intent.intent_type,
                "entities": intent.entities,
            },
        )


def parse_reasoning_output(llm_response: str) -> dict:
    """Parse LLM response for structured reasoning."""
    # Try to extract JSON if present
    json_match = re.search(r'\{[\s\S]*\}', llm_response)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    
    # Fallback: return raw response
    return {"raw": llm_response}
