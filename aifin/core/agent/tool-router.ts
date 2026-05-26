import type { OpenRouterMessage } from "@/core/models/providers"
import { callLLM, extractJsonFromLLMOutput } from "./llm"
import type { ToolRoute } from "./types"

const ROUTER_PROMPT = `You are a tool routing engine for a financial AI system.

Your job is to decide how to execute a task.

Available MCP tools (external data APIs):
- market.stock_history: Fetch historical stock prices. Params: ticker, range(1D/1W/1M/3M/1Y/5Y)
- market.crypto_price: Fetch current crypto price. Params: symbol, currency(USD)
- market.macro_data: Fetch macroeconomic indicator. Params: indicator(gdp/cpi/unemployment/rates), country, period
- market.news: Fetch financial news. Params: query, count, source
- market.company_fundamentals: Fetch company fundamentals. Params: ticker, metric(pe/eps/debt/revenue)
- market.options_chain: Fetch options data. Params: ticker, expiration, type(call/put)

Available /skills (deterministic computations):
- /skills/risk_model: Compute portfolio risk score. Params: assets(string[]), weights(number[]), volatility(number)
- /skills/portfolio_builder: Build optimized portfolio allocation. Params: goals(string), constraints(object), riskTolerance(low/med/high)
- /skills/trend_analyzer: Analyze trend direction and strength. Params: dataPoints(number[]), window(number)
- /skills/table_builder: Format data as structured table. Params: headers(string[]), rows(string[][]), title(string)
- /skills/chart_builder: Generate chart-ready data format. Params: type(line/bar/pie/area), labels(string[]), datasets(object[])
- /skills/report_generator: Build structured report sections. Params: sections(object[]), format(standard/executive/detailed)

Rules:
- Use MCP for any real-world data (prices, rates, news, fundamentals)
- Use /skills for math, finance logic, transformations, formatting
- Use reasoning only when no tool fits

Return ONLY valid JSON with this exact structure:
{
  "type": "mcp" | "skill" | "reasoning",
  "toolOrSkill": "the tool or skill name",
  "params": { "key": "value" },
  "description": "brief explanation of routing decision"
}`

const MCP_TOOL_PATTERNS: { pattern: RegExp; tool: string }[] = [
  { pattern: /stock|price|history|historical|share|equity|ticker|NASDAQ|NYSE/i, tool: "market.stock_history" },
  { pattern: /crypto|cryptocurrency|bitcoin|btc|eth|ethereum|solana|sol|token/i, tool: "market.crypto_price" },
  { pattern: /GDP|gdp|inflation|cpi|unemployment|interest rate|fed|central bank|macro|econom/i, tool: "market.macro_data" },
  { pattern: /news|headline|announcement|press|coverage|media/i, tool: "market.news" },
  { pattern: /fundamental|P\/E|pe ratio|eps|earnings|debt|revenue|balance sheet|income/i, tool: "market.company_fundamentals" },
  { pattern: /option|call|put|strike|expiration|greeks|implied volatility/i, tool: "market.options_chain" },
]

const SKILL_PATTERNS: { pattern: RegExp; skill: string }[] = [
  { pattern: /risk|volatility|var|stress test|exposure|beta|sharpe/i, skill: "/skills/risk_model" },
  { pattern: /portfolio|allocation|asset mix|rebalance|weight|diversify/i, skill: "/skills/portfolio_builder" },
  { pattern: /trend|momentum|moving average|direction|strength|pattern/i, skill: "/skills/trend_analyzer" },
  { pattern: /table|tabular|grid|matrix|spreadsheet/i, skill: "/skills/table_builder" },
  { pattern: /chart|graph|plot|visualize|visualization|chart data/i, skill: "/skills/chart_builder" },
  { pattern: /report|summary|brief|write.?up|document|overview/i, skill: "/skills/report_generator" },
]

function fallbackRoute(task: string): ToolRoute {
  const taskLower = task.toLowerCase()

  for (const { pattern, tool } of MCP_TOOL_PATTERNS) {
    if (pattern.test(taskLower)) {
      const tickerMatch = taskLower.match(/\b[A-Z]{1,5}\b/)
      return {
        type: "mcp",
        toolOrSkill: tool,
        params: tickerMatch ? { ticker: tickerMatch[0].toUpperCase(), range: "1M" } : {},
        description: `Matched to MCP tool: ${tool} via keyword pattern`,
      }
    }
  }

  for (const { pattern, skill } of SKILL_PATTERNS) {
    if (pattern.test(taskLower)) {
      return {
        type: "skill",
        toolOrSkill: skill,
        params: {},
        description: `Matched to /skills: ${skill} via keyword pattern`,
      }
    }
  }

  return {
    type: "reasoning",
    toolOrSkill: "",
    params: {},
    description: "No MCP or skill pattern matched; using LLM reasoning",
  }
}

export class ToolRouter {
  async route(
    task: string,
    context: string,
    apiKey: string,
    model: string,
    referer: string
  ): Promise<ToolRoute> {
    const messages: OpenRouterMessage[] = [
      { role: "system", content: ROUTER_PROMPT },
      {
        role: "user",
        content: `Task: ${task}\n\nContext so far: ${context || "none"}\n\nRoute this task.`,
      },
    ]

    try {
      const output = await callLLM(apiKey, model, messages, referer, 500)
      const parsed = extractJsonFromLLMOutput(output)

      if (
        parsed &&
        typeof parsed.type === "string" &&
        ["mcp", "skill", "reasoning"].includes(parsed.type)
      ) {
        return {
          type: parsed.type as ToolRoute["type"],
          toolOrSkill: String(parsed.toolOrSkill ?? ""),
          params: (parsed.params as Record<string, unknown>) ?? {},
          description: String(parsed.description ?? ""),
        }
      }
    } catch {
      // fall through to heuristic routing
    }

    return fallbackRoute(task)
  }

  routeHeuristic(task: string): ToolRoute {
    return fallbackRoute(task)
  }
}

export const toolRouter = new ToolRouter()
