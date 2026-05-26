const DEFAULT_MCP_URL = "http://127.0.0.1:8000"

export type McpHealth = {
  ok: boolean
  version?: string
  error?: string
}

export type EvidenceClaimDto = {
  claim_id: string
  claim: string
  source: string
  confidence: number
  freshness_days: number
  tool_name: string
  verified?: boolean
}

export type LiveSignalDto = {
  label: string
  direction: string
  detail: string
  source_tool: string
}

export type McpDebateDto = {
  bull_thesis?: Array<{ agent: string; thesis: string; confidence: number }>
  risk_thesis?: Array<{ agent: string; thesis: string; confidence: number }>
  reconciliation?: string
  adjusted_confidence?: number
  resolution?: string
  agents_participated?: string[]
}

export type ExecutionMetadataDto = {
  tools_used?: string[]
  agents_participated?: string[]
  workflow_runtime_ms?: number
  confidence?: number
  contradiction_score?: number
  resolution?: string
}

export type McpSynthesis = {
  tool_summaries?: Array<{ tool: string; summary: unknown; latency_ms?: number }>
  quant_interpretation?: string
  probabilistic_scenarios?: {
    probability_weights?: Record<string, number>
    expected_return_pct?: number
    confidence_interval_90?: [number, number]
    downside_var_95_pct?: number
  }
  market_narrative?: Record<string, string>
  evidence?: EvidenceClaimDto[]
  debate?: McpDebateDto
  live_signals?: LiveSignalDto[]
  execution_metadata?: ExecutionMetadataDto
}

export type McpAgentRunResult = {
  run_id: string
  status: string
  validation?: Record<string, unknown>
  synthesis?: McpSynthesis
  evidence?: EvidenceClaimDto[]
  debate?: McpDebateDto
  live_signals?: LiveSignalDto[]
  execution_metadata?: ExecutionMetadataDto
  tools?: string[]
}

export function getMcpBaseUrl(): string {
  return process.env.FINANCIAL_MCP_URL ?? DEFAULT_MCP_URL
}

export async function checkMcpHealth(): Promise<McpHealth> {
  const base = getMcpBaseUrl()
  try {
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` }
    }
    const data = (await res.json()) as { status?: string; version?: string }
    return { ok: data.status === "ok", version: data.version }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unreachable" }
  }
}

export type McpRunOptions = {
  parallel?: boolean
  max_steps?: number
  skill?: string
  inputs_by_tool?: Record<string, Record<string, unknown>>
}

export async function runMcpAgent(
  query: string,
  options?: McpRunOptions
): Promise<McpAgentRunResult | null> {
  const base = getMcpBaseUrl()
  try {
    const res = await fetch(`${base}/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        parallel: options?.parallel ?? true,
        max_steps: options?.max_steps ?? 3,
        skill: options?.skill,
        inputs_by_tool: options?.inputs_by_tool,
      }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    return (await res.json()) as McpAgentRunResult
  } catch {
    return null
  }
}

/** Route equity research / earnings queries to equity_research skill */
export function resolveMcpRunOptions(query: string): McpRunOptions {
  const q = query.toLowerCase()
  const equityTriggers = [
    "/earnings",
    "equity research",
    "investment thesis",
    "valuation",
    "nvda",
    "nvidia",
    "aapl",
    "msft",
    "tsla",
    "stock analysis",
  ]
  if (equityTriggers.some((t) => q.includes(t))) {
    return { skill: "equity_research", parallel: true, max_steps: 3 }
  }
  if (q.includes("/macro") || q.includes("yield curve") || q.includes("recession")) {
    return { skill: "macro_regime_detection", parallel: true, max_steps: 3 }
  }
  return { parallel: true, max_steps: 3 }
}

export function formatMcpContext(result: McpAgentRunResult): string {
  const syn = result.synthesis
  const evidence = result.evidence ?? syn?.evidence ?? []
  const debate = result.debate ?? syn?.debate
  const liveSignals = result.live_signals ?? syn?.live_signals ?? []
  const exec = result.execution_metadata ?? syn?.execution_metadata
  const tools = result.tools?.length ? result.tools.join(", ") : "none"
  const validation = result.validation as {
    confidence?: number
    flags?: string[]
    contradictions?: string[]
  } | undefined

  const evidenceBlock = evidence.length
    ? evidence
        .map(
          (e) =>
            `- **${e.claim}** · source: ${e.source} · conf: ${e.confidence} · fresh: ${e.freshness_days}d`
        )
        .join("\n")
    : ""

  const debateBlock = debate?.reconciliation
    ? `**Debate reconciliation:** ${debate.reconciliation}`
    : ""

  const signalsBlock = liveSignals.length
    ? liveSignals.map((s) => `- ${s.label} [${s.direction}] — ${s.detail}`).join("\n")
    : ""

  const quantBlock = syn?.quant_interpretation ?? ""
  const scenarios = syn?.probabilistic_scenarios
  const scenarioBlock = scenarios
    ? `Expected return: ${scenarios.expected_return_pct}% · weights: ${JSON.stringify(scenarios.probability_weights)} · VaR95: ${scenarios.downside_var_95_pct}%`
    : ""

  return [
    "## MCP Engine Results (deterministic — cite these numbers only)",
    `**Run:** ${result.run_id} · **Status:** ${result.status} · **Tools:** ${tools}`,
    exec?.workflow_runtime_ms != null
      ? `**Runtime:** ${(exec.workflow_runtime_ms / 1000).toFixed(1)}s · **Agents:** ${exec.agents_participated?.join(", ") ?? "—"}`
      : "",
    validation?.confidence != null ? `**Confidence:** ${validation.confidence}` : "",
    debate?.adjusted_confidence != null
      ? `**Post-debate confidence:** ${debate.adjusted_confidence}`
      : "",
    validation?.contradictions?.length
      ? `**Contradictions:** ${validation.contradictions.join("; ")}`
      : "",
    quantBlock ? `\n### Quant interpretation\n${quantBlock}` : "",
    scenarioBlock ? `\n### Probabilistic scenarios\n${scenarioBlock}` : "",
    signalsBlock ? `\n### LIVE SIGNALS\n${signalsBlock}` : "",
    evidenceBlock ? `\n### Evidence-bound claims (required citations)\n${evidenceBlock}` : "",
    debateBlock ? `\n### Cross-agent debate\n${debateBlock}` : "",
    syn?.tool_summaries?.length
      ? `\n### Tool outputs\n${syn.tool_summaries.map((s) => `- **${s.tool}**: ${JSON.stringify(s.summary)}`).join("\n")}`
      : "",
    "\n**RULE:** Do NOT invent market share, developer counts, or efficiency multiples. Use only evidence-bound claims above or clearly label as [Unverified].",
  ]
    .filter(Boolean)
    .join("\n")
}

/** Heuristic: route to MCP when query looks financial-engine related */
export function shouldInvokeMcp(text: string): boolean {
  const q = text.toLowerCase()
  const triggers = [
    "/earnings",
    "/risk",
    "/macro",
    "/portfolio",
    "equity research",
    "investment thesis",
    "yield curve",
    "rsi",
    "macd",
    "dcf",
    "merton",
    "credit spread",
    "taylor rule",
    "black-scholes",
    "inflation",
    "nvda",
    "nvidia",
    "aapl",
    "msft",
    "valuation",
    "stock analysis",
  ]
  return triggers.some((t) => q.includes(t))
}
