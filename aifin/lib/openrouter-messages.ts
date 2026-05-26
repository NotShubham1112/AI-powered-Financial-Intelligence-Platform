import type { ModelMessage } from "ai"

export function toOpenRouterMessages(
  messages: ModelMessage[]
): Array<{ role: string; content: string }> {
  return messages
    .map((m) => ({
      role: m.role,
      content:
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? m.content
                .filter((p) => p.type === "text")
                .map((p) => (p as { text: string }).text)
                .join("\n")
            : "",
    }))
    .filter((m) => m.content.trim().length > 0)
}
