/** AI SDK data-stream helpers for /api/chat */

import { generateId, type UIMessageStreamWriter } from "ai"

export function encodeTextChunk(text: string): string {
  return `0:${JSON.stringify(text)}\n`
}

export function encodeFinishEvent(): string {
  return `e:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`
}

export async function streamTextChunks(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  text: string,
  chunkSize = 32,
  delayMs = 6
) {
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize)
    controller.enqueue(encoder.encode(encodeTextChunk(chunk)))
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}

const STREAM_IDLE_MS = 40_000
const STREAM_MAX_MS = 120_000

function readWithIdleTimeout(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  idleMs: number
): Promise<ReadableStreamReadResult<Uint8Array>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reader.cancel("idle_timeout").catch(() => {})
      reject(new Error("stream_idle_timeout"))
    }, idleMs)

    reader
      .read()
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export function createOpenRouterStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  options?: { onEmpty?: () => string }
) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const fallbackOnEmpty =
    options?.onEmpty ??
    (() =>
      "> **System:** The model stream ended without content (rate limits or upstream delay). Retry in a minute or switch models.\n\n")

  return new ReadableStream({
    async start(controller) {
      let buffer = ""
      let hasStartedText = false
      let reasoningBuffer = ""
      const startedAt = Date.now()

      const emitFallback = (reason: string) => {
        if (!hasStartedText) {
          console.warn("OpenRouter stream fallback:", reason)
          controller.enqueue(encoder.encode(encodeTextChunk(fallbackOnEmpty())))
          hasStartedText = true
        }
      }

      try {
        while (Date.now() - startedAt < STREAM_MAX_MS) {
          let result: ReadableStreamReadResult<Uint8Array>
          try {
            result = await readWithIdleTimeout(reader, STREAM_IDLE_MS)
          } catch (e) {
            const msg = e instanceof Error ? e.message : "stream_error"
            console.warn("OpenRouter stream interrupted:", msg)
            emitFallback(msg)
            break
          }

          const { done, value } = result
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
              const delta = json.choices?.[0]?.delta

              if (delta?.reasoning) {
                reasoningBuffer += delta.reasoning
              }

              const text = delta?.content
              if (text) {
                if (!hasStartedText && reasoningBuffer) {
                  const reasoningBlock = `<details>\n<summary>Reasoning trace</summary>\n\n${reasoningBuffer.trim()}\n\n</details>\n\n`
                  controller.enqueue(encoder.encode(encodeTextChunk(reasoningBlock)))
                  reasoningBuffer = ""
                }
                hasStartedText = true
                controller.enqueue(encoder.encode(encodeTextChunk(text)))
              }
            } catch {
              // partial SSE chunk
            }
          }
        }

        if (Date.now() - startedAt >= STREAM_MAX_MS) {
          console.warn("OpenRouter stream max duration exceeded")
          emitFallback("stream_max_duration")
        }

        if (!hasStartedText && reasoningBuffer) {
          controller.enqueue(encoder.encode(encodeTextChunk(reasoningBuffer)))
          hasStartedText = true
        }

        if (!hasStartedText) {
          emitFallback("empty_stream")
        }
      } catch (error) {
        console.error("Streaming error:", error)
        emitFallback("stream_error")
      } finally {
        try {
          controller.enqueue(encoder.encode(encodeFinishEvent()))
        } catch {
          // already closed
        }
        controller.close()
      }
    },
  })
}

const OPENROUTER_IDLE_MS = 30_000
const OPENROUTER_MAX_MS = 120_000

/** Pipe an OpenRouter SSE body into AI SDK UIMessage stream events */
export async function pipeOpenRouterToUIMessageWriter(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  writer: UIMessageStreamWriter,
  options?: { onFirstToken?: (kind: "reasoning" | "text") => void }
) {
  const decoder = new TextDecoder()
  const textId = generateId()
  const reasoningId = generateId()
  let buffer = ""
  let reasoningStarted = false
  let textStarted = false
  let hasContent = false
  const startedAt = Date.now()

  writer.write({ type: "text-start", id: textId })

  const emitStatus = (message: string) => {
    writer.write({
      type: "text-delta",
      id: textId,
      delta: message,
    })
    hasContent = true
  }

  try {
    while (Date.now() - startedAt < OPENROUTER_MAX_MS) {
      let result: ReadableStreamReadResult<Uint8Array>
      try {
        result = await readWithIdleTimeout(reader, OPENROUTER_IDLE_MS)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream_error"
        console.warn("OpenRouter UIMessage stream idle:", msg)
        if (!hasContent) {
          emitStatus(
            "> **System:** Model stream timed out (upstream delay or rate limit). Retry or switch models.\n\n"
          )
        }
        break
      }

      const { done, value } = result
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
          const delta = json.choices?.[0]?.delta

          if (delta?.reasoning) {
            if (!reasoningStarted) {
              writer.write({ type: "reasoning-start", id: reasoningId })
              reasoningStarted = true
              options?.onFirstToken?.("reasoning")
            }
            writer.write({
              type: "reasoning-delta",
              id: reasoningId,
              delta: delta.reasoning as string,
            })
            hasContent = true
          }

          const text = delta?.content
          if (text) {
            if (!textStarted) {
              textStarted = true
              options?.onFirstToken?.("text")
            }
            writer.write({ type: "text-delta", id: textId, delta: text })
            hasContent = true
          }
        } catch {
          // partial SSE chunk
        }
      }
    }

    if (reasoningStarted) {
      writer.write({ type: "reasoning-end", id: reasoningId })
    }

    if (!hasContent) {
      emitStatus(
        "> **System:** No content returned from the model. Try again or pick another model.\n\n"
      )
    }
  } catch (error) {
    console.error("OpenRouter UIMessage pipe error:", error)
    if (!hasContent) {
      emitStatus("> **System:** Streaming failed. Local demo mode may be available on retry.\n\n")
    }
  } finally {
    writer.write({ type: "text-end", id: textId })
  }
}
