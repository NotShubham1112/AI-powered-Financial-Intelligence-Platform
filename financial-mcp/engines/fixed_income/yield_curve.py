import numpy as np
from typing import List


def discount_factor_curve(
    tenors_years: List[float],
    zero_rates: List[float],
) -> np.ndarray:
    """Continuous-compounding discount factors D(t) = exp(-r*t)."""
    tenors = np.array(tenors_years, dtype=float)
    rates = np.array(zero_rates, dtype=float)
    return np.exp(-rates * tenors)
