from mcp.server.fastmcp import FastMCP
from engines.macro.taylor_rule import TaylorRuleInput, taylor_rule_implied_rate
from engines.macro.yield_spread import YieldSpreadInput, yield_curve_signal as compute_yield_curve_signal
from engines.macro.inflation_momentum import InflationMomentumInput, inflation_momentum
from validation.financial_assumptions import validate_cpi_series
import structlog

logger = structlog.get_logger(__name__)


def register_macro_tools(mcp: FastMCP) -> None:

    @mcp.tool()
    async def taylor_rule(
        inflation_rate: float,
        output_gap: float,
        neutral_rate: float = 2.5,
        inflation_target: float = 2.0,
    ) -> dict:
        """Taylor-rule implied policy rate from inflation and output gap."""
        logger.info("taylor_rule called", inflation_rate=inflation_rate)
        result = taylor_rule_implied_rate(
            TaylorRuleInput(
                inflation_rate=inflation_rate,
                output_gap=output_gap,
                neutral_rate=neutral_rate,
                inflation_target=inflation_target,
            )
        )
        return result.model_dump()

    @mcp.tool()
    async def yield_curve_signal(
        ten_year_yield: float,
        two_year_yield: float,
    ) -> dict:
        """10Y–2Y spread and recession-style curve state."""
        result = compute_yield_curve_signal(
            YieldSpreadInput(
                ten_year_yield=ten_year_yield,
                two_year_yield=two_year_yield,
            )
        )
        return result.model_dump()

    @mcp.tool()
    async def inflation_momentum_tool(
        cpi_levels: list[float],
        lookback_months: int = 12,
    ) -> dict:
        """YoY and annualized MoM inflation momentum from CPI levels."""
        validate_cpi_series(cpi_levels, lookback_months)
        result = inflation_momentum(
            InflationMomentumInput(
                cpi_levels=cpi_levels,
                lookback_months=lookback_months,
            )
        )
        return result.model_dump()
