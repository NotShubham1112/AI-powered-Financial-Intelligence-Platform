import type { OpenRouterMessage } from "@/core/models/providers"
import { callLLM } from "./llm"
import { toolRouter } from "./tool-router"
import { mcpExecutor } from "./mcp-executor"
import { executeSkill } from "./skills"
import type { Domain, AgentPlan, ReasoningSummary, RoutedStepResult } from "./types"
import { createStepSummary } from "./reasoning-summarizer"

const REASONING_PROMPT = `You are a research analyst executing a single step of a plan.

Given:
1. The overall goal
2. The current step to execute
3. Results from previous steps
4. The routing decision (this step uses LLM reasoning)

Produce a concise, actionable analysis for ONLY this step. Be specific and use data where possible.
Do NOT repeat previous steps' outputs. Focus exclusively on the current step.
Output a clear paragraph with findings. Max 300 words.`

export class ExecutionEngine {
  async execute(
    plan: AgentPlan,
    apiKey: string,
    model: string,
    referer: string,
    originalQuery: string
  ): Promise<{ results: RoutedStepResult[]; summaries: ReasoningSummary[] }> {
    const results: RoutedStepResult[] = []
    const summaries: ReasoningSummary[] = []
    let accumulatedContext = ""
    const domain = plan.domain

    for (let i = 0; i < plan.todo.length; i++) {
      const stepTitle = plan.todo[i]

      const route = await toolRouter.route(stepTitle, accumulatedContext, apiKey, model, referer, domain)
      let output = ""
      let rawData: unknown = undefined

      switch (route.type) {
        case "mcp": {
          const mcpResult = await mcpExecutor.execute(route, originalQuery, i, domain)
          output = mcpResult.output || "Data retrieved."
          rawData = mcpResult.rawData
          break
        }

        case "skill": {
          const skillResult = await executeSkill(route.toolOrSkill, route.params, domain)
          if (skillResult.success) {
            output = this.formatSkillOutput(route.toolOrSkill, skillResult.data)
          }
          // On failure, silently fall back to reasoning — no error messages exposed
          if (!skillResult.success || !output) {
            output = await this.reasonStep(stepTitle, plan.goal, accumulatedContext, apiKey, model, referer)
          }
          break
        }

        case "reasoning": {
          output = await this.reasonStep(stepTitle, plan.goal, accumulatedContext, apiKey, model, referer)
          break
        }
      }

      const result: RoutedStepResult = {
        stepIndex: i,
        stepTitle,
        route,
        output,
        rawData,
      }
      results.push(result)

      // Build clean accumulated context — no routing details
      accumulatedContext += `\nStep ${i + 1}: ${stepTitle}\n${output}\n`

      // Build reasoning summary for user display (no internal details)
      const summary = createStepSummary(i, stepTitle, domain ?? "general")
      summaries.push(summary)
    }

    return { results, summaries }
  }

  private async reasonStep(
    stepTitle: string,
    goal: string,
    context: string,
    apiKey: string,
    model: string,
    referer: string
  ): Promise<string> {
    const stepContext = context
      ? `Previous findings:\n${context}`
      : "No previous steps executed."

    const messages: OpenRouterMessage[] = [
      { role: "system", content: REASONING_PROMPT },
      {
        role: "user",
        content: `Goal: ${goal}\n\nStep: ${stepTitle}\n\n${stepContext}\n\nExecute this step: ${stepTitle}`,
      },
    ]

    return callLLM(apiKey, model, messages, referer, 600)
  }

  private formatSkillOutput(skillName: string, data: Record<string, unknown>): string {
    switch (skillName) {
      case "/skills/chart_builder": {
        const chartBlock = data.chart_block as string
        return chartBlock || ""
      }
      case "/skills/table_builder": {
        const markdown = data.markdown as string
        return markdown || ""
      }
      case "/skills/report_generator": {
        const report = data.report as string
        return report || ""
      }
      default:
        return ""
    }
  }
}

export const executionEngine = new ExecutionEngine()