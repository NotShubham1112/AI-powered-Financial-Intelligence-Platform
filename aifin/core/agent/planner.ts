import type { OpenRouterMessage } from "@/core/models/providers"
import { callLLM, extractJsonFromLLMOutput } from "./llm"
import type { AgentPlan, Domain } from "./types"

const PLANNER_PROMPT = `You are a research planner. Given a user query and domain context, break it down into atomic, independently solvable steps.

Output ONLY valid JSON with this exact structure:
{
  "goal": "one-sentence description of the overall objective",
  "todo": ["step 1", "step 2", "step 3"]
}

Rules:
- Each step must be a clear, single action
- Steps must be logically ordered (dependencies first)
- Do NOT include any text outside the JSON block
- Do NOT use markdown formatting`

const DOMAIN_PLAN_PROMPTS: Record<string, string> = {
  technology_research: `Focus on: market sizing, infrastructure analysis, policy landscape, talent ecosystem, enterprise adoption, competitive dynamics, growth projections. Use data-driven analysis.`,
  macroeconomic_analysis: `Focus on: GDP, inflation, monetary/fiscal policy, employment, trade, yield curves, sector analysis, risk factors. Use quantitative indicators.`,
  financial_portfolio_analysis: `Focus on: asset allocation, risk metrics, diversification, performance attribution, scenario analysis, rebalancing.`,
  market_intelligence: `Focus on: market sizing, competitive landscape, growth drivers, barriers, trends, forecasts, key players.`,
  policy_analysis: `Focus on: regulatory framework, policy impact, compliance requirements, strategic implications, stakeholder analysis.`,
}

export class Planner {
  async plan(
    query: string,
    apiKey: string,
    model: string,
    referer: string,
    domain?: Domain
  ): Promise<AgentPlan> {
    const domainPrompt = DOMAIN_PLAN_PROMPTS[domain ?? ""]
    const systemPrompt = domainPrompt
      ? `${PLANNER_PROMPT}\n\nDomain context: ${domainPrompt}`
      : PLANNER_PROMPT

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ]

    const output = await callLLM(apiKey, model, messages, referer, 800)
    const parsed = extractJsonFromLLMOutput(output)

    if (parsed && typeof parsed.goal === "string" && Array.isArray(parsed.todo)) {
      return {
        goal: parsed.goal,
        todo: parsed.todo.map(String),
        domain,
      }
    }

    return this.buildFallbackPlan(query, domain)
  }

  private buildFallbackPlan(query: string, domain?: Domain): AgentPlan {
    const q = query.toLowerCase()
    const steps: string[] = []

    if (domain === "technology_research") {
      steps.push("Analyze market size, growth trajectory, and key projections")
      steps.push("Evaluate infrastructure, compute, and policy landscape")
      steps.push("Assess talent ecosystem, enterprise adoption, and competitive dynamics")
      steps.push("Identify bottlenecks, risk factors, and growth catalysts")
      steps.push("Synthesize findings into structured analysis")
    } else if (domain === "macroeconomic_analysis") {
      steps.push("Analyze macroeconomic indicators and trends")
      steps.push("Evaluate fiscal and monetary policy stance")
      steps.push("Assess sector and market conditions")
      steps.push("Review risk factors and tail risks")
      steps.push("Synthesize macro outlook and implications")
    } else if (
      q.includes("stock") ||
      q.includes("equity") ||
      q.includes("share") ||
      q.includes("ticker")
    ) {
      steps.push("Analyze company fundamentals and financial health")
      steps.push("Evaluate market position and competitive landscape")
      steps.push("Assess valuation metrics and price targets")
      steps.push("Synthesize investment recommendation")
    } else if (
      q.includes("portfolio") ||
      q.includes("asset") ||
      q.includes("allocation")
    ) {
      steps.push("Analyze current portfolio composition")
      steps.push("Evaluate asset class risk-return profiles")
      steps.push("Determine optimal allocation strategy")
      steps.push("Generate rebalancing recommendations")
    } else if (
      q.includes("macro") ||
      q.includes("econom") ||
      q.includes("market")
    ) {
      steps.push("Analyze macroeconomic indicators and trends")
      steps.push("Evaluate sector and market conditions")
      steps.push("Assess risk factors and tail risks")
      steps.push("Synthesize macro outlook")
    } else {
      steps.push("Understand context and objectives")
      steps.push("Gather and analyze relevant data")
      steps.push("Evaluate alternatives and trade-offs")
      steps.push("Generate structured recommendation")
    }

    return {
      goal: query.length > 100 ? query.slice(0, 100) + "..." : query,
      todo: steps,
      domain,
    }
  }
}

export const planner = new Planner()
