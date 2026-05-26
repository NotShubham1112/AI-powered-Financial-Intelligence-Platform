import {
  runMcpAgent,
  resolveMcpRunOptions,
  type McpAgentRunResult,
} from "@/lib/mcp-client"
import type { ToolRoute } from "./types"

const MCP_BASE_URL = process.env.FINANCIAL_MCP_URL ?? "http://127.0.0.1:8000"

const TOOL_TO_SKILL_MAP: Record<string, string | undefined> = {
  "market.stock_history": undefined,     // generic
  "market.crypto_price": undefined,
  "market.macro_data": "macro_regime_detection",
  "market.news": undefined,
  "market.company_fundamentals": "equity_research",
  "market.options_chain": "equity_research",
}

export class McpExecutor {
  async execute(
    route: ToolRoute,
    originalQuery: string,
    stepIndex: number
  ): Promise<{ output: string; rawData?: unknown }> {
    const skillName = TOOL_TO_SKILL_MAP[route.toolOrSkill]
    const query = this.buildQuery(route, originalQuery)

    try {
      const options = resolveMcpRunOptions(query)
      if (skillName) {
        options.skill = skillName
        options.parallel = true
        options.max_steps = 2
      }

      const result = await runMcpAgent(query, options)

      if (!result) {
        return {
          output: `MCP tool "${route.toolOrSkill}" unavailable or returned no data. Using available context.`,
        }
      }

      const formatted = this.formatResult(result, route)
      return { output: formatted, rawData: result }
    } catch (err) {
      return {
        output: `MCP tool call failed: ${err instanceof Error ? err.message : "unknown error"}. Continuing with available data.`,
      }
    }
  }

  private buildQuery(route: ToolRoute, originalQuery: string): string {
    const params = route.params
    switch (route.toolOrSkill) {
      case "market.stock_history":
        return `Analyze stock history for ${params.ticker ?? "unknown"} over ${params.range ?? "1M"}`
      case "market.crypto_price":
        return `Check current ${params.symbol ?? "BTC"} price in ${params.currency ?? "USD"}`
      case "market.macro_data":
        return `Get ${params.indicator ?? "economic"} data for ${params.country ?? "US"}`
      case "market.news":
        return `Latest news: ${params.query ?? originalQuery}`
      case "market.company_fundamentals":
        return `Fundamental analysis for ${params.ticker ?? "unknown"}: ${params.metric ?? "all"}`
      case "market.options_chain":
        return `Options chain for ${params.ticker ?? "unknown"}`
      default:
        return originalQuery
    }
  }

  private formatResult(result: McpAgentRunResult, route: ToolRoute): string {
    const syn = result.synthesis
    const evidence = result.evidence ?? syn?.evidence ?? []
    const signals = result.live_signals ?? syn?.live_signals ?? []
    const exec = result.execution_metadata ?? syn?.execution_metadata
    const summary = syn?.quant_interpretation ?? ""

    const parts: string[] = []

    parts.push(`**Tool:** ${route.toolOrSkill} — Status: ${result.status}`)

    if (exec?.workflow_runtime_ms != null) {
      parts.push(`Runtime: ${(exec.workflow_runtime_ms / 1000).toFixed(1)}s`)
    }

    if (summary) {
      parts.push(`\n${summary}`)
    }

    if (evidence.length > 0) {
      parts.push("\n**Evidence:**")
      for (const e of evidence.slice(0, 5)) {
        parts.push(`- ${e.claim} (conf: ${e.confidence})`)
      }
    }

    if (signals.length > 0) {
      parts.push("\n**Signals:**")
      for (const s of signals.slice(0, 3)) {
        parts.push(`- ${s.label}: ${s.direction} — ${s.detail}`)
      }
    }

    return parts.join("\n") || `Data retrieved from ${route.toolOrSkill}.`
  }
}

export const mcpExecutor = new McpExecutor()
