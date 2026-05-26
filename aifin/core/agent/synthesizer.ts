import type { OpenRouterMessage } from "@/core/models/providers"
import { callLLM } from "./llm"
import type { AgentPlan, RoutedStepResult } from "./types"

const SYNTHESIS_PROMPT = `You are a senior financial analyst producing a final synthesis report.

Given:
1. The original research goal
2. All step-by-step analysis results

Produce a comprehensive, well-structured final response that:
1. States the overall finding clearly
2. Weaves together all step outputs into a coherent narrative
3. Resolves any contradictions between steps
4. Provides actionable insights or recommendations
5. Uses professional financial language

Format the output with clear sections using markdown headings. Do NOT include any internal planning artifacts.`

export class Synthesizer {
  async synthesize(
    query: string,
    plan: AgentPlan,
    stepResults: RoutedStepResult[],
    apiKey: string,
    model: string,
    referer: string
  ): Promise<string> {
    const stepsSummary = stepResults
      .map(
        (s) => `## Step ${s.stepIndex + 1}: ${s.stepTitle}\n_Route: ${s.route.type}/${s.route.toolOrSkill}_\n${s.output}`
      )
      .join("\n\n")

    const messages: OpenRouterMessage[] = [
      { role: "system", content: SYNTHESIS_PROMPT },
      {
        role: "user",
        content: `Original Query: ${query}\n\nGoal: ${plan.goal}\n\nAnalysis Results:\n${stepsSummary}\n\nProduce the final synthesis report.`,
      },
    ]

    return callLLM(apiKey, model, messages, referer, 1500)
  }
}

export const synthesizer = new Synthesizer()
