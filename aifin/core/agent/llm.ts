import { fetchOpenRouterStream, type OpenRouterMessage } from "@/core/models/providers"

export async function callLLM(
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[],
  referer: string,
  maxTokens = 1024
): Promise<string> {
  const result = await fetchOpenRouterStream(apiKey, {
    model,
    messages,
    referer,
    maxTokens,
  })

  if (!result.ok || !result.response?.body) {
    throw new Error(`LLM call failed: ${result.status} - ${result.errorBody ?? "unknown"}`)
  }

  const reader = result.response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let fullText = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith("data:")) continue

        const dataStr = trimmed.slice(5).trim()
        if (dataStr === "[DONE]") continue

        try {
          const json = JSON.parse(dataStr)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            fullText += content
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullText.trim()
}

export function extractJsonFromLLMOutput(output: string): Record<string, unknown> | null {
  const jsonMatch = output.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>
  } catch {
    return null
  }
}
