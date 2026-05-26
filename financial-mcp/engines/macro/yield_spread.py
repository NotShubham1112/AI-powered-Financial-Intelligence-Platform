from pydantic import BaseModel, Field


class YieldSpreadInput(BaseModel):
    ten_year_yield: float = Field(..., ge=0.0, le=20.0)
    two_year_yield: float = Field(..., ge=0.0, le=20.0)


class YieldSpreadOutput(BaseModel):
    spread_bps: float
    curve_state: str
    recession_signal: bool
    metadata: dict = {"indicator": "10y2y", "source": "Fed research / NBER literature"}


def yield_curve_signal(inp: YieldSpreadInput) -> YieldSpreadOutput:
    spread = inp.ten_year_yield - inp.two_year_yield
    spread_bps = round(spread * 100, 2)

    if spread < -0.25:
        state = "deeply_inverted"
        recession = True
    elif spread < 0:
        state = "inverted"
        recession = True
    elif spread < 0.5:
        state = "flat"
        recession = False
    else:
        state = "normal"
        recession = False

    return YieldSpreadOutput(
        spread_bps=spread_bps,
        curve_state=state,
        recession_signal=recession,
    )
