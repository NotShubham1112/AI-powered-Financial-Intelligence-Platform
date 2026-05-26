import numpy as np
from pydantic import BaseModel, Field
from typing import List, Optional


class RSIInput(BaseModel):
    prices: List[float] = Field(..., min_length=15)
    period: int = Field(14, ge=2, le=50)


class RSIOutput(BaseModel):
    rsi: float
    signal: str
    metadata: dict = {"indicator": "rsi"}


class MACDInput(BaseModel):
    prices: List[float] = Field(..., min_length=35)
    fast_period: int = Field(12, ge=2, le=50)
    slow_period: int = Field(26, ge=5, le=100)
    signal_period: int = Field(9, ge=2, le=50)


class MACDOutput(BaseModel):
    macd_line: float
    signal_line: float
    histogram: float
    crossover: str
    metadata: dict = {"indicator": "macd"}


class BollingerInput(BaseModel):
    prices: List[float] = Field(..., min_length=20)
    period: int = Field(20, ge=5, le=100)
    num_std: float = Field(2.0, gt=0.0, le=4.0)


class BollingerOutput(BaseModel):
    upper_band: float
    middle_band: float
    lower_band: float
    percent_b: float
    metadata: dict = {"indicator": "bollinger"}


def _ema(series: np.ndarray, span: int) -> np.ndarray:
    alpha = 2 / (span + 1)
    out = np.empty_like(series)
    out[0] = series[0]
    for i in range(1, len(series)):
        out[i] = alpha * series[i] + (1 - alpha) * out[i - 1]
    return out


def compute_rsi(inp: RSIInput) -> RSIOutput:
    prices = np.array(inp.prices, dtype=float)
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0.0)
    losses = np.where(deltas < 0, -deltas, 0.0)
    avg_gain = np.mean(gains[-inp.period :])
    avg_loss = np.mean(losses[-inp.period :])
    if avg_loss == 0:
        rsi = 100.0
    else:
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

    if rsi >= 70:
        signal = "overbought"
    elif rsi <= 30:
        signal = "oversold"
    else:
        signal = "neutral"

    return RSIOutput(rsi=round(float(rsi), 4), signal=signal)


def compute_macd(inp: MACDInput) -> MACDOutput:
    prices = np.array(inp.prices, dtype=float)
    ema_fast = _ema(prices, inp.fast_period)
    ema_slow = _ema(prices, inp.slow_period)
    macd_line = ema_fast - ema_slow
    signal_line = _ema(macd_line, inp.signal_period)
    hist = macd_line[-1] - signal_line[-1]
    prev_hist = macd_line[-2] - signal_line[-2]

    if hist > 0 and prev_hist <= 0:
        crossover = "bullish_cross"
    elif hist < 0 and prev_hist >= 0:
        crossover = "bearish_cross"
    else:
        crossover = "none"

    return MACDOutput(
        macd_line=round(float(macd_line[-1]), 6),
        signal_line=round(float(signal_line[-1]), 6),
        histogram=round(float(hist), 6),
        crossover=crossover,
    )


def compute_bollinger(inp: BollingerInput) -> BollingerOutput:
    prices = np.array(inp.prices, dtype=float)
    window = prices[-inp.period :]
    mid = float(np.mean(window))
    std = float(np.std(window, ddof=0))
    upper = mid + inp.num_std * std
    lower = mid - inp.num_std * std
    last = float(prices[-1])
    pct_b = (last - lower) / (upper - lower) if upper != lower else 0.5

    return BollingerOutput(
        upper_band=round(upper, 6),
        middle_band=round(mid, 6),
        lower_band=round(lower, 6),
        percent_b=round(pct_b, 6),
    )
