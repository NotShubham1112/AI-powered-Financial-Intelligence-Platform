from core.models.health import ProviderHealthScore


class ProviderScoreEngine:
    def rank(self, scores: list[ProviderHealthScore]) -> list[ProviderHealthScore]:
        return sorted(scores, key=lambda s: s.score, reverse=True)
