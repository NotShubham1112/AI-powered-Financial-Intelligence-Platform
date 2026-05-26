from core.skills.base import Skill, SkillContext


class MacroRegimeSkill(Skill):
    name = "macro_regime_detection"
    description = "Parallel macro tools: yield curve, Taylor rule, inflation momentum"

    def build_tool_plan(self, ctx: SkillContext):
        inputs = ctx.inputs
        tools = ["yield_curve_signal", "taylor_rule", "inflation_momentum_tool"]
        plan = {
            "yield_curve_signal": inputs.get(
                "yield_curve_signal",
                {"ten_year_yield": 4.2, "two_year_yield": 4.5},
            ),
            "taylor_rule": inputs.get(
                "taylor_rule",
                {"inflation_rate": 3.2, "output_gap": 0.5},
            ),
            "inflation_momentum_tool": inputs.get(
                "inflation_momentum_tool",
                {"cpi_levels": [100 + i * 0.25 for i in range(14)], "lookback_months": 12},
            ),
        }
        return tools, plan, True
