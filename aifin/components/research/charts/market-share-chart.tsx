"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface PieChartDataPoint {
  name: string
  value: number
}

export function MarketShareChart({ data }: { data: PieChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return <div className="h-[320px] w-full flex items-center justify-center text-zinc-500">No data available</div>
  }

  const colors = ["#ffffff", "#d4d4d8", "#a1a1aa", "#71717a", "#52525b"]

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "0.375rem",
            }}
            labelStyle={{ color: "#e4e4e7" }}
            formatter={(value: any) => {
              if (typeof value === "number") {
                return `${value}%`
              }
              return value
            }}
          />
          <Legend wrapperStyle={{ color: "#a1a1aa" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
