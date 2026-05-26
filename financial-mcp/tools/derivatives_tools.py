from mcp.server.fastmcp import FastMCP
from engines.derivatives.black_scholes import BlackScholesInput, black_scholes as black_scholes_engine
import structlog

logger = structlog.get_logger(__name__)


def register_derivatives_tools(mcp: FastMCP) -> None:

    @mcp.tool()
    async def black_scholes(
        spot: float,
        strike: float,
        time_to_expiry: float,
        risk_free_rate: float,
        volatility: float,
        option_type: str = "call",
    ) -> dict:
        """Black-Scholes-Merton option price and Greeks."""
        result = black_scholes_engine(
            BlackScholesInput(
                spot=spot,
                strike=strike,
                time_to_expiry=time_to_expiry,
                risk_free_rate=risk_free_rate,
                volatility=volatility,
                option_type=option_type,
            )
        )
        return result.model_dump()
