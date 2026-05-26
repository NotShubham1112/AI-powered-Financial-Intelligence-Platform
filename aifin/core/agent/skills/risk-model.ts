import type { SkillResult } from "../types"

export function riskModel(params: Record<string, unknown>): SkillResult {
  const assets = params.assets as string[] | undefined
  const weights = params.weights as number[] | undefined
  const volatility = params.volatility as number | undefined
  const correlation = (params.correlation as number) ?? 0.3

  if (!assets || !weights || assets.length === 0 || weights.length === 0) {
    return { success: false, data: {}, error: "assets and weights required" }
  }

  const weightSum = weights.reduce((a, b) => a + b, 0)
  if (weightSum === 0) {
    return { success: false, data: {}, error: "weights sum to zero" }
  }

  const normalizedWeights = weights.map((w) => w / weightSum)
  const n = normalizedWeights.length

  const avgVol = volatility ?? 0.25

  // Two-asset portfolio variance: w1^2*σ1^2 + w2^2*σ2^2 + 2*w1*w2*ρ*σ1*σ2
  // For n assets with uniform correlation: sum(w_i^2 * σ_i^2) + 2 * sum_over_pairs(w_i*w_j*ρ*σ_i*σ_j)
  let portfolioVariance = 0
  for (let i = 0; i < n; i++) {
    portfolioVariance += normalizedWeights[i] * normalizedWeights[i] * avgVol * avgVol
    for (let j = i + 1; j < n; j++) {
      portfolioVariance += 2 * normalizedWeights[i] * normalizedWeights[j] * correlation * avgVol * avgVol
    }
  }

  const portfolioStd = Math.sqrt(portfolioVariance)

  // Risk score: ratio of portfolio volatility to a 100% equity benchmark (σ=0.18)
  const EQUITY_BENCHMARK_VOL = 0.18
  const riskScore = Math.min(1, Math.max(0, portfolioStd / EQUITY_BENCHMARK_VOL * 0.4))

  let category: string
  if (riskScore < 0.25) category = "low"
  else if (riskScore < 0.45) category = "moderate"
  else if (riskScore < 0.65) category = "high"
  else category = "very_high"

  // CAPM-implied expected return using market risk premium of 5.5% and risk-free rate of 4.5%
  const RISK_FREE_RATE = 0.045
  const MARKET_RISK_PREMIUM = 0.055
  // Beta approximated by portfolio volatility relative to market (σ_market ≈ 0.15)
  const MARKET_VOL = 0.15
  const portfolioBeta = (portfolioStd * correlation) / MARKET_VOL
  const capmReturn = RISK_FREE_RATE + portfolioBeta * MARKET_RISK_PREMIUM
  const annualizedReturn = Math.max(RISK_FREE_RATE, capmReturn)

  const sharpeRatio = (annualizedReturn - RISK_FREE_RATE) / (portfolioStd || 0.01)

  return {
    success: true,
    data: {
      risk_score: Number(riskScore.toFixed(4)),
      category,
      portfolio_volatility: Number(portfolioStd.toFixed(4)),
      sharpe_ratio: Number(sharpeRatio.toFixed(4)),
      expected_return_pct: Number((annualizedReturn * 100).toFixed(2)),
      beta: Number(portfolioBeta.toFixed(4)),
      capm_return_pct: Number((capmReturn * 100).toFixed(2)),
      risk_free_rate_pct: RISK_FREE_RATE * 100,
      market_risk_premium_pct: MARKET_RISK_PREMIUM * 100,
      assets: assets.map((a, i) => {
        const marginalRisk = normalizedWeights[i] * avgVol * (
          normalizedWeights[i] * avgVol + correlation * avgVol * normalizedWeights.reduce((s, w, j) => j !== i ? s + w : s, 0)
        )
        const contribution = portfolioVariance > 0 ? (marginalRisk / portfolioVariance) * 100 : 0
        return {
          name: a,
          weight_pct: Number((normalizedWeights[i] * 100).toFixed(2)),
          contribution_to_risk_pct: Number(contribution.toFixed(2)),
        }
      }),
    },
  }
}
