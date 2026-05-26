import type { UIMessage } from "ai"

export function extractUserContent(messages: unknown[]): string {
  const last = messages[messages.length - 1] as Record<string, unknown> | undefined
  if (!last) return ""

  if (Array.isArray(last.parts)) {
    return (last.parts as Array<{ type?: string; text?: string }>)
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text!)
      .join("\n")
  }

  if (typeof last.content === "string") return last.content
  if (Array.isArray(last.content)) {
    return (last.content as Array<{ type?: string; text?: string }>)
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!)
      .join("\n")
  }

  return ""
}

export function filterValidUIMessages(messages: unknown[]): UIMessage[] {
  return messages
    .filter((m): m is UIMessage => {
      if (!m || typeof m !== "object") return false
      const msg = m as UIMessage
      if (msg.role !== "user" && msg.role !== "assistant" && msg.role !== "system") {
        return false
      }
      if (Array.isArray(msg.parts)) {
        return msg.parts.some(
          (p) => p.type === "text" && "text" in p && String(p.text).trim().length > 0
        )
      }
      return false
    })
    .map((m) => ({
      id: m.id ?? crypto.randomUUID(),
      role: m.role,
      parts: m.parts.filter((p) => p.type === "text"),
    })) as UIMessage[]
}
