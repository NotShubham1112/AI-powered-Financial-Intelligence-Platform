import { MetricCard } from "./metric-card"

export interface Metric {
  label: string
  value: string
  subtext?: string
}

export function FinancialMetrics({
  metrics,
}: {
  metrics: Metric[]
}) {
  if (!metrics || metrics.length === 0) {
    return null
  }

  return (
    <div className="border border-zinc-800 rounded-lg bg-black p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Key Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <MetricCard
            key={idx}
            label={metric.label}
            value={metric.value}
            subtext={metric.subtext}
          />
        ))}
      </div>
    </div>
  )
}
