from mcp.server.fastmcp import FastMCP
from tools.valuation_tools import register_valuation_tools
from tools.fixed_income_tools import register_fixed_income_tools
from tools.derivatives_tools import register_derivatives_tools
from tools.macro_tools import register_macro_tools
from tools.credit_tools import register_credit_tools
from tools.technicals_tools import register_technicals_tools


def load_all_tools(mcp: FastMCP) -> None:
    register_valuation_tools(mcp)
    register_fixed_income_tools(mcp)
    register_derivatives_tools(mcp)
    register_macro_tools(mcp)
    register_credit_tools(mcp)
    register_technicals_tools(mcp)
