/** Hidden stream markers for MCP execution intelligence (stripped before render) */

import type { EvidenceClaim, ExecutionMeta, LiveSignal, McpDebate } from "@/stores/chat-store"

export const MCP_META_PREFIX = "\u2063MCP:"
export const MCP_META_SUFFIX = "\u2063"

export function encodeMcpMetadata(meta: {
  runId: string
  executionMeta?: ExecutionMeta
  evidence?: EvidenceClaim[]
  liveSignals?: LiveSignal[]
  debate?: McpDebate
  toolTraces?: Array<{ id: string; toolName: string; status: "complete"; message: string }>
}): string {
  const payload = JSON.stringify(meta)
  return `${MCP_META_PREFIX}${payload}${MCP_META_SUFFIX}`
}

export function stripMcpMetadata(content: string): string {
  const re = new RegExp(
    `${MCP_META_PREFIX}[^${MCP_META_SUFFIX}]*${MCP_META_SUFFIX}`,
    "g"
  )
  return content.replace(re, "")
}

export function parseMcpMetadata(content: string): {
  runId: string
  executionMeta?: ExecutionMeta
  evidence?: EvidenceClaim[]
  liveSignals?: LiveSignal[]
  debate?: McpDebate
  toolTraces?: Array<{ id: string; toolName: string; status: "complete"; message: string }>
} | null {
  const re = new RegExp(
    `${MCP_META_PREFIX}([^${MCP_META_SUFFIX}]+)${MCP_META_SUFFIX}`
  )
  const match = content.match(re)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as ReturnType<typeof parseMcpMetadata>
  } catch {
    return null
  }
}
