from engines.technicals.indicators import (
    RSIInput,
    MACDInput,
    BollingerInput,
    compute_rsi,
    compute_macd,
    compute_bollinger,
)


def _sample_prices(n: int = 40) -> list[float]:
    base = 100.0
    return [base + i * 0.5 + (i % 3) * 0.2 for i in range(n)]


def test_rsi_bounds():
    out = compute_rsi(RSIInput(prices=_sample_prices(), period=14))
    assert 0 <= out.rsi <= 100


def test_macd_histogram():
    out = compute_macd(MACDInput(prices=_sample_prices()))
    assert out.crossover in ("bullish_cross", "bearish_cross", "none")


def test_bollinger_bands_ordering():
    out = compute_bollinger(BollingerInput(prices=_sample_prices()))
    assert out.upper_band >= out.middle_band >= out.lower_band
