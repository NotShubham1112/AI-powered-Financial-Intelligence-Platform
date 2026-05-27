"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { ChartData } from "@/stores/chat-store"
import { Download, Save } from "lucide-react"
import { TerminalButton } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"

export function InlineChart({ chart }: { chart: ChartData }) {
  const config: Record<string, { label: string; color?: string }> = {}

  chart.yKeys.forEach((key, i) => {
    const existing = chart.config[key]
    config[key] = {
      label: existing?.label ?? key,
      color: existing?.color ?? getColor(i),
    }
  })

  const renderChart = () => {
    switch (chart.type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis
                dataKey={chart.xKey}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              {chart.yKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config[key]?.color ?? "var(--foreground)"}
                  strokeWidth={1.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {chart.yKeys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config[key]?.color ?? "var(--foreground)"}
                  fill={config[key]?.color ?? "var(--foreground)"}
                  fillOpacity={0.12}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chart.data}
                dataKey={chart.yKeys[0]}
                nameKey={chart.xKey}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                stroke="var(--background)"
                strokeWidth={1}
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <ChartTooltip cursor={{ fill: "var(--accent)" }} content={<ChartTooltipContent />} />
              <Legend />
              {chart.yKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={config[key]?.color ?? "var(--foreground)"}
                  radius={0}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="my-8 rounded-lg border border-border/40 bg-background shadow-sm">
      <div className="flex items-start justify-between border-b border-border/30 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{chart.title}</div>
          {chart.description && (
            <p className="mt-1 text-xs text-muted-foreground/70">{chart.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <TerminalButton size="sm" variant="ghost" className="h-7 w-7 p-0" title="Export">
            <Download className="h-3.5 w-3.5" />
          </TerminalButton>
          <TerminalButton size="sm" variant="ghost" className="h-7 w-7 p-0" title="Save artifact">
            <Save className="h-3.5 w-3.5" />
          </TerminalButton>
        </div>
      </div>
      <div className="border-b border-border/30 px-4 py-2">
        <MetadataLabel>chart_output</MetadataLabel>
      </div>
      <div className="h-[280px] w-full p-4">
        <ChartContainer config={config} className="h-full w-full">
          {renderChart()}
        </ChartContainer>
      </div>
    </div>
  )
}

/** Monochrome grayscale chart palette */
function getColor(index: number): string {
  const opacities = ["1", "0.75", "0.55", "0.4", "0.28"]
  return `rgba(255, 255, 255, ${opacities[index % opacities.length]})`
}
