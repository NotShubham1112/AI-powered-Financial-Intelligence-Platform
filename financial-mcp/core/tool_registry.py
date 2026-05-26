"""Direct tool invocation registry (bypasses MCP transport for runtime execution)."""

from __future__ import annotations

import asyncio
import inspect
from typing import Any, Awaitable, Callable, Dict

from engines.credit.merton_default import MertonDefaultInput, merton_default_probability
from engines.credit.spread_metrics import CreditSpreadInput, credit_spread_analysis
from engines.derivatives.black_scholes import BlackScholesInput, black_scholes
from engines.macro.inflation_momentum import InflationMomentumInput, inflation_momentum
from engines.macro.taylor_rule import TaylorRuleInput, taylor_rule_implied_rate
from engines.macro.yield_spread import YieldSpreadInput, yield_curve_signal as compute_yield_curve_signal
from engines.technicals.indicators import (
    BollingerInput,
    MACDInput,
    RSIInput,
    compute_bollinger,
    compute_macd,
    compute_rsi,
)
from engines.valuation.dcf import DCFValuationInput, dcf_valuation
from validation.financial_assumptions import (
    validate_cpi_series,
    validate_dcf_input,
    validate_merton_input,
    validate_price_series,
)

ToolHandler = Callable[..., Dict[str, Any] | Awaitable[Dict[str, Any]]]


def _dump(model: Any) -> Dict[str, Any]:
    return model.model_dump() if hasattr(model, "model_dump") else dict(model)


class ToolRegistry:
    def __init__(self) -> None:
        self._handlers: Dict[str, ToolHandler] = {}

    def register(self, name: str, handler: ToolHandler) -> None:
        self._handlers[name] = handler

    def has(self, name: str) -> bool:
        return name in self._handlers

    def list_tools(self) -> list[str]:
        return sorted(self._handlers.keys())

    async def invoke(self, name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        if name not in self._handlers:
            raise KeyError(f"Unknown tool: {name}")
        handler = self._handlers[name]
        if inspect.iscoroutinefunction(handler):
            result = await handler(**params)
        else:
            result = await asyncio.to_thread(handler, **params)
        if not isinstance(result, dict):
            raise TypeError(f"Tool {name} must return a dict, got {type(result)}")
        return result


def _register_defaults(reg: ToolRegistry) -> None:
    def taylor_rule(
        inflation_rate: float,
        output_gap: float,
        neutral_rate: float = 2.5,
        inflation_target: float = 2.0,
        **_,
    ) -> Dict[str, Any]:
        return _dump(
            taylor_rule_implied_rate(
                TaylorRuleInput(
                    inflation_rate=inflation_rate,
                    output_gap=output_gap,
                    neutral_rate=neutral_rate,
                    inflation_target=inflation_target,
                )
            )
        )

    def yield_curve_signal(ten_year_yield: float, two_year_yield: float, **_) -> Dict[str, Any]:
        return _dump(
            compute_yield_curve_signal(
                YieldSpreadInput(ten_year_yield=ten_year_yield, two_year_yield=two_year_yield)
            )
        )

    def inflation_momentum_tool(cpi_levels: list, lookback_months: int = 12, **_) -> Dict[str, Any]:
        validate_cpi_series(cpi_levels, lookback_months)
        return _dump(
            inflation_momentum(
                InflationMomentumInput(cpi_levels=cpi_levels, lookback_months=lookback_months)
            )
        )

    def merton_default_prob(
        equity_market_value: float,
        debt_face_value: float,
        asset_volatility: float,
        risk_free_rate: float,
        time_horizon_years: float = 1.0,
        **_,
    ) -> Dict[str, Any]:
        validate_merton_input(equity_market_value, debt_face_value, asset_volatility)
        return _dump(
            merton_default_probability(
                MertonDefaultInput(
                    equity_market_value=equity_market_value,
                    debt_face_value=debt_face_value,
                    asset_volatility=asset_volatility,
                    risk_free_rate=risk_free_rate,
                    time_horizon_years=time_horizon_years,
                )
            )
        )

    def credit_spread_analysis_tool(
        bond_yield: float,
        risk_free_yield: float,
        recovery_rate: float = 0.4,
        years_to_maturity: float = 5.0,
        **_,
    ) -> Dict[str, Any]:
        return _dump(
            credit_spread_analysis(
                CreditSpreadInput(
                    bond_yield=bond_yield,
                    risk_free_yield=risk_free_yield,
                    recovery_rate=recovery_rate,
                    years_to_maturity=years_to_maturity,
                )
            )
        )

    def rsi_indicator(prices: list, period: int = 14, **_) -> Dict[str, Any]:
        validate_price_series(prices, min_length=period + 1)
        return _dump(compute_rsi(RSIInput(prices=prices, period=period)))

    def macd_indicator(
        prices: list,
        fast_period: int = 12,
        slow_period: int = 26,
        signal_period: int = 9,
        **_,
    ) -> Dict[str, Any]:
        validate_price_series(prices, min_length=slow_period + signal_period)
        return _dump(
            compute_macd(
                MACDInput(
                    prices=prices,
                    fast_period=fast_period,
                    slow_period=slow_period,
                    signal_period=signal_period,
                )
            )
        )

    def bollinger_bands(prices: list, period: int = 20, num_std: float = 2.0, **_) -> Dict[str, Any]:
        validate_price_series(prices, min_length=period)
        return _dump(compute_bollinger(BollingerInput(prices=prices, period=period, num_std=num_std)))

    def black_scholes_tool(
        spot: float,
        strike: float,
        time_to_expiry: float,
        risk_free_rate: float,
        volatility: float,
        option_type: str = "call",
        **_,
    ) -> Dict[str, Any]:
        return _dump(
            black_scholes(
                BlackScholesInput(
                    spot=spot,
                    strike=strike,
                    time_to_expiry=time_to_expiry,
                    risk_free_rate=risk_free_rate,
                    volatility=volatility,
                    option_type=option_type,
                )
            )
        )

    def dcf_valuation_tool(
        fcf_projections: list,
        terminal_growth_rate: float,
        wacc: float,
        net_debt: float = 0.0,
        shares_outstanding: float = 1.0,
        ticker: str = "N/A",
        **_,
    ) -> Dict[str, Any]:
        validate_dcf_input(fcf_projections, terminal_growth_rate, wacc)
        return _dump(
            dcf_valuation(
                DCFValuationInput(
                    free_cash_flows=fcf_projections,
                    terminal_growth_rate=terminal_growth_rate,
                    wacc=wacc,
                    net_debt=net_debt,
                    shares_outstanding=shares_outstanding,
                )
            )
        )

    reg.register("taylor_rule", taylor_rule)
    reg.register("yield_curve_signal", yield_curve_signal)
    reg.register("inflation_momentum_tool", inflation_momentum_tool)
    reg.register("merton_default_prob", merton_default_prob)
    reg.register("credit_spread_analysis_tool", credit_spread_analysis_tool)
    reg.register("rsi_indicator", rsi_indicator)
    reg.register("macd_indicator", macd_indicator)
    reg.register("bollinger_bands", bollinger_bands)
    reg.register("black_scholes", black_scholes_tool)
    reg.register("dcf_valuation_tool", dcf_valuation_tool)


def build_default_tool_registry() -> ToolRegistry:
    reg = ToolRegistry()
    _register_defaults(reg)
    return reg
