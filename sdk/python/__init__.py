"""Top-level package for the Financial Agent Python SDK."""

from .financialagent import FinancialAgent
from .models import (
    FinancialAgent as FinancialAgentAlias,  # For backwards compatibility
    SkillRunResponse,
    StreamEvent,
)

__all__ = [
    "FinancialAgent",
    "SkillRunResponse",
    "StreamEvent",
]

__version__ = "0.1.0"