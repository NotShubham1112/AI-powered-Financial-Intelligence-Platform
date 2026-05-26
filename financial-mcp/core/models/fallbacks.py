from core.models.config import FALLBACK_MODELS, FAST_INTERACTIVE_MODELS


def build_fallback_chain(primary: str) -> list[str]:
    chain = [primary, *FAST_INTERACTIVE_MODELS, *FALLBACK_MODELS]
    seen: set[str] = set()
    out: list[str] = []
    for m in chain:
        if m not in seen:
            seen.add(m)
            out.append(m)
    return out
