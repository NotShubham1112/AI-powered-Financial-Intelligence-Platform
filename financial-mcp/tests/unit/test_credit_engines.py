from engines.credit.merton_default import MertonDefaultInput, merton_default_probability
from engines.credit.spread_metrics import CreditSpreadInput, credit_spread_analysis


def test_merton_default_probability_range():
    out = merton_default_probability(
        MertonDefaultInput(
            equity_market_value=500,
            debt_face_value=400,
            asset_volatility=0.25,
            risk_free_rate=0.04,
        )
    )
    assert 0 <= out.default_probability <= 1


def test_credit_spread_hy_bucket():
    out = credit_spread_analysis(
        CreditSpreadInput(bond_yield=0.08, risk_free_yield=0.04)
    )
    assert out.spread_bps == 400
    assert "yield" in out.implied_rating_bucket or "high" in out.implied_rating_bucket
