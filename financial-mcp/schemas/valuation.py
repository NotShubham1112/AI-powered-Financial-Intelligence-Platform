from pydantic import BaseModel, Field
from typing import List, Optional


class DCFToolInput(BaseModel):
    ticker: str = "N/A"
    fcf_projections: List[float]
    terminal_growth_rate: float
    wacc: float
    net_debt: float = 0.0
    shares_outstanding: float = 1.0


class SensitivityItem(BaseModel):
    wacc: float
    growth: float
    equity_value_per_share: float


class DCFValuationOutput(BaseModel):
    enterprise_value: float
    equity_value: float
    implied_share_price: float
    terminal_value: float
    discount_rate: float
    terminal_growth_rate: float
    sensitivity_matrix: List[SensitivityItem] = Field(default_factory=list)
