import type { UIMessageStreamWriter } from "ai"
import { encodeRuntimeMarker } from "@/lib/sanitize-assistant-content"
import { generateId } from "ai"
import { classifyIntent, shouldUseAgentPipeline, stripCommandPrefix } from "./intent-router"
import { planner } from "./planner"
import { executionEngine } from "./execution-engine"
import { synthesizer } from "./synthesizer"
import { callLLM } from "./llm"
import type { AgentPlan, RoutedStepResult, IntentClassification, ToolRoute } from "./types"
import { AGENT_PLAN_OPEN, AGENT_PLAN_CLOSE } from "./types"

export type { AgentPlan, RoutedStepResult, IntentClassification, ToolRoute }
export { classifyIntent, shouldUseAgentPipeline, stripCommandPrefix }

export type AgentRunRequest = {
  query: string
  apiKey: string
  model: string
  referer: string
}

function streamText(
  writer: UIMessageStreamWriter,
  textId: string,
  text: string,
  chunkSize = 48
) {
  for (let i = 0; i < text.length; i += chunkSize) {
    writer.write({
      type: "text-delta",
      id: textId,
      delta: text.slice(i, i + chunkSize),
    })
  }
}

function formatRouteLine(route: ToolRoute): string {
  return `> — Route: ${route.type}${route.toolOrSkill ? ` · ${route.toolOrSkill}` : ""}`
}

export class AgentPipeline {
  async streamAgentResponse(
    req: AgentRunRequest,
    writer: UIMessageStreamWriter,
    textId: string
  ): Promise<void> {
    writer.write({ type: "text-start", id: textId })

    const classification = classifyIntent(req.query, true)
    const query = stripCommandPrefix(req.query)

    // Phase 1: Planning
    writer.write({
      type: "text-delta",
      id: textId,
      delta: encodeRuntimeMarker("agent_planning"),
    })

    const plan = await planner.plan(query, req.apiKey, req.model, req.referer)

    // Stream plan as visible text
    let planText = `${AGENT_PLAN_OPEN}Goal: ${plan.goal}\n\nPlan:\n`
    plan.todo.forEach((step, i) => {
      planText += `${i + 1}. ${step}\n`
    })
    planText += AGENT_PLAN_CLOSE

    streamText(writer, textId, planText)

    // Phase 2: Execution with tool router
    writer.write({
      type: "text-delta",
      id: textId,
      delta: encodeRuntimeMarker("agent_executing"),
    })

    const stepResults = await executionEngine.execute(plan, req.apiKey, req.model, req.referer, query)

    // Stream step results with tool traces
    for (const step of stepResults) {
      const stepHeader = `\n### Step ${step.stepIndex + 1}: ${step.stepTitle}\n\n`
      streamText(writer, textId, stepHeader)

      const routeLine = formatRouteLine(step.route)
      streamText(writer, textId, `${routeLine}\n\n`)

      streamText(writer, textId, `${step.output}\n`)

      writer.write({
        type: "text-delta",
        id: textId,
        delta: encodeRuntimeMarker("agent_step_complete", undefined, String(step.stepIndex)),
      })
    }

    // Phase 3: Synthesis
    writer.write({
      type: "text-delta",
      id: textId,
      delta: encodeRuntimeMarker("agent_synthesizing"),
    })

    const synthesis = await synthesizer.synthesize(
      query,
      plan,
      stepResults,
      req.apiKey,
      req.model,
      req.referer
    )

    streamText(writer, textId, synthesis)

    writer.write({
      type: "text-delta",
      id: textId,
      delta: encodeRuntimeMarker("complete"),
    })
    writer.write({ type: "text-end", id: textId })
  }
}

export const agentPipeline = new AgentPipeline()
