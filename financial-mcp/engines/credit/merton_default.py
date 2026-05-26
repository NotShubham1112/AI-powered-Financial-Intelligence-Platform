import numpy as np
from scipy.stats import norm
from pydantic import BaseModel, Field


class MertonDefaultInput(BaseModel):
    equity_market_value: float = Field(..., gt=0)
    debt_face_value: float = Field(..., gt=0)
    asset_volatility: float = Field(..., gt=0.0, le=3.0)
    risk_free_rate: float = Field(..., ge=0.0, le=0.25)
    time_horizon_years: float = Field(1.0, gt=0.0, le=10.0)


class MertonDefaultOutput(BaseModel):
    default_probability: float
    distance_to_default: float
    implied_asset_value: float
    metadata: dict = {"model": "merton_structural", "source": "Merton (1974)"}


def merton_default_probability(inp: MertonDefaultInput) -> MertonDefaultOutput:
    """Structural default prob. using equity-as-call on firm assets (simplified single-period)."""
    e = inp.equity_market_value
    d = inp.debt_face_value
    sigma = inp.asset_volatility
    r = inp.risk_free_rate
    t = inp.time_horizon_years

    # Approximate asset value as equity + debt (book leverage proxy)
    v = e + d
    d1 = (np.log(v / d) + (r + 0.5 * sigma**2) * t) / (sigma * np.sqrt(t))
    d2 = d1 - sigma * np.sqrt(t)
    dd = d2
    prob = float(norm.cdf(-dd))

    return MertonDefaultOutput(
        default_probability=round(prob, 6),
        distance_to_default=round(float(dd), 6),
        implied_asset_value=round(float(v), 4),
    )
