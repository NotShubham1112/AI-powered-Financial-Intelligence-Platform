from mcp.server.fastmcp import FastMCP
from engines.technicals.indicators import (
    RSIInput,
    MACDInput,
    BollingerInput,
    compute_rsi,
    compute_macd,
    compute_bollinger,
)
from validation.financial_assumptions import validate_price_series
import structlog

logger = structlog.get_logger(__name__)


def register_technicals_tools(mcp: FastMCP) -> None:

    @mcp.tool()
    async def rsi_indicator(prices: list[float], period: int = 14) -> dict:
        """Relative Strength Index (RSI) with overbought/oversold signal."""
        validate_price_series(prices, min_length=period + 1)
        return compute_rsi(RSIInput(prices=prices, period=period)).model_dump()

    @mcp.tool()
    async def macd_indicator(
        prices: list[float],
        fast_period: int = 12,
        slow_period: int = 26,
        signal_period: int = 9,
    ) -> dict:
        """MACD line, signal line, histogram, and crossover state."""
        validate_price_series(prices, min_length=slow_period + signal_period)
        return compute_macd(
            MACDInput(
                prices=prices,
                fast_period=fast_period,
                slow_period=slow_period,
                signal_period=signal_period,
            )
        ).model_dump()

    @mcp.tool()
    async def bollinger_bands(
        prices: list[float],
        period: int = 20,
        num_std: float = 2.0,
    ) -> dict:
        """Bollinger bands and %B for the latest price."""
        validate_price_series(prices, min_length=period)
        return compute_bollinger(
            BollingerInput(prices=prices, period=period, num_std=num_std)
        ).model_dump()
