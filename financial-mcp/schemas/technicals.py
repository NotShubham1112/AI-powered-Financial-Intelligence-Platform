from pydantic import BaseModel, Field
from typing import List


class RSIToolInput(BaseModel):
    prices: List[float]
    period: int = 14


class MACDToolInput(BaseModel):
    prices: List[float]
    fast_period: int = 12
    slow_period: int = 26
    signal_period: int = 9


class BollingerToolInput(BaseModel):
    prices: List[float]
    period: int = 20
    num_std: float = 2.0
