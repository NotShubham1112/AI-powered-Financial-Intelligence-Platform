"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface ChartDataPoint {
  [key: string]: string | number
}

interface PieChartDataPoint {
  name: string
  value: number
}

interface ChartConfigItem {
  type: string
  title: string
  description?: string
  data: ChartDataPoint[] | PieChartDataPoint[]
  config?: Record<string, { label: string; color?: string }>
  xKey?: string
  yKeys?: string[]
}

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const CHART_TYPES = [
  "revenue", "margin", "market-share", "line", "bar",
  "pie", "donut", "horizontal-bar", "radial", "area",
  "multiple-bar", "mixed-bar",
] as const

function inferConfig(data: ChartDataPoint[]): { config: ChartConfig; xKey: string; yKeys: string[] } {
  if (!data || data.length === 0) return { config: {}, xKey: "name", yKeys: [] }
  const keys = Object.keys(data[0])
  const xKey = keys.find(k => k === "name" || k === "year" || k === "label" || k === "month" || k === "date") || keys[0]
  const yKeys = keys.filter(k => k !== xKey && typeof data[0][k] === "number")
  const config: ChartConfig = {}
  yKeys.forEach((key, i) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: `var(--chart-${(i % 5) + 1})`,
    }
  })
  return { config, xKey, yKeys }
}

function chartTitle(type: string): string {
  const labels: Record<string, string> = {
    revenue: "Revenue", margin: "Margin", "market-share": "Market Share",
    line: "Line Chart", bar: "Bar Chart", pie: "Pie Chart",
    donut: "Donut Chart", "horizontal-bar": "Horizontal Bar",
    radial: "Radial Chart", area: "Area Chart",
    "multiple-bar": "Multiple Bar", "mixed-bar": "Mixed Bar",
  }
  return labels[type] || "Chart"
}

function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="mb-6 border-zinc-800">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

function NoData() {
  return <div className="flex h-[250px] items-center justify-center text-sm text-zinc-500">No data available</div>
}

function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const { config, xKey, yKeys } = inferConfig(data)
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {yKeys.map((key) => (
          <Line key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

function MarginChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const { config, xKey, yKeys } = inferConfig(data)
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {yKeys.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

function MarketShareChart({ data }: { data: PieChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const config: ChartConfig = {}
  data.forEach((d, i) => {
    config[d.name] = { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }
  })
  return (
    <ChartContainer config={config} className="aspect-auto mx-auto max-h-[250px]">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  )
}

function GenericLineChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const { config, xKey, yKeys } = inferConfig(data)
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {yKeys.map((key) => (
          <Line key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

function VerticalBarChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const { config, xKey, yKeys } = inferConfig(data)
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        {yKeys.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

function HorizontalBarChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const { config, xKey, yKeys } = inferConfig(data)
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: -20, right: 30 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <YAxis dataKey={xKey} type="category" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickMargin={10} />
        <XAxis type="number" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        {yKeys.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={5} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

function PieChartComponent({ data }: { data: PieChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const config: ChartConfig = {}
  data.forEach((d, i) => {
    config[d.name] = { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }
  })
  return (
    <ChartContainer config={config} className="aspect-auto mx-auto max-h-[250px]">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  )
}

function DonutChart({ data }: { data: PieChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const config: ChartConfig = {}
  data.forEach((d, i) => {
    config[d.name] = { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }
  })
  return (
    <ChartContainer config={config} className="aspect-auto mx-auto max-h-[250px]">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  )
}

function RadialChartComponent({ data }: { data: PieChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const config: ChartConfig = {}
  data.forEach((d, i) => {
    config[d.name] = { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }
  })
  return (
    <ChartContainer config={config} className="aspect-auto mx-auto max-h-[250px]">
      <RadialBarChart data={data} innerRadius={30} outerRadius={110}>
        <RadialBar dataKey="value" background>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </RadialBar>
        <ChartTooltip content={<ChartTooltipContent />} />
      </RadialBarChart>
    </ChartContainer>
  )
}

function AreaChartComponent({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const { config, xKey, yKeys } = inferConfig(data)
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {yKeys.map((key) => (
          <Area key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`} fill={`var(--color-${key})`} fillOpacity={0.15} strokeWidth={2} />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}

function MixedBarChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) return <NoData />
  const { config, xKey, yKeys } = inferConfig(data)
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
        <YAxis dataKey={xKey} type="category" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickMargin={10} />
        <XAxis type="number" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} hide />
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <ChartTooltip content={<ChartTooltipContent />} />
        {yKeys.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={5} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

export function ChartRenderer({ chart }: { chart: ChartConfigItem }) {
  const isKnown = CHART_TYPES.includes(chart.type as typeof CHART_TYPES[number])

  return (
    <ChartCard title={chart.title || chartTitle(chart.type)} description={chart.description}>
      {!isKnown && <NoData />}
      {chart.type === "revenue" && <RevenueChart data={chart.data as ChartDataPoint[]} />}
      {chart.type === "margin" && <MarginChart data={chart.data as ChartDataPoint[]} />}
      {chart.type === "market-share" && <MarketShareChart data={chart.data as PieChartDataPoint[]} />}
      {chart.type === "line" && <GenericLineChart data={chart.data as ChartDataPoint[]} />}
      {chart.type === "bar" && <VerticalBarChart data={chart.data as ChartDataPoint[]} />}
      {chart.type === "pie" && <PieChartComponent data={chart.data as PieChartDataPoint[]} />}
      {chart.type === "donut" && <DonutChart data={chart.data as PieChartDataPoint[]} />}
      {chart.type === "horizontal-bar" && <HorizontalBarChart data={chart.data as ChartDataPoint[]} />}
      {chart.type === "radial" && <RadialChartComponent data={chart.data as PieChartDataPoint[]} />}
      {chart.type === "area" && <AreaChartComponent data={chart.data as ChartDataPoint[]} />}
      {chart.type === "multiple-bar" && <VerticalBarChart data={chart.data as ChartDataPoint[]} />}
      {chart.type === "mixed-bar" && <MixedBarChart data={chart.data as ChartDataPoint[]} />}
    </ChartCard>
  )
}
