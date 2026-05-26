class FinancialValidationError(ValueError):
    pass


def validate_dcf_input(fcf, growth, wacc):
    if growth >= wacc:
        raise FinancialValidationError("Terminal growth rate must be less than WACC.")
    if any(f <= 0 for f in fcf):
        raise FinancialValidationError("FCFs must be positive for DCF.")
    if wacc <= 0 or wacc > 0.25:
        raise FinancialValidationError("WACC out of realistic bounds (0-25%).")
    if growth < 0 or growth > 0.05:
        raise FinancialValidationError("Terminal growth unrealistic (0-5%).")


def validate_cpi_series(levels: list[float], lookback: int) -> None:
    if len(levels) < lookback + 1:
        raise FinancialValidationError(
            f"CPI series needs at least {lookback + 1} observations."
        )
    if any(x <= 0 for x in levels):
        raise FinancialValidationError("CPI levels must be positive.")


def validate_merton_input(equity: float, debt: float, vol: float) -> None:
    if equity <= 0 or debt <= 0:
        raise FinancialValidationError("Equity and debt must be positive.")
    if vol <= 0 or vol > 3.0:
        raise FinancialValidationError("Asset volatility must be in (0, 3].")


def validate_price_series(prices: list[float], min_length: int = 2) -> None:
    if len(prices) < min_length:
        raise FinancialValidationError(
            f"Price series needs at least {min_length} observations."
        )
    if any(p <= 0 for p in prices):
        raise FinancialValidationError("Prices must be positive.")
