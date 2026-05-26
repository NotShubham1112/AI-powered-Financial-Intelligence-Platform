from pydantic import BaseModel, Field


class MertonDefaultToolInput(BaseModel):
    equity_market_value: float
    debt_face_value: float
    asset_volatility: float
    risk_free_rate: float
    time_horizon_years: float = 1.0


class CreditSpreadToolInput(BaseModel):
    bond_yield: float
    risk_free_yield: float
    recovery_rate: float = 0.4
    years_to_maturity: float = 5.0
