import numpy as np
from scipy.stats import norm
from pydantic import BaseModel, Field

class BlackScholesInput(BaseModel):
    spot: float = Field(..., gt=0)
    strike: float = Field(..., gt=0)
    time_to_expiry: float = Field(..., gt=0)  # years
    risk_free_rate: float = Field(..., ge=0.0)
    volatility: float = Field(..., gt=0.0, le=5.0)
    option_type: str = Field("call", pattern="^(call|put)$")

class GreeksOutput(BaseModel):
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float

class BlackScholesOutput(BaseModel):
    theoretical_price: float
    greeks: GreeksOutput
    input_parameters: dict

def black_scholes(input: BlackScholesInput) -> BlackScholesOutput:
    S, K, T, r, sigma = input.spot, input.strike, input.time_to_expiry, input.risk_free_rate, input.volatility
    d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    if input.option_type == "call":
        price = S * norm.cdf(d1) - K * np.exp(-r*T) * norm.cdf(d2)
        delta = norm.cdf(d1)
        theta = - (S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T)) - r * K * np.exp(-r*T) * norm.cdf(d2)
    else:  # put
        price = K * np.exp(-r*T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        delta = -norm.cdf(-d1)
        theta = - (S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T)) + r * K * np.exp(-r*T) * norm.cdf(-d2)
    
    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
    vega = S * norm.pdf(d1) * np.sqrt(T)  # per 1% change, usually scaled by 0.01
    rho = K * T * np.exp(-r*T) * norm.cdf(d2) if input.option_type == "call" else -K * T * np.exp(-r*T) * norm.cdf(-d2)
    
    return BlackScholesOutput(
        theoretical_price=round(price, 6),
        greeks=GreeksOutput(
            delta=round(delta, 6),
            gamma=round(gamma, 6),
            theta=round(theta, 6),
            vega=round(vega/100, 6),  # scaled for 1% vol change
            rho=round(rho/100, 6)
        ),
        input_parameters=input.model_dump()
    )