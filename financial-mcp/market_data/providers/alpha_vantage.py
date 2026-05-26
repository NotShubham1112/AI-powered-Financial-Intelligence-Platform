from abc import ABC, abstractmethod
from .normalization.schemas import OHLCV, BalanceSheet, IncomeStatement, YieldCurvePoint
from typing import List

class MarketDataProvider(ABC):
    @abstractmethod
    async def get_ohlcv(self, ticker: str, start: date, end: date) -> List[OHLCV]:
        ...
    @abstractmethod
    async def get_balance_sheet(self, ticker: str) -> BalanceSheet:
        ...
    @abstractmethod
    async def get_income_statement(self, ticker: str) -> IncomeStatement:
        ...
    @abstractmethod
    async def get_yield_curve(self, date: date) -> List[YieldCurvePoint]:
        ...