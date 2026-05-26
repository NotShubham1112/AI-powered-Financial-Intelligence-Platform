import type { McpAgentRunResult } from "@/lib/mcp-client"
import { generateMockResponse } from "@/app/api/chat/mock"

/** Engine-only synthesis when all LLM providers fail */
export function buildDeterministicResponse(
  userQuery: string,
  mcpResult: McpAgentRunResult | null
): string {
  const sections: string[] = [
    "## Research Summary\n",
    "*Analysis generated from deterministic financial engines.*\n",
  ]

  if (mcpResult) {
    const synthesis = mcpResult.synthesis as {
      tool_summaries?: Array<{ tool: string; summary: unknown }>
      narrative?: string
    } | undefined

    sections.push("## Deterministic MCP Analysis\n")
    sections.push(`**Run:** ${mcpResult.run_id} · **Status:** ${mcpResult.status}\n`)

    if (synthesis?.narrative) {
      sections.push(synthesis.narrative + "\n")
    }

    if (synthesis?.tool_summaries?.length) {
      sections.push("### Engine outputs\n")
      for (const s of synthesis.tool_summaries) {
        sections.push(`- **${s.tool}:** \`${JSON.stringify(s.summary)}\`\n`)
      }
    }

    const validation = mcpResult.validation as {
      confidence?: number
      flags?: string[]
    } | undefined
    if (validation?.confidence != null) {
      sections.push(`\n**Validation confidence:** ${validation.confidence}\n`)
    }
    if (validation?.flags?.length) {
      sections.push(`**Flags:** ${validation.flags.join(", ")}\n`)
    }
  } else {
    sections.push(generateMockResponse(userQuery, []))
  }

  sections.push(
    "\n---\n*Retry when OpenRouter free tier recovers, or switch to another model in the selector.*\n"
  )

  return sections.join("")
}
