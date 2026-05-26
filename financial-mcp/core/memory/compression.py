from typing import Any, Dict

# Fields preserved per tool for token-efficient agent context
_COMPRESS_KEYS: Dict[str, list[str]] = {
    "yield_curve_signal": ["spread_bps", "curve_state", "recession_signal"],
    "taylor_rule": ["implied_policy_rate", "inflation_gap"],
    "inflation_momentum_tool": ["yoy_inflation_pct", "momentum_signal"],
    "merton_default_prob": ["default_probability", "distance_to_default"],
    "credit_spread_analysis_tool": ["spread_bps", "implied_rating_bucket"],
    "rsi_indicator": ["rsi", "signal"],
    "macd_indicator": ["macd_line", "signal_line", "histogram", "crossover"],
    "bollinger_bands": ["upper_band", "lower_band", "percent_b"],
    "black_scholes": ["theoretical_price", "greeks"],
    "dcf_valuation_tool": ["implied_share_price", "enterprise_value", "equity_value"],
}


def compress_tool_result(tool_name: str, output: Dict[str, Any]) -> Dict[str, Any]:
    keys = _COMPRESS_KEYS.get(tool_name)
    if not keys:
        return {k: output[k] for k in list(output.keys())[:8]}
    compressed: Dict[str, Any] = {}
    for key in keys:
        if key in output:
            compressed[key] = output[key]
        elif key == "greeks" and "greeks" in output:
            g = output["greeks"]
            compressed["greeks"] = g if isinstance(g, dict) else getattr(g, "model_dump", lambda: g)()
    return compressed
