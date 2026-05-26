import type { OpenRouterMessage } from "@/core/models/providers"
import { callLLM } from "./llm"
import { toolRouter } from "./tool-router"
import { mcpExecutor } from "./mcp-executor"
import { executeSkill } from "./skills"
import type { AgentPlan, RoutedStepResult } from "./types"

const REASONING_PROMPT = `You are a financial analyst executing a single step of a research plan.

Given:
1. The overall goal
2. The current step to execute
3. Results from previous steps (including tool outputs)
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
  ): Promise<RoutedStepResult[]> {
    const results: RoutedStepResult[] = []
    let accumulatedContext = ""

    for (let i = 0; i < plan.todo.length; i++) {
      const stepTitle = plan.todo[i]

      // Route this task to MCP, Skill, or Reasoning
      const route = await toolRouter.route(stepTitle, accumulatedContext, apiKey, model, referer)
      let output = ""
      let rawData: unknown = undefined

      switch (route.type) {
        case "mcp": {
          const mcpResult = await mcpExecutor.execute(route, originalQuery, i)
          output = mcpResult.output
          rawData = mcpResult.rawData
          break
        }

        case "skill": {
          const skillResult = await executeSkill(route.toolOrSkill, route.params)
          if (skillResult.success) {
            output = this.formatSkillOutput(route.toolOrSkill, skillResult.data)
            rawData = skillResult.data
          } else {
            output = `Skill execution failed: ${skillResult.error}. Falling back to reasoning.`
            const reasoningOutput = await this.reasonStep(stepTitle, plan.goal, accumulatedContext, apiKey, model, referer)
            output += `\n${reasoningOutput}`
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
      accumulatedContext += `\nStep ${i + 1}: ${stepTitle}\nRoute: ${route.type} · ${route.toolOrSkill}\n${output}\n`
    }

    return results
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
        return chartBlock || JSON.stringify(data, null, 2)
      }
      case "/skills/table_builder": {
        const markdown = data.markdown as string
        return markdown || JSON.stringify(data, null, 2)
      }
      case "/skills/report_generator": {
        const report = data.report as string
        return report || JSON.stringify(data, null, 2)
      }
      default:
        return JSON.stringify(data, null, 2)
    }
  }
}

export const executionEngine = new ExecutionEngine()
