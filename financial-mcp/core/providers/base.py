from abc import ABC, abstractmethod
from datetime import date
from typing import List, Optional

from market_data.normalization.schemas import OHLCV, YieldCurvePoint


class MarketDataProvider(ABC):
    @abstractmethod
    async def get_ohlcv(
        self,
        ticker: str,
        start: date,
        end: date,
    ) -> List[OHLCV]:
        ...

    async def get_yield_curve(self, as_of: Optional[date] = None) -> List[YieldCurvePoint]:
        return []
