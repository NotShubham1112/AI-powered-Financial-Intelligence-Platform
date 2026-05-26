"""Free-tier model tiers (routing policy; LLM calls live in aifin runtime)."""

FAST_INTERACTIVE_MODELS = [
    "google/gemini-flash:free",
    "qwen/qwen3.5-plus:free",
    "openrouter/free",
]

DEEP_REASONING_MODELS = [
    "qwen/qwen3.5-plus:free",
    "mistralai/devstral-2:free",
    "openrouter/free",
]

CODING_MODELS = [
    "mistralai/devstral-2:free",
    "qwen/qwen3.5-plus:free",
]

FALLBACK_MODELS = [
    "openrouter/free",
    "google/gemini-flash:free",
]

HEAVY_PATTERNS = ("nemotron", "120b", "70b", "72b", "405b")

DEFAULT_INTERACTIVE = FAST_INTERACTIVE_MODELS[0]
