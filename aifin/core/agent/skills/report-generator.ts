import type { SkillResult } from "../types"

export function reportGenerator(params: Record<string, unknown>): SkillResult {
  const sections = params.sections as Array<{
    type: string
    title?: string
    content?: string
    data?: Record<string, unknown>[]
  }> | undefined
  const format = (params.format as string) ?? "standard"

  if (!sections || sections.length === 0) {
    return { success: false, data: {}, error: "sections array is required" }
  }

  const headerDecoration = format === "executive" ? "=" : "-"
  const maxDepth = format === "detailed" ? 3 : 2

  const rendered = sections.map((section) => {
    const depth = Math.min(section.type === "header" || section.type === "title" ? 1 : 2, maxDepth)
    const prefix = "#".repeat(depth)
    const title = section.title ?? ""
    const content = section.content ?? ""

    const parts: string[] = []
    parts.push(`\n${prefix} ${title}`)
    if (depth <= 1) {
      parts.push(headerDecoration.repeat(Math.min(title.length + 2, 60)))
    }
    if (content) {
      parts.push(content)
    }
    if (section.data && section.data.length > 0) {
      const headers = Object.keys(section.data[0])
      const rows = section.data.map((row) => headers.map((h) => String(row[h] ?? "")))
      const separator = `| ${headers.map((h) => "-".repeat(Math.max(h.length, 4))).join(" | ")} |`
      parts.push(`| ${headers.map((h) => h).join(" | ")} |`)
      parts.push(separator)
      rows.forEach((row) => {
        parts.push(`| ${row.map((c, i) => c.padEnd(Math.max(headers[i].length, 4))).join(" | ")} |`)
      })
    }
    return parts.join("\n")
  })

  const reportTitle = (params.title as string) ?? "Financial Analysis Report"

  const fullReport = [
    `# ${reportTitle}`,
    `**Format:** ${format.charAt(0).toUpperCase() + format.slice(1)}`,
    `**Generated:** ${new Date().toISOString().split("T")[0]}`,
    ...rendered,
  ].join("\n")

  const summary = sections
    .filter((s) => s.type === "summary" || s.type === "conclusion")
    .map((s) => s.content)
    .filter(Boolean)
    .join("\n")

  return {
    success: true,
    data: {
      report: fullReport,
      summary,
      format,
      section_count: sections.length,
      sections: sections.map((s) => s.type),
    },
  }
}
