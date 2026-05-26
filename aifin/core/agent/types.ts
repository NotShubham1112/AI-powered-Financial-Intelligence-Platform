export type AgentMode = "chat" | "auto" | "reason" | "fast" | "deep"

export interface AgentPlan {
  goal: string
  todo: string[]
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

export const AGENT_PLAN_OPEN = "\n[AGENT_PLAN]\n"
export const AGENT_PLAN_CLOSE = "\n[/AGENT_PLAN]\n"
export const STEP_MARKER_PREFIX = "\n[STEP "
export const STEP_MARKER_SUFFIX = "]\n"
export const SYNTHESIS_HEADER = "\n## Synthesis\n"
export const TOOL_TRACE_HEADER = "\n### Tool Execution\n"
