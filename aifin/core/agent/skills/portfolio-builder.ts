import type { SkillResult } from "../types"

interface AssetClass {
  expectedReturn: number
  volatility: number
  beta: number
}

const ASSET_CLASSES: Record<string, AssetClass> = {
  equities:      { expectedReturn: 0.100, volatility: 0.18, beta: 1.00 },
  bonds:         { expectedReturn: 0.045, volatility: 0.06, beta: 0.15 },
  crypto:        { expectedReturn: 0.180, volatility: 0.55, beta: 1.80 },
  commodities:   { expectedReturn: 0.060, volatility: 0.15, beta: 0.30 },
  real_estate:   { expectedReturn: 0.080, volatility: 0.12, beta: 0.50 },
  cash:          { expectedReturn: 0.025, volatility: 0.01, beta: 0.00 },
}

const RISK_TOLERANCE_ALLOCATIONS: Record<string, Record<string, number>> = {
  low:  { equities: 20, bonds: 50, commodities: 5, real_estate: 10, cash: 15 },
  med:  { equities: 45, bonds: 25, commodities: 10, real_estate: 15, cash: 5 },
  high: { equities: 65, bonds: 10, commodities: 10, real_estate: 10, cash: 5 },
}

export function portfolioBuilder(params: Record<string, unknown>): SkillResult {
  const goals = (params.goals as string) ?? "growth"
  const constraints = (params.constraints as Record<string, unknown>) ?? {}
  const riskTolerance = (params.riskTolerance as string) ?? "med"
  const correlation = (params.correlation as number) ?? 0.4

  if (!["low", "med", "high"].includes(riskTolerance)) {
    return { success: false, data: {}, error: "riskTolerance must be low, med, or high" }
  }

  const baseAllocation = { ...RISK_TOLERANCE_ALLOCATIONS[riskTolerance] }

  // Apply all integer constraints from the constraints object
  for (const [key, val] of Object.entries(constraints)) {
    const assetKey = key.replace(/^(max|min)/, "").toLowerCase()
    if (assetKey in baseAllocation && typeof val === "number") {
      if (key.startsWith("max")) {
        baseAllocation[assetKey] = Math.min(baseAllocation[assetKey] ?? 0, val)
      } else if (key.startsWith("min")) {
        baseAllocation[assetKey] = Math.max(baseAllocation[assetKey] ?? 0, val)
      }
    }
  }

  // Normalize to ensure weights sum to 100%
  const totalWeight = Object.values(baseAllocation).reduce((a, b) => a + b, 0)
  if (totalWeight === 0) {
    return { success: false, data: {}, error: "allocation sums to zero after constraints" }
  }

  const normalized: Record<string, number> = {}
  for (const [key, val] of Object.entries(baseAllocation)) {
    normalized[key] = Number(((val / totalWeight) * 100).toFixed(2))
  }

  // Portfolio expected return (weighted average)
  const expectedReturn = Object.entries(normalized).reduce(
    (sum, [key, weight]) => sum + (weight / 100) * (ASSET_CLASSES[key]?.expectedReturn ?? 0.05),
    0
  )

  // Portfolio variance with correlation matrix: σ² = ΣᵢΣⱼ wᵢwⱼσᵢσⱼρᵢⱼ
  const entries = Object.entries(normalized).filter(([, w]) => w > 0)
  let portfolioVariance = 0
  for (let i = 0; i < entries.length; i++) {
    const [keyI, wI] = entries[i]
    const volI = ASSET_CLASSES[keyI]?.volatility ?? 0.1
    portfolioVariance += (wI / 100) * (wI / 100) * volI * volI
    for (let j = i + 1; j < entries.length; j++) {
      const [keyJ, wJ] = entries[j]
      const volJ = ASSET_CLASSES[keyJ]?.volatility ?? 0.1
      portfolioVariance += 2 * (wI / 100) * (wJ / 100) * volI * volJ * correlation
    }
  }

  const portfolioVol = Math.sqrt(portfolioVariance)

  // Diversification ratio: weighted avg volatility / portfolio volatility
  const weightedAvgVol = entries.reduce(
    (sum, [key, w]) => sum + (w / 100) * (ASSET_CLASSES[key]?.volatility ?? 0.1),
    0
  )
  const diversificationRatio = portfolioVol > 0 ? weightedAvgVol / portfolioVol : 1

  return {
    success: true,
    data: {
      allocation: normalized,
      expected_return_pct: Number((expectedReturn * 100).toFixed(2)),
      portfolio_volatility_pct: Number((portfolioVol * 100).toFixed(2)),
      sharpe_ratio: Number(((expectedReturn - 0.045) / (portfolioVol || 0.01)).toFixed(4)),
      diversification_ratio: Number(diversificationRatio.toFixed(4)),
      risk_tolerance: riskTolerance,
      goals,
      asset_details: Object.entries(normalized).map(([name, weight]) => ({
        name,
        weight_pct: weight,
        expected_return_pct: Number(
          ((ASSET_CLASSES[name]?.expectedReturn ?? 0.05) * 100).toFixed(2)
        ),
        beta: ASSET_CLASSES[name]?.beta ?? 1,
      })),
    },
  }
}
