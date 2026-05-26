import numpy as np
from pydantic import BaseModel, Field
from typing import List
from datetime import date
from engines.fixed_income.yield_curve import discount_factor_curve

class BondInput(BaseModel):
    face_value: float = 1000.0
    coupon_rate: float = Field(..., ge=0.0)
    coupon_frequency: int = 2  # semi-annual
    maturity_date: date
    settlement_date: date
    yield_to_maturity: float = Field(..., ge=0.0)

class BondOutput(BaseModel):
    price: float
    macaulay_duration: float
    modified_duration: float
    convexity: float
    accrued_interest: float
    ytm: float

def bond_price_duration(input: BondInput) -> BondOutput:
    d1 = input.settlement_date
    d2 = input.maturity_date
    freq = input.coupon_frequency
    y = input.yield_to_maturity
    coupon = input.face_value * input.coupon_rate / freq
    
    # Compute exact number of coupon periods from settlement to maturity
    # Uses Actual/365.25 day count
    T = (d2 - d1).days / 365.25
    remaining_periods = max(1, int(round(T * freq)))
    periods = remaining_periods
    
    # cash flow times (years from settlement)
    t = np.arange(1, periods + 1) / freq
    cf = np.full(periods, coupon)
    cf[-1] += input.face_value
    
    disc = (1 + y / freq) ** (-t * freq)
    pv = cf * disc
    price = np.sum(pv)
    
    # Duration & Convexity
    mac_dur = np.sum(t * pv) / price
    mod_dur = mac_dur / (1 + y / freq)
    convex = np.sum(pv * t * (t + 1 / freq)) / (price * (1 + y / freq) ** 2)
    
    # Accrued interest (simplified - assumes settlement on coupon date)
    accrued = 0.0
    return BondOutput(
        price=round(price, 4),
        macaulay_duration=round(mac_dur, 4),
        modified_duration=round(mod_dur, 4),
        convexity=round(convex, 6),
        accrued_interest=round(accrued, 4),
        ytm=input.yield_to_maturity
    )