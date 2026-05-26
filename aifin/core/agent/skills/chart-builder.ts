import type { SkillResult } from "../types"

export function chartBuilder(params: Record<string, unknown>): SkillResult {
  const type = (params.type as string) ?? "bar"
  const labels = params.labels as string[] | undefined
  const datasets = params.datasets as Array<{ label: string; data: number[]; color?: string }> | undefined

  if (!labels || !datasets || labels.length === 0 || datasets.length === 0) {
    return { success: false, data: {}, error: "labels and datasets are required" }
  }

  if (!["line", "bar", "pie", "area"].includes(type)) {
    return { success: false, data: {}, error: "type must be line, bar, pie, or area" }
  }

  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]
  const chart = {
    type,
    title: (params.title as string) ?? "Chart",
    description: params.description as string | undefined,
    config: {} as Record<string, { label: string; color: string }>,
    data: labels.map((label, i) => {
      const point: Record<string, string | number> = { name: label }
      datasets.forEach((ds, j) => {
        point[ds.label] = ds.data[i] ?? 0
      })
      return point
    }),
    xKey: "name",
    yKeys: datasets.map((ds) => ds.label),
  }

  datasets.forEach((ds, i) => {
    chart.config[ds.label] = {
      label: ds.label,
      color: ds.color ?? colors[i % colors.length],
    }
  })

  const chartBlock = `\`\`\`chart:${type}\n${JSON.stringify(chart, null, 2)}\n\`\`\``

  return {
    success: true,
    data: {
      chart_block: chartBlock,
      chart_data: chart,
      type,
      series_count: datasets.length,
      data_points: labels.length,
    },
  }
}
