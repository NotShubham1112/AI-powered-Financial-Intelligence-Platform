from pydantic import BaseModel, Field
from typing import List


class TaylorRuleToolInput(BaseModel):
    inflation_rate: float
    output_gap: float
    neutral_rate: float = 2.5
    inflation_target: float = 2.0


class YieldSpreadToolInput(BaseModel):
    ten_year_yield: float
    two_year_yield: float


class InflationMomentumToolInput(BaseModel):
    cpi_levels: List[float]
    lookback_months: int = 12
