import type { SkillResult } from "../types"

export function trendAnalyzer(params: Record<string, unknown>): SkillResult {
  const dataPoints = params.dataPoints as number[] | undefined
  const window = (params.window as number) ?? 5

  if (!dataPoints || dataPoints.length < 2) {
    return { success: false, data: {}, error: "dataPoints must have at least 2 values" }
  }

  const n = dataPoints.length

  // Simple moving average
  const sma = (values: number[], period: number): number[] => {
    const result: number[] = []
    for (let i = period - 1; i < values.length; i++) {
      const slice = values.slice(i - period + 1, i + 1)
      result.push(slice.reduce((a, b) => a + b, 0) / period)
    }
    return result
  }

  const shortPeriod = Math.min(window, n)
  const longPeriod = Math.min(window * 2, n)
  const shortSma = sma(dataPoints, shortPeriod)
  const longSma = sma(dataPoints, longPeriod)

  const currentPrice = dataPoints[n - 1]
  const startPrice = dataPoints[0]
  const periodReturn = startPrice !== 0 ? (currentPrice - startPrice) / startPrice : 0

  // Log returns for volatility calculation
  const logReturns: number[] = []
  for (let i = 1; i < n; i++) {
    if (dataPoints[i - 1] > 0) {
      logReturns.push(Math.log(dataPoints[i] / dataPoints[i - 1]))
    }
  }

  if (logReturns.length < 2) {
    return { success: false, data: {}, error: "insufficient valid price data for trend analysis" }
  }

  const avgLogReturn = logReturns.reduce((a, b) => a + b, 0) / logReturns.length
  const logVariance = logReturns.reduce((sum, r) => sum + (r - avgLogReturn) ** 2, 0) / (logReturns.length - 1)
  const dailyVol = Math.sqrt(logVariance)

  const lastShort = shortSma[shortSma.length - 1]
  const lastLong = longSma[longSma.length - 1]

  let direction: string
  let strength: number

  if (shortSma.length > 1 && longSma.length > 1) {
    const trend = lastShort - lastLong
    if (trend > 0) {
      direction = "upward"
      strength = Math.min(1, Math.abs(trend) / (lastLong || 0.01))
    } else {
      direction = "downward"
      strength = Math.min(1, Math.abs(trend) / (lastLong || 0.01))
    }
  } else {
    direction = periodReturn >= 0 ? "upward" : "downward"
    strength = Math.abs(periodReturn)
  }

  // RSI using Wilder's smoothed average (standard approach)
  const rsiPeriod = Math.min(14, logReturns.length)
  const prices = dataPoints.slice(-rsiPeriod - 1)
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) avgGain += change
    else avgLoss -= change
  }
  avgGain /= rsiPeriod
  avgLoss /= rsiPeriod

  // For subsequent values, use Wilder's smoothing: new_avg = (prev_avg * (period-1) + current_change) / period
  // We only have one period of data, so simple average is used
  const rsi = avgLoss > 0
    ? 100 - 100 / (1 + avgGain / avgLoss)
    : avgGain > 0 ? 100 : 50

  // Momentum: average log return over the period, annualized
  const momentum = avgLogReturn * 252

  return {
    success: true,
    data: {
      direction,
      strength: Number(strength.toFixed(4)),
      current_price: currentPrice,
      period_return_pct: Number((periodReturn * 100).toFixed(2)),
      volatility_pct: Number((dailyVol * Math.sqrt(252) * 100).toFixed(2)),
      rsi: Number(rsi.toFixed(2)),
      rsi_signal: rsi > 70 ? "overbought" : rsi < 30 ? "oversold" : "neutral",
      sma_short: Number(lastShort.toFixed(2)),
      sma_long: Number((lastLong ?? lastShort).toFixed(2)),
      momentum_annualized: Number(momentum.toFixed(4)),
      data_points_analyzed: n,
    },
  }
}
