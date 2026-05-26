"use client"

import { RevenueChart } from "./charts/revenue-chart"
import { MarketShareChart } from "./charts/market-share-chart"
import { MarginChart } from "./charts/margin-chart"

interface ChartDataPoint {
  [key: string]: string | number
}

interface PieChartDataPoint {
  name: string
  value: number
}

interface ChartConfig {
  type: "revenue" | "margin" | "market-share" | "line" | "bar" | "pie"
  title: string
  data: ChartDataPoint[] | PieChartDataPoint[]
}

export function ChartRenderer({ chart }: { chart: ChartConfig }) {
  return (
    <div className="border border-zinc-800 rounded-lg bg-black p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">{chart.title}</h3>
      <div className="w-full">
        {chart.type === "revenue" && (
          <RevenueChart data={chart.data as ChartDataPoint[]} />
        )}
        {chart.type === "margin" && (
          <MarginChart data={chart.data as ChartDataPoint[]} />
        )}
        {chart.type === "market-share" && (
          <MarketShareChart data={chart.data as PieChartDataPoint[]} />
        )}
        {chart.type === "line" && (
          <RevenueChart data={chart.data as ChartDataPoint[]} />
        )}
        {chart.type === "bar" && (
          <MarginChart data={chart.data as ChartDataPoint[]} />
        )}
        {chart.type === "pie" && (
          <MarketShareChart data={chart.data as PieChartDataPoint[]} />
        )}
      </div>
    </div>
  )
}
