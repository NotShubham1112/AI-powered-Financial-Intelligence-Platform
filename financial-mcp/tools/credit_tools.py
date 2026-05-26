from mcp.server.fastmcp import FastMCP
from engines.credit.merton_default import MertonDefaultInput, merton_default_probability
from engines.credit.spread_metrics import CreditSpreadInput, credit_spread_analysis
from validation.financial_assumptions import validate_merton_input
import structlog

logger = structlog.get_logger(__name__)


def register_credit_tools(mcp: FastMCP) -> None:

    @mcp.tool()
    async def merton_default_prob(
        equity_market_value: float,
        debt_face_value: float,
        asset_volatility: float,
        risk_free_rate: float,
        time_horizon_years: float = 1.0,
    ) -> dict:
        """Merton structural default probability and distance to default."""
        validate_merton_input(equity_market_value, debt_face_value, asset_volatility)
        result = merton_default_probability(
            MertonDefaultInput(
                equity_market_value=equity_market_value,
                debt_face_value=debt_face_value,
                asset_volatility=asset_volatility,
                risk_free_rate=risk_free_rate,
                time_horizon_years=time_horizon_years,
            )
        )
        return result.model_dump()

    @mcp.tool()
    async def credit_spread_analysis_tool(
        bond_yield: float,
        risk_free_yield: float,
        recovery_rate: float = 0.4,
        years_to_maturity: float = 5.0,
    ) -> dict:
        """Credit spread (bps), hazard approximation, and rating bucket."""
        if bond_yield < risk_free_yield:
            raise ValueError("Bond yield must be >= risk-free yield for spread analysis.")
        result = credit_spread_analysis(
            CreditSpreadInput(
                bond_yield=bond_yield,
                risk_free_yield=risk_free_yield,
                recovery_rate=recovery_rate,
                years_to_maturity=years_to_maturity,
            )
        )
        return result.model_dump()
