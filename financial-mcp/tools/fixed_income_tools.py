from datetime import date
from mcp.server.fastmcp import FastMCP
from engines.fixed_income.bonds import BondInput, bond_price_duration
import structlog

logger = structlog.get_logger(__name__)


def register_fixed_income_tools(mcp: FastMCP) -> None:

    @mcp.tool()
    async def bond_analytics(
        coupon_rate: float,
        yield_to_maturity: float,
        maturity_date: str,
        settlement_date: str,
        face_value: float = 1000.0,
        coupon_frequency: int = 2,
    ) -> dict:
        """Bond price, duration, convexity, and accrued interest."""
        result = bond_price_duration(
            BondInput(
                face_value=face_value,
                coupon_rate=coupon_rate,
                coupon_frequency=coupon_frequency,
                maturity_date=date.fromisoformat(maturity_date),
                settlement_date=date.fromisoformat(settlement_date),
                yield_to_maturity=yield_to_maturity,
            )
        )
        return result.model_dump()
