import type { UIMessageStreamWriter } from "ai"
import { classifyIntent, shouldUseAgentPipeline, stripCommandPrefix } from "./intent-router"
import { planner } from "./planner"
import { executionEngine } from "./execution-engine"
import { synthesizer } from "./synthesizer"
import type { AgentPlan, Domain, IntentClassification, ReasoningSummary, ToolRoute } from "./types"
import { createReasoningHeader, createReasoningFooter, synthesizeFinalSummary } from "./reasoning-summarizer"

export type { AgentPlan, IntentClassification, ToolRoute }
export { classifyIntent, shouldUseAgentPipeline, stripCommandPrefix }

export type AgentRunRequest = {
  query: string
  apiKey: string
  model: string
  referer: string
}

// Patterns that indicate unfilled placeholders in generated content
const PLACEHOLDER_PATTERNS = [
  /\$\s*X\s*(?:\s*billion|\s*million|\s*crore|\s*lakh)?/gi,
  /\$\s*XXX[\w]*/g,
  /\[?[Tt][Bb][Dd]\]?/g,
  /\[?[Nn]\/[Aa]\]?/g,
  /\[?[Pp]laceholder\]?/gi,
  /\[?[Ii]nsert\s+\w+\]/gi,
  /\[?\w+\s+[Tt]o\s+[Bb]e\s+[Dd]etermined\]?/gi,
  /\[?\w+\s+[Dd]ata\s+[Uu]navailable\]?/gi,
]

// Macro-only metrics that don't belong in technology research reports
const MACRO_ONLY_PATTERNS = [
  /10Y[- ]2Y\s+yield/i,
  /yield\s+curve\s+(inversion|inverted|spread)/i,
  /\b(bps|basis\s+points)\b.*\b(yield|spread|curve)\b/i,
]

function hasPlaceholders(text: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => p.test(text))
}

function stripPlaceholders(text: string): string {
  let out = text
  for (const pattern of PLACEHOLDER_PATTERNS) {
    out = out.replace(pattern, "")
  }
  return out
}

function hasMacroMismatch(text: string, domain: Domain): boolean {
  if (domain !== "technology_research") return false
  return MACRO_ONLY_PATTERNS.some((p) => p.test(text))
}

function stripMacroMismatches(text: string, domain: Domain): string {
  if (domain !== "technology_research") return text
  let out = text
  for (const pattern of MACRO_ONLY_PATTERNS) {
    out = out.replace(pattern, "")
  }
  return out
}

export class AgentPipeline {
  async streamAgentResponse(
    req: AgentRunRequest,
    writer: UIMessageStreamWriter,
    textId: string
  ): Promise<void> {
    writer.write({ type: "text-start", id: textId })

    try {
      const classification = classifyIntent(req.query, true)
      const query = stripCommandPrefix(req.query)
      const domain = classification.domain

      // Phase 1: Planning (internal — no raw plan streamed to user)
      const plan = await planner.plan(query, req.apiKey, req.model, req.referer, domain)
      plan.domain = domain

      // Phase 2: Execution with tool router
      const { results, summaries } = await executionEngine.execute(
        plan, req.apiKey, req.model, req.referer, query
      )

      // Phase 3: Build condensed reasoning trace
      const reasoningHeader = createReasoningHeader(domain, plan.todo)
      const reasoningBody = summaries
        .map((s) => `* ${s.message}`)
        .join("\n")
      const finalSummary = synthesizeFinalSummary(results, domain)
      const reasoningFooter = createReasoningFooter()

      const condensedReasoning = `${reasoningHeader}\n${reasoningBody}\n\n${finalSummary}${reasoningFooter}`
      this.streamText(writer, textId, condensedReasoning)

      // Phase 4: Synthesis — polished final output
      let synthesis = await synthesizer.synthesize(
        query, plan, results, req.apiKey, req.model, req.referer
      )

      if (hasPlaceholders(synthesis)) {
        synthesis = stripPlaceholders(synthesis)
      }
      if (hasMacroMismatch(synthesis, domain)) {
        synthesis = stripMacroMismatches(synthesis, domain)
      }

      this.streamText(writer, textId, synthesis)
    } catch (e) {
      console.error("AgentPipeline error:", e)
      this.streamText(writer, textId, "I encountered an issue while processing your request. Please try again.")
    }

    writer.write({ type: "text-end", id: textId })
  }

  private streamText(
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
}

export const agentPipeline = new AgentPipeline()