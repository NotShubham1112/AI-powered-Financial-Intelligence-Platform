import numpy as np
from pydantic import BaseModel, Field
from typing import List, Optional


class DCFValuationInput(BaseModel):
    free_cash_flows: List[float]
    terminal_growth_rate: float = Field(..., ge=0.0, le=0.05)
    wacc: float = Field(..., gt=0.0, le=0.25)
    terminal_value_method: str = "perpetuity"
    exit_multiple: Optional[float] = None
    net_debt: float = 0.0
    shares_outstanding: float = 1.0


class SensitivityItem(BaseModel):
    wacc: float
    growth: float
    equity_value_per_share: float


class DCFValuationOutput(BaseModel):
    enterprise_value: float
    equity_value: float
    implied_share_price: float
    terminal_value: float
    discount_rate: float
    terminal_growth_rate: float
    sensitivity_matrix: List[SensitivityItem]
    metadata: dict = Field(
        default_factory=lambda: {"currency": "USD", "methodology": "two_stage_dcf"}
    )


def dcf_valuation(input: DCFValuationInput) -> DCFValuationOutput:
    wacc = input.wacc
    fcf_array = np.array(input.free_cash_flows)
    n = len(fcf_array)

    discount_factors = (1 + wacc) ** np.arange(1, n + 1)
    pv_fcfs = np.sum(fcf_array / discount_factors)

    if input.terminal_value_method == "perpetuity":
        terminal_fcf = fcf_array[-1] * (1 + input.terminal_growth_rate)
        terminal_value = terminal_fcf / (wacc - input.terminal_growth_rate)
    elif input.terminal_value_method == "exit_multiple":
        if input.exit_multiple is None:
            raise ValueError("exit_multiple required")
        terminal_value = fcf_array[-1] * input.exit_multiple
    else:
        raise ValueError("Invalid terminal value method")

    pv_terminal = terminal_value / (1 + wacc) ** n
    enterprise_value = pv_fcfs + pv_terminal
    equity_value = enterprise_value - input.net_debt
    price_per_share = equity_value / input.shares_outstanding

    sensitivities = []
    for dw in [-0.01, 0.0, 0.01]:
        for dg in [-0.005, 0.0, 0.005]:
            wacc_s = wacc + dw
            growth_s = input.terminal_growth_rate + dg
            if growth_s >= wacc_s:
                continue
            terminal_fcf_s = fcf_array[-1] * (1 + growth_s)
            tv_s = terminal_fcf_s / (wacc_s - growth_s)
            pv_tv_s = tv_s / (1 + wacc_s) ** n
            ev_s = pv_fcfs + pv_tv_s
            eq_s = ev_s - input.net_debt
            sensitivities.append(
                SensitivityItem(
                    wacc=round(wacc_s, 4),
                    growth=round(growth_s, 4),
                    equity_value_per_share=round(eq_s / input.shares_outstanding, 2),
                )
            )

    return DCFValuationOutput(
        enterprise_value=round(enterprise_value, 2),
        equity_value=round(equity_value, 2),
        implied_share_price=round(price_per_share, 2),
        terminal_value=round(terminal_value, 2),
        discount_rate=wacc,
        terminal_growth_rate=input.terminal_growth_rate,
        sensitivity_matrix=sensitivities,
    )
