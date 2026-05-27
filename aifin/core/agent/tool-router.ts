import type { OpenRouterMessage } from "@/core/models/providers"
import { callLLM, extractJsonFromLLMOutput } from "./llm"
import { validateSkillInputs } from "./skills"
import type { Domain, ToolRoute } from "./types"

const ROUTER_PROMPT = `You are a task routing engine for an AI research system.

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
- Use /skills for math, logic, transformations, formatting
- /skills/risk_model and /skills/portfolio_builder are ONLY for financial portfolio analysis
- Use reasoning when no tool fits

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

const PORTFOLIO_SKILLS = new Set(["/skills/risk_model", "/skills/portfolio_builder"])

const TECHNOLOGY_PATTERNS = [
  /\bAI\b|\bartificial intelligence\b|\bmachine learning\b|\bdeep learning\b/i,
  /\bcompute\b|\binfrastructure\b|\bdata center\b|\bGPU\b|\bsemiconductor\b|\bchip\b/i,
  /\bdeveloper\b|\bstartup\b|\becosystem\b|\binnovation\b|\bdigital\b/i,
  /\bIndia\b|\bmarket sizing\b|\bgrowth\b|\bprojection\b|\btalent\b/i,
]

const TECH_EXPLICIT_MACRO_PATTERNS = [
  /\binterest\s+rate\b|\bfunding\s+cost\b|\bcapita(l| expenditure)\b|\bCAPEX\b|\binvestment\s+climate\b/i,
  /\bventure\s+capital\b|\bVC\s+funding\b|\bprivate\s+equity\b|\bPE\s+investment\b/i,
]

function containsTechTerms(text: string): boolean {
  return TECHNOLOGY_PATTERNS.some((p) => p.test(text))
}

function hasExplicitMacroIntent(text: string): boolean {
  return TECH_EXPLICIT_MACRO_PATTERNS.some((p) => p.test(text))
}

function fallbackRoute(task: string, domain?: Domain): ToolRoute {
  const taskLower = task.toLowerCase()

  // If domain is tech research, avoid portfolio skills and restrict macro data
  const isTechResearch = domain === "technology_research" || domain === "market_intelligence"
  const isMacroDomain = domain === "macroeconomic_analysis"
  const hasTechTerms = containsTechTerms(taskLower)
  const hasExplicitMacro = hasExplicitMacroIntent(taskLower)

  for (const { pattern, tool } of MCP_TOOL_PATTERNS) {
    if (pattern.test(taskLower)) {
      // Block macro_data for tech research unless query explicitly asks for rates/funding
      if (tool === "market.macro_data" && isTechResearch && !hasExplicitMacro) {
        continue
      }
      const tickerMatch = taskLower.match(/\b[A-Z]{1,5}\b/)
      return {
        type: "mcp",
        toolOrSkill: tool,
        params: tickerMatch ? { ticker: tickerMatch[0].toUpperCase(), range: "1M" } : {},
        description: "Data retrieval",
      }
    }
  }

  for (const { pattern, skill } of SKILL_PATTERNS) {
    if (pattern.test(taskLower)) {
      // Skip portfolio skills for non-finance domains
      if ((isTechResearch || isMacroDomain) && PORTFOLIO_SKILLS.has(skill)) {
        continue
      }
      // Skip portfolio skills when the query contains tech terms
      if (hasTechTerms && PORTFOLIO_SKILLS.has(skill)) {
        continue
      }
      return {
        type: "skill",
        toolOrSkill: skill,
        params: {},
        description: "Analysis task",
      }
    }
  }

  return {
    type: "reasoning",
    toolOrSkill: "",
    params: {},
    description: "Analysis via reasoning",
  }
}

export class ToolRouter {
  async route(
    task: string,
    context: string,
    apiKey: string,
    model: string,
    referer: string,
    domain?: Domain
  ): Promise<ToolRoute> {
    // First try domain-aware heuristic routing (fast path)
    const heuristicRoute = fallbackRoute(task, domain)

    // For tech/macro domains, try LLM routing but with domain context
    const messages: OpenRouterMessage[] = [
      { role: "system", content: `${ROUTER_PROMPT}\n\nCurrent domain context: ${domain || "general"}` },
      {
        role: "user",
        content: `Task: ${task}\n\nContext: ${context || "none"}\n\nRoute this task considering the domain: ${domain || "general"}.`,
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
        const route: ToolRoute = {
          type: parsed.type as ToolRoute["type"],
          toolOrSkill: String(parsed.toolOrSkill ?? ""),
          params: (parsed.params as Record<string, unknown>) ?? {},
          description: String(parsed.description ?? ""),
        }

        // Validate: if it's a portfolio skill, check inputs and domain
        if (route.type === "skill" && PORTFOLIO_SKILLS.has(route.toolOrSkill)) {
          const validation = validateSkillInputs(route.toolOrSkill, route.params, domain)
          if (!validation.valid) {
            return heuristicRoute
          }
        }

        return route
      }
    } catch {
      // fall through to heuristic
    }

    return heuristicRoute
  }

  routeHeuristic(task: string, domain?: Domain): ToolRoute {
    return fallbackRoute(task, domain)
  }
}

export const toolRouter = new ToolRouter()
