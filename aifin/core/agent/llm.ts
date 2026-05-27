import { fetchProviderStream, type OpenRouterMessage } from "@/core/models/providers"
import { fallbackChain } from "@/core/models/fallbacks"

export async function callLLM(
  _apiKey: string,
  model: string,
  messages: OpenRouterMessage[],
  referer: string,
  maxTokens = 1024
): Promise<string> {
  const chain = fallbackChain.buildChain(model, "fast")

  for (const m of chain) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let result
      try {
        result = await fetchProviderStream({ model: m, messages, referer, maxTokens })
      } catch (e) {
        break
      }

      if (result.ok && result.response?.body) {
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
                if (content) fullText += content
              } catch {
                // skip malformed chunks
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        if (fullText.trim()) return fullText.trim()
        break
      }

      if (result?.status === 429 && result?.retryAfterMs) {
        const wait = Math.min(result.retryAfterMs + 500, 15_000)
        await new Promise((r) => setTimeout(r, wait))
      } else {
        break
      }
    }
  }

  console.error("callLLM: all models in chain failed")
  throw new Error("LLM call failed")
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
