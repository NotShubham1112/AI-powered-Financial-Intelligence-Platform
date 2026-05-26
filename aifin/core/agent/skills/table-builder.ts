import type { SkillResult } from "../types"

export function tableBuilder(params: Record<string, unknown>): SkillResult {
  const headers = params.headers as string[] | undefined
  const rows = params.rows as string[][] | undefined
  const title = (params.title as string) ?? ""

  if (!headers || !rows || headers.length === 0 || rows.length === 0) {
    return { success: false, data: {}, error: "headers and rows are required" }
  }

  const columnWidths = headers.map((h, i) => {
    const headerLen = h.length
    const maxDataLen = rows.reduce((max, row) => Math.max(max, (row[i] ?? "").length), 0)
    return Math.max(headerLen, maxDataLen, 4)
  })

  const separator = `| ${columnWidths.map((w) => "-".repeat(w)).join(" | ") } |`

  const headerLine = `| ${headers.map((h, i) => h.padEnd(columnWidths[i])).join(" | ")} |`

  const bodyLines = rows.map(
    (row) => `| ${row.map((cell, i) => (cell ?? "").padEnd(columnWidths[i])).join(" | ")} |`
  )

  const markdownTable = [headerLine, separator, ...bodyLines].join("\n")

  return {
    success: true,
    data: {
      markdown: markdownTable,
      title,
      column_count: headers.length,
      row_count: rows.length,
      headers,
      rows,
    },
  }
}
