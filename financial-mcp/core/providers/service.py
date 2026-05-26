from __future__ import annotations

from datetime import date
from typing import Dict, List, Optional, Type

from core.providers.base import MarketDataProvider
from market_data.normalization.schemas import OHLCV, YieldCurvePoint


class MarketDataService:
    """
    Unified market data facade — normalizes provider outputs for agents and skills.
    """

    def __init__(self, providers: Optional[Dict[str, MarketDataProvider]] = None) -> None:
        self._providers: Dict[str, MarketDataProvider] = providers or {}

    def register(self, name: str, provider: MarketDataProvider) -> None:
        self._providers[name] = provider

    def _resolve(self, provider: Optional[str] = None) -> MarketDataProvider:
        if provider and provider in self._providers:
            return self._providers[provider]
        if "yahoo" in self._providers:
            return self._providers["yahoo"]
        if self._providers:
            return next(iter(self._providers.values()))
        raise RuntimeError("No market data provider registered")

    async def get_ohlcv(
        self,
        ticker: str,
        start: date,
        end: date,
        *,
        provider: Optional[str] = None,
    ) -> List[OHLCV]:
        p = self._resolve(provider)
        rows = await p.get_ohlcv(ticker, start, end)
        return sorted(rows, key=lambda r: r.date)

    async def get_closes(self, ticker: str, start: date, end: date, **kwargs) -> List[float]:
        rows = await self.get_ohlcv(ticker, start, end, **kwargs)
        return [float(r.close) for r in rows]

    async def get_yield_curve(
        self,
        as_of: Optional[date] = None,
        *,
        provider: Optional[str] = None,
    ) -> List[YieldCurvePoint]:
        p = self._resolve(provider)
        return await p.get_yield_curve(as_of)


def build_market_data_service(
    provider_classes: Optional[Dict[str, Type[MarketDataProvider]]] = None,
) -> MarketDataService:
    """Factory; wire real providers when API keys are configured."""
    service = MarketDataService()
    if provider_classes:
        for name, cls in provider_classes.items():
            service.register(name, cls())
    return service
