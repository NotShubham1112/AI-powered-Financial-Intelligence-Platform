import type { McpAgentRunResult, EvidenceClaimDto } from "@/lib/mcp-client"
import { generateMockResponse } from "@/app/api/chat/mock"

/** Engine-only synthesis when all LLM providers fail */
export function buildDeterministicResponse(
  userQuery: string,
  mcpResult: McpAgentRunResult | null
): string {
  const sections: string[] = [
    "## Research Summary\n",
  ]

  if (mcpResult) {
    const synthesis = mcpResult.synthesis
    const narrative = (synthesis as Record<string, string> | undefined)?.narrative
    const quantInterpretation = synthesis?.quant_interpretation ?? ""
    const evidence: EvidenceClaimDto[] = mcpResult.evidence ?? []

    if (narrative) {
      sections.push(narrative + "\n")
    } else if (quantInterpretation) {
      sections.push(quantInterpretation + "\n")
    }

    if (evidence.length > 0) {
      sections.push("### Key Findings\n")
      for (const e of evidence.slice(0, 5)) {
        sections.push(`- ${e.claim}\n`)
      }
    }
  } else {
    sections.push(generateMockResponse(userQuery, []))
  }

  return sections.join("")
}