import {
  runMcpAgent,
  resolveMcpRunOptions,
  type McpAgentRunResult,
} from "@/lib/mcp-client"
import type { Domain, ToolRoute } from "./types"

const MCP_BASE_URL = process.env.FINANCIAL_MCP_URL ?? "http://127.0.0.1:8000"

const TOOL_TO_SKILL_MAP: Record<string, string | undefined> = {
  "market.stock_history": undefined,
  "market.crypto_price": undefined,
  "market.macro_data": "macro_regime_detection",
  "market.news": undefined,
  "market.company_fundamentals": "equity_research",
  "market.options_chain": "equity_research",
}

const DOMAIN_TOOL_RESTRICTIONS: Record<string, string[]> = {
  technology_research: ["market.macro_data"],
  market_intelligence: ["market.macro_data"],
}

export class McpExecutor {
  async execute(
    route: ToolRoute,
    originalQuery: string,
    stepIndex: number,
    domain?: Domain
  ): Promise<{ output: string; rawData?: unknown }> {
    // Skip execution if this tool is restricted for this domain
    if (domain && DOMAIN_TOOL_RESTRICTIONS[domain]?.includes(route.toolOrSkill)) {
      return { output: "" }
    }

    const skillName = TOOL_TO_SKILL_MAP[route.toolOrSkill]
    const query = this.buildQuery(route, originalQuery, domain)

    try {
      const options = resolveMcpRunOptions(query)
      if (skillName) {
        options.skill = skillName
        options.parallel = true
        options.max_steps = 2
      }

      const result = await runMcpAgent(query, options)

      if (!result) {
        return { output: "" }
      }

      const formatted = this.formatResult(result, route)
      return { output: formatted, rawData: result }
    } catch {
      return { output: "" }
    }
  }

  private buildQuery(route: ToolRoute, originalQuery: string, domain?: Domain): string {
    const params = route.params
    switch (route.toolOrSkill) {
      case "market.stock_history":
        return `Analyze stock history for ${params.ticker ?? "unknown"} over ${params.range ?? "1M"}`
      case "market.crypto_price":
        return `Check current ${params.symbol ?? "BTC"} price in ${params.currency ?? "USD"}`
      case "market.macro_data":
        // For tech research, skip macro data unless query has explicit macro intent
        if (domain === "technology_research") return ""
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
    const summary = syn?.quant_interpretation ?? ""
    const evidence = result.evidence ?? syn?.evidence ?? []
    const signals = result.live_signals ?? syn?.live_signals ?? []

    const parts: string[] = []

    // Only include the quantitative interpretation — no run_id, status, tool names, etc.
    if (summary) {
      parts.push(summary)
    }

    // Include evidence claims in clean format (no confidence scores or internal fields)
    if (evidence.length > 0) {
      const cleanEvidence = evidence.slice(0, 3).map((e) => e.claim)
      if (cleanEvidence.length > 0) {
        parts.push("Key findings:")
        parts.push(cleanEvidence.map((c) => `- ${c}`).join("\n"))
      }
    }

    // Include signals in clean format
    if (signals.length > 0) {
      const cleanSignals = signals.slice(0, 2).map((s) => {
        const dir = s.direction === "up" ? "increasing" : s.direction === "down" ? "decreasing" : "stable"
        return `${s.label}: ${dir}`
      })
      if (cleanSignals.length > 0) {
        parts.push(cleanSignals.join(" · "))
      }
    }

    return parts.join("\n\n") || ""
  }
}

export const mcpExecutor = new McpExecutor()