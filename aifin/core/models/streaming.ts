import { generateId, type UIMessageStreamWriter } from "ai"
import { getTimeoutProfile } from "./config"
import { providerHealth } from "./health"
import { modelLatency } from "./latency"

export type RuntimeStage =
  | "connecting"
  | "routing"
  | "streaming"
  | "fallback"
  | "heartbeat"
  | "deep_synthesis"
  | "deterministic"
  | "complete"
  | "error"
  // Agent pipeline stages
  | "agent_planning"
  | "agent_executing"
  | "agent_step_complete"
  | "agent_synthesizing"

export type StreamCallbacks = {
  onStage?: (stage: RuntimeStage, detail?: string) => void
  onModelSwitch?: (from: string | null, to: string) => void
  onFirstToken?: (kind: "reasoning" | "text") => void
  onHeartbeat?: () => void
}

function readWithIdleTimeout(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  idleMs: number,
  signal?: AbortSignal
): Promise<ReadableStreamReadResult<Uint8Array>> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("aborted"))
      return
    }
    const timer = setTimeout(() => {
      reader.cancel("idle_timeout").catch(() => {})
      reject(new Error("stream_idle_timeout"))
    }, idleMs)

    const onAbort = () => {
      clearTimeout(timer)
      reader.cancel("aborted").catch(() => {})
      reject(new Error("aborted"))
    }
    signal?.addEventListener("abort", onAbort, { once: true })

    reader
      .read()
      .then((result) => {
        clearTimeout(timer)
        signal?.removeEventListener("abort", onAbort)
        resolve(result)
      })
      .catch((err) => {
        clearTimeout(timer)
        signal?.removeEventListener("abort", onAbort)
        reject(err)
      })
  })
}

export type StreamPipeResult = {
  text: string
  reasoning: string
  hadContent: boolean
  failed: boolean
  failReason?: string
}

/** Pipe OpenRouter SSE into UIMessage writer with heartbeat + partial preservation */
export async function pipeProviderStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  writer: UIMessageStreamWriter,
  options: {
    modelId: string
    textId: string
    reasoningId: string
    partialPrefix?: string
    signal?: AbortSignal
  } & StreamCallbacks
): Promise<StreamPipeResult> {
  const profile = getTimeoutProfile(options.modelId)
  const decoder = new TextDecoder()
  let buffer = ""
  let reasoningStarted = false
  let textStarted = false
  let text = options.partialPrefix
    ? options.partialPrefix.replace(/\u2063RT:[^\u2063]*\u2063/g, "").trim()
    : ""
  let reasoning = ""
  let hasContent = Boolean(text.length)
  const startedAt = Date.now()
  let lastActivity = Date.now()

  if (text.length) {
    writer.write({ type: "text-delta", id: options.textId, delta: text })
    textStarted = true
  }

  const heartbeat = setInterval(() => {
    if (Date.now() - lastActivity < profile.heartbeatMs) return
    options.onHeartbeat?.()
    options.onStage?.("heartbeat", "thinking")
    if (!hasContent) {
      writer.write({
        type: "text-delta",
        id: options.textId,
        delta: "",
      })
    }
  }, profile.heartbeatMs)

  try {
    while (Date.now() - startedAt < profile.streamMaxMs) {
      if (options.signal?.aborted) break

      let result: ReadableStreamReadResult<Uint8Array>
      try {
        result = await readWithIdleTimeout(reader, profile.streamIdleMs, options.signal)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream_error"
        providerHealth.recordStreamFailure(options.modelId)
        return {
          text,
          reasoning,
          hadContent: hasContent,
          failed: true,
          failReason: msg,
        }
      }

      const { done, value } = result
      if (done) break

      lastActivity = Date.now()
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
              writer.write({ type: "reasoning-start", id: options.reasoningId })
              reasoningStarted = true
              options.onFirstToken?.("reasoning")
            }
            const chunk = delta.reasoning as string
            reasoning += chunk
            writer.write({
              type: "reasoning-delta",
              id: options.reasoningId,
              delta: chunk,
            })
            hasContent = true
          }

          const content = delta?.content
          if (content) {
            if (!textStarted) {
              textStarted = true
              options.onFirstToken?.("text")
            }
            text += content
            writer.write({ type: "text-delta", id: options.textId, delta: content })
            hasContent = true
          }
        } catch {
          providerHealth.recordMalformed(options.modelId)
        }
      }
    }

    if (!hasContent) {
      providerHealth.recordStreamFailure(options.modelId)
      return { text, reasoning, hadContent: false, failed: true, failReason: "empty_stream" }
    }

    return { text, reasoning, hadContent: true, failed: false }
  } finally {
    clearInterval(heartbeat)
    if (reasoningStarted) {
      writer.write({ type: "reasoning-end", id: options.reasoningId })
    }
  }
}

export function createStreamIds() {
  return { textId: generateId(), reasoningId: generateId() }
}

/** Streaming manager — status via invisible markers (see sanitize-assistant-content) */
export class StreamingModelManager {
  emitStage(
    _writer: UIMessageStreamWriter,
    _textId: string,
    _stage: RuntimeStage,
    _detail?: string
  ) {
    /* no-op: runtime status is emitted via encodeRuntimeMarker in runtime.ts */
  }
}

export const streamingManager = new StreamingModelManager()
