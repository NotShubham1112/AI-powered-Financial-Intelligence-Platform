"""Model routing policy - interactive vs background."""
from core.models.config import (
    DEFAULT_INTERACTIVE,
    FAST_INTERACTIVE_MODELS,
    HEAVY_PATTERNS,
)


def is_heavy_model(model_id: str) -> bool:
    lower = model_id.lower()
    return any(p in lower for p in HEAVY_PATTERNS)


def route_interactive(requested: str) -> str:
    if is_heavy_model(requested):
        return DEFAULT_INTERACTIVE
    if requested in FAST_INTERACTIVE_MODELS:
        return requested
    return DEFAULT_INTERACTIVE
