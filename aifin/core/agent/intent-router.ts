import type { AgentMode, IntentClassification } from "./types"

const COMPLEX_TRIGGERS = [
  "analyze",
  "build",
  "portfolio",
  "strategy",
  "compare",
  "versus",
  "vs ",
  "recommend",
  "optimize",
  "evaluate",
  "forecast",
  "project",
  "scenario",
  "allocation",
  "diversif",
  "rebalance",
  "risk assessment",
  "deep dive",
  "research",
  "report",
]

const MULTI_ENTITY_PATTERN = /\b(?:and|vs|versus|compare|both)\b.*\b(?:stock|etf|fund|sector)\b/i
const TIME_SERIES_PATTERN = /\b(?:trend|historical|performance|returns? over|yoy|qoq|trailing)\b/i
const FINANCIAL_DECISION_PATTERN = /\b(?:should I|best|optimal|which|recommend|worth)\b.*\b(?:invest|buy|sell|hold|allocate)\b/i

export function classifyIntent(text: string, agentEnabled: boolean): IntentClassification {
  const trimmed = text.trim().toLowerCase()

  if (!trimmed) {
    return { mode: "chat", isComplex: false, requiresPlan: false }
  }

  if (trimmed.startsWith("/chat ")) {
    return { mode: "chat", isComplex: false, requiresPlan: false }
  }
  if (trimmed.startsWith("/reason ")) {
    return { mode: "reason", isComplex: true, requiresPlan: true }
  }
  if (trimmed.startsWith("/fast ")) {
    return { mode: "fast", isComplex: true, requiresPlan: false }
  }
  if (trimmed.startsWith("/deep ")) {
    return { mode: "deep", isComplex: true, requiresPlan: true }
  }

  if (!agentEnabled) {
    return { mode: "chat", isComplex: false, requiresPlan: false }
  }

  const hasComplexTrigger = COMPLEX_TRIGGERS.some((t) => trimmed.includes(t))
  const hasMultiEntity = MULTI_ENTITY_PATTERN.test(trimmed)
  const hasTimeSeries = TIME_SERIES_PATTERN.test(trimmed)
  const hasDecision = FINANCIAL_DECISION_PATTERN.test(trimmed)
  const isLongQuery = trimmed.split(/\s+/).length > 30
  const hasMultipleQuestions = (trimmed.match(/\?/g) || []).length > 1

  const complexityScore = [
    hasComplexTrigger,
    hasMultiEntity,
    hasTimeSeries,
    hasDecision,
    isLongQuery,
    hasMultipleQuestions,
  ].filter(Boolean).length

  if (complexityScore >= 2) {
    return { mode: "auto", isComplex: true, requiresPlan: true }
  }

  if (complexityScore === 1) {
    return { mode: "auto", isComplex: true, requiresPlan: false }
  }

  return { mode: "auto", isComplex: false, requiresPlan: false }
}

export function shouldUseAgentPipeline(classification: IntentClassification): boolean {
  return classification.mode !== "chat" && classification.isComplex
}

export function stripCommandPrefix(text: string): string {
  return text.replace(/^\/(chat|reason|fast|deep)\s+/, "").trim()
}
