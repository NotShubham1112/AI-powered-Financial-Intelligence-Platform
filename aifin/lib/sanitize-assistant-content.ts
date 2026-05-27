/** Remove internal runtime / failover / routing artifacts from user-visible text */

import { stripMcpMetadata } from "@/lib/mcp-metadata"

// Runtime/system error blocks
const RUNTIME_BLOCK =
  /^>\s*\*\*Runtime\*\*[^\n]*\n*/gm

const SYSTEM_RUNTIME_BLOCK =
  /^>\s*\*\*System:\*\*[^\n]*(?:rate-limit|unavailable|retry|LLM|OpenRouter|demo mode|timeout|empty stream|fallback|error)[^\n]*\n*/gim

// Inline runtime markers
const RUNTIME_INLINE = /\*\*Runtime\*\*\s*\[[\w]+\](?:\s*·\s*`[^`]+`)?(?:\s*·\s*[^\n]+)?/g

// Model reasoning blocks (DeepSeek <think>, etc.)
const THINK_BLOCK = /<think>[\s\S]*?<\/think>/g

// Agent plan blocks (raw internal plan)
const AGENT_PLAN_BLOCK = /\[AGENT_PLAN\][\s\S]*?\[\/AGENT_PLAN\]/g

// Step markers from agent pipeline (e.g., "### Step 1:" with route info)
const STEP_MARKER = /### Step \d+:.*\n/g

// Tool route descriptions (e.g., "> — Route: mcp · market.stock_history")
const ROUTE_LINE = /> — Route: (mcp|skill|reasoning).*\n?/g

// Raw tool execution traces
const TOOL_TRACE_HEADER = /### Tool Execution\n/g

// Skill/MCP error messages that leaked
const SKILL_ERROR = /Skill execution failed:.*/g
const MCP_ERROR = /MCP tool call failed:.*/g
const MCP_UNAVAILABLE = /MCP tool ".*" unavailable or returned no data.*/g

// Execution metadata blocks
const EXEC_META = /Tool:.*Status:.*/g
const CONFIDENCE_LINE = /conf:\s*\d+\.?\d*/g
const RUNTIME_LINE = /Runtime:\s*\d+\.?\d*s/g

// Placeholder / unfilled value patterns that indicate missing data
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

/** Zero-width + private-use markers emitted for client status (stripped before render) */
export const RUNTIME_MARKER_PREFIX = "\u2063RT:"
export const RUNTIME_MARKER_SUFFIX = "\u2063"

export function stripRuntimeMarkers(content: string): string {
  const markerRe = new RegExp(
    `${RUNTIME_MARKER_PREFIX}[^${RUNTIME_MARKER_SUFFIX}]*${RUNTIME_MARKER_SUFFIX}`,
    "g"
  )
  return content.replace(markerRe, "")
}

export function sanitizeAssistantContent(content: string): string {
  let out = content
  out = stripMcpMetadata(out)
  out = stripRuntimeMarkers(out)

  // Strip all known internal artifacts
  out = out.replace(RUNTIME_BLOCK, "")
  out = out.replace(SYSTEM_RUNTIME_BLOCK, "")
  out = out.replace(RUNTIME_INLINE, "")
  out = out.replace(THINK_BLOCK, "")
  out = out.replace(AGENT_PLAN_BLOCK, "")
  out = out.replace(STEP_MARKER, "")
  out = out.replace(ROUTE_LINE, "")
  out = out.replace(TOOL_TRACE_HEADER, "")
  out = out.replace(SKILL_ERROR, "")
  out = out.replace(MCP_ERROR, "")
  out = out.replace(MCP_UNAVAILABLE, "")
  out = out.replace(EXEC_META, "")
  out = out.replace(CONFIDENCE_LINE, "")
  out = out.replace(RUNTIME_LINE, "")

  // Strip placeholder / unfilled values
  for (const pattern of PLACEHOLDER_PATTERNS) {
    out = out.replace(pattern, "")
  }

  out = out.replace(/\n{4,}/g, "\n\n\n")

  return out.trim()
}

/** Parse hidden runtime markers for status bar (not shown in message body) */
export function parseRuntimeMarkers(content: string): {
  stage: string
  model: string | null
  fallbackCount: number
} | null {
  const markerRe = new RegExp(
    `${RUNTIME_MARKER_PREFIX}([^${RUNTIME_MARKER_SUFFIX}]+)${RUNTIME_MARKER_SUFFIX}`,
    "g"
  )
  const matches = [...content.matchAll(markerRe)]
  if (!matches.length) return null
  const last = matches[matches.length - 1][1]
  const [stage, model] = last.split("|")
  const fallbackCount = matches.filter((m) => m[1].startsWith("fallback")).length
  return { stage, model: model || null, fallbackCount }
}

export function encodeRuntimeMarker(
  stage: string,
  model?: string,
  detail?: string
): string {
  const payload = [stage, model ?? "", detail ?? ""].join("|")
  return `${RUNTIME_MARKER_PREFIX}${payload}${RUNTIME_MARKER_SUFFIX}`
}