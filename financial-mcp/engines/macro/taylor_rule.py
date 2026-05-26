from pydantic import BaseModel, Field


class TaylorRuleInput(BaseModel):
    inflation_rate: float = Field(..., ge=-2.0, le=20.0, description="Headline inflation (% YoY)")
    output_gap: float = Field(..., ge=-10.0, le=10.0, description="Output gap (% of potential GDP)")
    neutral_rate: float = Field(2.5, ge=0.0, le=10.0)
    inflation_target: float = Field(2.0, ge=0.0, le=5.0)
    inflation_weight: float = Field(1.5, gt=0.0)
    output_weight: float = Field(0.5, ge=0.0)


class TaylorRuleOutput(BaseModel):
    implied_policy_rate: float
    inflation_gap: float
    deviation_from_neutral: float
    metadata: dict = {"model": "taylor_rule", "source": "Taylor (1993)"}


def taylor_rule_implied_rate(inp: TaylorRuleInput) -> TaylorRuleOutput:
    inflation_gap = inp.inflation_rate - inp.inflation_target
    implied = (
        inp.neutral_rate
        + inp.inflation_weight * inflation_gap
        + inp.output_weight * inp.output_gap
    )
    return TaylorRuleOutput(
        implied_policy_rate=round(implied, 4),
        inflation_gap=round(inflation_gap, 4),
        deviation_from_neutral=round(implied - inp.neutral_rate, 4),
    )
