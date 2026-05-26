from hypothesis import given, settings
import hypothesis.strategies as st
from engines.derivatives.black_scholes import BlackScholesInput, black_scholes


@given(
    spot=st.floats(min_value=1, max_value=500),
    strike=st.floats(min_value=1, max_value=500),
    tte=st.floats(min_value=0.01, max_value=5),
    r=st.floats(min_value=0, max_value=0.15),
    vol=st.floats(min_value=0.05, max_value=1.5),
)
@settings(max_examples=50)
def test_call_price_non_negative(spot, strike, tte, r, vol):
    out = black_scholes(
        BlackScholesInput(
            spot=spot,
            strike=strike,
            time_to_expiry=tte,
            risk_free_rate=r,
            volatility=vol,
            option_type="call",
        )
    )
    assert out.theoretical_price >= 0
