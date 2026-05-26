import type { McpAgentRunResult } from "@/lib/mcp-client"
import type {
  EvidenceClaim,
  ExecutionMeta,
  LiveSignal,
  McpDebate,
  ToolTrace,
} from "@/stores/chat-store"

export function mcpResultToMessageMeta(result: McpAgentRunResult) {
  const exec = result.execution_metadata ?? result.synthesis?.execution_metadata
  const evidenceRaw = result.evidence ?? result.synthesis?.evidence ?? []
  const debateRaw = result.debate ?? result.synthesis?.debate
  const signalsRaw = result.live_signals ?? result.synthesis?.live_signals ?? []

  const executionMeta: ExecutionMeta | undefined = exec
    ? {
        runId: result.run_id,
        toolsUsed: exec.tools_used ?? result.tools ?? [],
        agentsParticipated: exec.agents_participated ?? [],
        workflowRuntimeMs: exec.workflow_runtime_ms ?? 0,
        confidence: exec.confidence ?? 0,
        contradictionScore: exec.contradiction_score,
        resolution: exec.resolution,
      }
    : result.run_id
      ? {
          runId: result.run_id,
          toolsUsed: result.tools ?? [],
          agentsParticipated: [],
          workflowRuntimeMs: 0,
          confidence: 0,
        }
      : undefined

  const evidence: EvidenceClaim[] = evidenceRaw.map((e) => ({
    claimId: e.claim_id,
    claim: e.claim,
    source: e.source,
    confidence: e.confidence,
    freshnessDays: e.freshness_days,
    toolName: e.tool_name,
    verified: e.verified,
  }))

  const liveSignals: LiveSignal[] = signalsRaw.map((s) => ({
    label: s.label,
    direction: s.direction,
    detail: s.detail,
    sourceTool: s.source_tool,
  }))

  const debate: McpDebate | undefined = debateRaw
    ? {
        reconciliation: debateRaw.reconciliation,
        adjustedConfidence: debateRaw.adjusted_confidence,
        resolution: debateRaw.resolution,
        bullThesis: debateRaw.bull_thesis,
        riskThesis: debateRaw.risk_thesis,
      }
    : undefined

  const toolTraces: ToolTrace[] = (result.tools ?? []).map((tool, i) => ({
    id: `${result.run_id}-${i}`,
    toolName: tool,
    status: "complete" as const,
    message: result.status === "success" ? "engine ok" : result.status,
  }))

  return { executionMeta, evidence, liveSignals, debate, toolTraces }
}
