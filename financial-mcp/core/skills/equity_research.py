from core.skills.base import Skill, SkillContext


class EquityResearchSkill(Skill):
    name = "equity_research"
    description = "Macro + technicals + credit cross-check for equity research"

    def build_tool_plan(self, ctx: SkillContext):
        prices = ctx.inputs.get("prices", [100 + i * 0.4 for i in range(40)])
        tools = [
            "yield_curve_signal",
            "rsi_indicator",
            "credit_spread_analysis_tool",
        ]
        plan = {
            "yield_curve_signal": ctx.inputs.get(
                "yield_curve_signal",
                {"ten_year_yield": 4.0, "two_year_yield": 4.3},
            ),
            "rsi_indicator": {"prices": prices, "period": 14},
            "credit_spread_analysis_tool": ctx.inputs.get(
                "credit_spread_analysis_tool",
                {"bond_yield": 0.055, "risk_free_yield": 0.04},
            ),
        }
        return tools, plan, True
