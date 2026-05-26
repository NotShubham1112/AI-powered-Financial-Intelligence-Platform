"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

interface ChartDataPoint {
  [key: string]: string | number
}

export function MarginChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return <div className="h-[320px] w-full flex items-center justify-center text-zinc-500">No data available</div>
  }

  const dataKey = Object.keys(data[0]).find(k => k !== "year" && k !== "label") || "margin"

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="year" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "0.375rem",
            }}
            labelStyle={{ color: "#e4e4e7" }}
          />
          <Bar dataKey={dataKey} fill="#ffffff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
