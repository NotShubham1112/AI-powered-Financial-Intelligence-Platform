from engines.macro.taylor_rule import TaylorRuleInput, taylor_rule_implied_rate
from engines.macro.yield_spread import YieldSpreadInput, yield_curve_signal
from engines.macro.inflation_momentum import InflationMomentumInput, inflation_momentum


def test_taylor_rule_raises_with_high_inflation():
    out = taylor_rule_implied_rate(
        TaylorRuleInput(inflation_rate=4.0, output_gap=1.0)
    )
    assert out.implied_policy_rate > 2.5


def test_yield_curve_inverted():
    out = yield_curve_signal(YieldSpreadInput(ten_year_yield=3.8, two_year_yield=4.0))
    assert out.recession_signal is True
    assert out.curve_state == "inverted"


def test_inflation_momentum():
    levels = [100 + i * 0.3 for i in range(14)]
    out = inflation_momentum(InflationMomentumInput(cpi_levels=levels))
    assert out.yoy_inflation_pct > 0
