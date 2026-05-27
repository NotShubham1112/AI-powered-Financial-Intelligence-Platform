export type AgentMode = "chat" | "auto" | "reason" | "fast" | "deep"

export type Domain =
  | "technology_research"
  | "macroeconomic_analysis"
  | "financial_portfolio_analysis"
  | "startup_analysis"
  | "policy_analysis"
  | "market_intelligence"
  | "scientific_research"
  | "coding"
  | "debugging"
  | "general"

export interface AgentPlan {
  goal: string
  todo: string[]
  domain?: Domain
}

export interface StepResult {
  stepIndex: number
  stepTitle: string
  output: string
}

export interface AgentExecutionState {
  plan: AgentPlan
  stepResults: RoutedStepResult[]
  accumulatedContext: string
}

export interface AgentConfig {
  enabled: boolean
  autoDetect: boolean
  mode: AgentMode
}

export type IntentClassification = {
  mode: AgentMode
  isComplex: boolean
  requiresPlan: boolean
  domain: Domain
  confidence: number
}

// --- Intent Classifier types ---

export interface IntentResult {
  domain: Domain
  confidence: number
  entities: string[]
  requiresFinancialData: boolean
  subTopics: string[]
}

// --- Phase 2: Tool Router types ---

export type RouteType = "mcp" | "skill" | "reasoning"

export interface ToolRoute {
  type: RouteType
  toolOrSkill: string
  params: Record<string, unknown>
  description: string
}

export interface RoutedStepResult {
  stepIndex: number
  stepTitle: string
  route: ToolRoute
  output: string
  rawData?: unknown
}

export interface SkillDefinition {
  name: string
  description: string
  requiredInputs: string[]
  domain: Domain[]
  run: (params: Record<string, unknown>) => SkillResult | Promise<SkillResult>
}

export interface SkillResult {
  success: boolean
  data: Record<string, unknown>
  error?: string
}

export interface McpToolDefinition {
  name: string
  description: string
  paramsSchema: Record<string, string>
}

// --- Reasoning summarizer types ---

export interface ReasoningSummary {
  stage: string
  message: string
  details?: string[]
}

export const AGENT_PLAN_OPEN = "\n[AGENT_PLAN]\n"
export const AGENT_PLAN_CLOSE = "\n[/AGENT_PLAN]\n"
export const STEP_MARKER_PREFIX = "\n[STEP "
export const STEP_MARKER_SUFFIX = "]\n"
export const SYNTHESIS_HEADER = "\n## Synthesis\n"
export const TOOL_TRACE_HEADER = "\n### Tool Execution\n"
