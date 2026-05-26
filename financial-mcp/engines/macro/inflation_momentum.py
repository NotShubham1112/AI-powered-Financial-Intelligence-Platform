import numpy as np
from pydantic import BaseModel, Field
from typing import List


class InflationMomentumInput(BaseModel):
    cpi_levels: List[float] = Field(..., min_length=13)
    lookback_months: int = Field(12, ge=3, le=60)


class InflationMomentumOutput(BaseModel):
    yoy_inflation_pct: float
    mom_annualized_pct: float
    momentum_signal: str
    metadata: dict = {"method": "cpi_yoy_and_annualized_mom"}


def inflation_momentum(inp: InflationMomentumInput) -> InflationMomentumOutput:
    levels = np.array(inp.cpi_levels, dtype=float)
    if np.any(levels <= 0):
        raise ValueError("CPI levels must be positive")

    yoy = (levels[-1] / levels[-1 - inp.lookback_months] - 1) * 100
    mom = (levels[-1] / levels[-2] - 1) * 100
    mom_ann = ((1 + mom / 100) ** 12 - 1) * 100

    if yoy > 4.0 and mom_ann > yoy:
        signal = "accelerating"
    elif yoy < 2.0 and mom_ann < yoy:
        signal = "disinflating"
    else:
        signal = "stable"

    return InflationMomentumOutput(
        yoy_inflation_pct=round(float(yoy), 4),
        mom_annualized_pct=round(float(mom_ann), 4),
        momentum_signal=signal,
    )
