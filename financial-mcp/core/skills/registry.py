from typing import Dict, Optional

from core.skills.base import Skill
from core.skills.equity_research import EquityResearchSkill
from core.skills.macro_regime import MacroRegimeSkill

SKILL_REGISTRY: Dict[str, Skill] = {
    "macro_regime_detection": MacroRegimeSkill(),
    "equity_research": EquityResearchSkill(),
}


def get_skill(name: str) -> Optional[Skill]:
    return SKILL_REGISTRY.get(name)
