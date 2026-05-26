from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal

class OHLCV(BaseModel):
    ticker: str
    date: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int
    adjusted_close: Optional[Decimal] = None
    currency: str = "USD"

class BalanceSheet(BaseModel):
    ticker: str
    fiscal_date: date
    total_assets: Decimal
    total_liabilities: Decimal
    shareholders_equity: Decimal
    # ... all standard line items

class IncomeStatement(BaseModel):
    ticker: str
    fiscal_date: date
    revenue: Decimal
    cost_of_revenue: Decimal
    gross_profit: Decimal
    operating_income: Decimal
    net_income: Decimal
    eps: Decimal
    # ...

class YieldCurvePoint(BaseModel):
    maturity: float  # years
    rate: Decimal