/** Remove internal runtime / failover logs from user-visible assistant text */

import { stripMcpMetadata } from "@/lib/mcp-metadata"

const RUNTIME_BLOCK =
  /^>\s*\*\*Runtime\*\*[^\n]*\n*/gm

const SYSTEM_RUNTIME_BLOCK =
  /^>\s*\*\*System:\*\*[^\n]*(?:rate-limit|unavailable|retry|LLM|OpenRouter|demo mode)[^\n]*\n*/gim

const RUNTIME_INLINE = /\*\*Runtime\*\*\s*\[[\w]+\](?:\s*·\s*`[^`]+`)?(?:\s*·\s*[^\n]+)?/g

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
  out = out.replace(RUNTIME_BLOCK, "")
  out = out.replace(SYSTEM_RUNTIME_BLOCK, "")
  out = out.replace(RUNTIME_INLINE, "")
  out = out.replace(/\n{3,}/g, "\n\n")
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
