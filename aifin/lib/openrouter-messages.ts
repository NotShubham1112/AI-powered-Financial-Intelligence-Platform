import type { ModelMessage } from "ai"

/** Remove data URIs (base64 images, etc.) from text content */
function stripDataUris(text: string): string {
  return text.replace(/data:image\/[^;]+;base64,[^\s)"']+/gi, "[image]")
}

export function toOpenRouterMessages(
  messages: ModelMessage[]
): Array<{ role: string; content: string }> {
  return messages
    .map((m) => ({
      role: m.role,
      content:
        typeof m.content === "string"
          ? stripDataUris(m.content)
          : Array.isArray(m.content)
            ? m.content
                .filter((p) => p.type === "text")
                .map((p) => stripDataUris((p as { text: string }).text))
                .join("\n")
            : "",
    }))
    .filter((m) => m.content.trim().length > 0)
}
