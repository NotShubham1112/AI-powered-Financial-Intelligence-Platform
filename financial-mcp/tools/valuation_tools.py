from mcp.server.fastmcp import FastMCP
from engines.valuation.dcf import dcf_valuation, DCFValuationInput
from validation.financial_assumptions import validate_dcf_input
import structlog

logger = structlog.get_logger(__name__)

def register_valuation_tools(mcp: FastMCP):
    
    @mcp.tool()
    async def dcf_valuation_tool(ticker: str, fcf_projections: list[float],
                                  terminal_growth_rate: float, wacc: float,
                                  net_debt: float = 0.0, shares_outstanding: float = 1.0) -> dict:
        """
        Perform a two-stage DCF valuation for a given ticker.
        """
        logger.info("dcf_valuation_tool called", ticker=ticker)
        validate_dcf_input(fcf_projections, terminal_growth_rate, wacc)
        
        # Optionally fetch market data for shares outstanding, net debt if not provided
        # md = MarketDataManager()
        # if not shares_outstanding: ...
        
        eng_input = DCFValuationInput(
            free_cash_flows=fcf_projections,
            terminal_growth_rate=terminal_growth_rate,
            wacc=wacc,
            net_debt=net_debt,
            shares_outstanding=shares_outstanding
        )
        result = dcf_valuation(eng_input)
        return result.model_dump()