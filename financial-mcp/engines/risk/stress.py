import numpy as np
from pydantic import BaseModel, Field
from typing import List

class VaRInput(BaseModel):
    returns: List[float]  # historical returns
    confidence_level: float = 0.95
    method: str = "historical"  # historical, parametric, monte_carlo

class VaROutput(BaseModel):
    var: float
    expected_shortfall: float
    confidence_level: float
    method: str

def value_at_risk(input: VaRInput) -> VaROutput:
    rets = np.array(input.returns)
    if input.method == "historical":
        var = np.percentile(rets, 100 * (1 - input.confidence_level))
        es = rets[rets <= var].mean()
    elif input.method == "parametric":
        mu, sigma = rets.mean(), rets.std()
        z = norm.ppf(1 - input.confidence_level)
        var = mu + z * sigma
        es = mu - sigma * norm.pdf(z) / (1 - input.confidence_level)
    else:
        raise NotImplementedError("MC not in this engine")
    return VaROutput(
        var=round(var, 6),
        expected_shortfall=round(es, 6),
        confidence_level=input.confidence_level,
        method=input.method
    )