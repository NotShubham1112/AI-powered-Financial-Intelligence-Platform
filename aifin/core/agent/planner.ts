import type { OpenRouterMessage } from "@/core/models/providers"
import { callLLM, extractJsonFromLLMOutput } from "./llm"
import type { AgentPlan } from "./types"

const PLANNER_PROMPT = `You are a financial analysis planner. Given a user query, break it down into atomic, independently solvable steps.

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

export class Planner {
  async plan(
    query: string,
    apiKey: string,
    model: string,
    referer: string
  ): Promise<AgentPlan> {
    const messages: OpenRouterMessage[] = [
      { role: "system", content: PLANNER_PROMPT },
      { role: "user", content: query },
    ]

    const output = await callLLM(apiKey, model, messages, referer, 800)
    const parsed = extractJsonFromLLMOutput(output)

    if (parsed && typeof parsed.goal === "string" && Array.isArray(parsed.todo)) {
      return {
        goal: parsed.goal,
        todo: parsed.todo.map(String),
      }
    }

    return this.buildFallbackPlan(query)
  }

  private buildFallbackPlan(query: string): AgentPlan {
    const q = query.toLowerCase()
    const steps: string[] = []

    if (
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
      steps.push("Understand the financial context and objectives")
      steps.push("Gather relevant data and perform analysis")
      steps.push("Evaluate alternatives and trade-offs")
      steps.push("Generate structured recommendation")
    }

    return {
      goal: query.length > 100 ? query.slice(0, 100) + "..." : query,
      todo: steps,
    }
  }
}

export const planner = new Planner()
