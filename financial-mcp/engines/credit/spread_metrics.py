from pydantic import BaseModel, Field


class CreditSpreadInput(BaseModel):
    bond_yield: float = Field(..., ge=0.0, le=30.0)
    risk_free_yield: float = Field(..., ge=0.0, le=20.0)
    recovery_rate: float = Field(0.4, ge=0.0, le=1.0)
    years_to_maturity: float = Field(5.0, gt=0.0, le=30.0)


class CreditSpreadOutput(BaseModel):
    spread_bps: float
    hazard_rate_approx: float
    implied_rating_bucket: str
    metadata: dict = {"method": "spread_to_hazard_approx"}


def credit_spread_analysis(inp: CreditSpreadInput) -> CreditSpreadOutput:
    spread = max(inp.bond_yield - inp.risk_free_yield, 0.0)
    spread_bps = round(spread * 10000, 2)
    # λ ≈ s / ((1-R) * T) — simplified CDS hazard approximation
    hazard = spread / ((1 - inp.recovery_rate) * inp.years_to_maturity)

    if spread_bps < 100:
        bucket = "investment_grade_tight"
    elif spread_bps < 300:
        bucket = "investment_grade"
    elif spread_bps < 600:
        bucket = "high_yield"
    else:
        bucket = "distressed"

    return CreditSpreadOutput(
        spread_bps=spread_bps,
        hazard_rate_approx=round(hazard, 6),
        implied_rating_bucket=bucket,
    )
