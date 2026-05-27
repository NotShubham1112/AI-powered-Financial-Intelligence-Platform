import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai"
import { generateMockResponse } from "@/app/api/chat/mock"
import type { McpAgentRunResult } from "@/lib/mcp-client"
import { cacheKey, responseCache } from "./cache"
import { providerHealth } from "./health"
import { modelLatency } from "./latency"
import { modelRouter } from "./router"
import { withConcurrencyLimit, getQueueMetrics } from "./queue"
import {
  fetchProviderStream,
  isRetryableError,
  sleepWithJitter,
  type OpenRouterMessage,
} from "./providers"
import { createStreamIds, pipeProviderStream, type RuntimeStage } from "./streaming"
import { buildDeterministicResponse } from "./deterministic"
import { DEFAULT_INTERACTIVE_MODEL } from "./config"
import { encodeMcpMetadata } from "@/lib/mcp-metadata"
import { mcpResultToMessageMeta } from "@/lib/mcp-to-message-meta"
import {
  encodeRuntimeMarker,
  sanitizeAssistantContent,
} from "@/lib/sanitize-assistant-content"

export type RuntimeMetrics = {
  failoverCount: number
  retryCount: number
  lastModel: string | null
  stages: RuntimeStage[]
  providerHealth: ReturnType<typeof providerHealth.toMetrics>
  latency: ReturnType<typeof modelLatency.toMetrics>
  queue: ReturnType<typeof getQueueMetrics>
}

const metrics: RuntimeMetrics = {
  failoverCount: 0,
  retryCount: 0,
  lastModel: null,
  stages: [],
  providerHealth: {},
  latency: {},
  queue: { activeGlobal: 0, queueDepth: 0, activePerModel: {} },
}

function recordStage(stage: RuntimeStage) {
  metrics.stages.push(stage)
  if (metrics.stages.length > 100) metrics.stages.shift()
}

export function getRuntimeMetrics(): RuntimeMetrics {
  return {
    ...metrics,
    providerHealth: providerHealth.toMetrics(),
    latency: modelLatency.toMetrics(),
    queue: getQueueMetrics(),
  }
}

export type InferenceRequest = {
  apiKey: string
  referer: string
  model: string
  messages: OpenRouterMessage[]
  userQuery: string
  uiMessages: UIMessage[]
  mcpResult: McpAgentRunResult | null
}

async function streamTextDeltas(
  writer: UIMessageStreamWriter,
  textId: string,
  text: string,
  chunkSize = 48
) {
  const clean = sanitizeAssistantContent(text)
  for (let i = 0; i < clean.length; i += chunkSize) {
    writer.write({ type: "text-delta", id: textId, delta: clean.slice(i, i + chunkSize) })
    await new Promise((r) => setTimeout(r, 6))
  }
}

function emitRuntimeMarker(
  writer: UIMessageStreamWriter,
  textId: string,
  stage: RuntimeStage,
  model?: string,
  detail?: string
) {
  writer.write({
    type: "text-delta",
    id: textId,
    delta: encodeRuntimeMarker(stage, model, detail),
  })
}

/** Fault-tolerant multi-model inference runtime */
export class FaultTolerantInferenceRuntime {
  async createStreamResponse(req: InferenceRequest): Promise<Response> {
    const stream = createUIMessageStream({
      originalMessages: req.uiMessages,
      execute: async ({ writer }) => {
        await this.executeWithFailover(req, writer)
      },
    })
    return createUIMessageStreamResponse({ stream })
  }

  private async executeWithFailover(
    req: InferenceRequest,
    writer: UIMessageStreamWriter
  ): Promise<void> {
    const { textId, reasoningId } = createStreamIds()
    writer.write({ type: "text-start", id: textId })

    if (req.mcpResult) {
      const meta = mcpResultToMessageMeta(req.mcpResult)
      writer.write({
        type: "text-delta",
        id: textId,
        delta: encodeMcpMetadata({
          runId: req.mcpResult.run_id,
          ...meta,
          toolTraces: meta.toolTraces as Array<{ id: string; toolName: string; status: "complete"; message: string }>,
        }),
      })
    }

    const decision = modelRouter.route(req.model, req.userQuery, "interactive")
    const chain = decision.chain
    recordStage("routing")
    emitRuntimeMarker(writer, textId, "routing", chain[0], `chain=${chain.length}`)

    const cacheKeyStr = cacheKey([
      "chat",
      chain[0],
      req.userQuery.slice(0, 200),
      String(req.messages.length),
    ])
    const cached = await responseCache.get<string>(cacheKeyStr)
    if (cached) {
      recordStage("complete")
      emitRuntimeMarker(writer, textId, "complete", chain[0], "cache_hit")
      await streamTextDeltas(writer, textId, cached)
      writer.write({ type: "text-end", id: textId })
      return
    }

    let accumulated = ""
    let lastModel: string | null = null
    const startedAt = Date.now()

    for (let i = 0; i < chain.length; i++) {
      const modelId = chain[i]
      lastModel = modelId
      metrics.lastModel = modelId

      if (i > 0) {
        metrics.failoverCount++
        recordStage("fallback")
        emitRuntimeMarker(writer, textId, "fallback", modelId, `${i + 1}/${chain.length}`)
      }

      recordStage("connecting")
      emitRuntimeMarker(writer, textId, "connecting", modelId)

      const result = await withConcurrencyLimit(modelId, () =>
        fetchProviderStream({
          model: modelId,
          messages: req.messages,
          referer: req.referer,
        })
      )

      if (!result.ok || !result.response?.body) {
        metrics.retryCount++
        if (result.retryAfterMs) await sleepWithJitter(result.retryAfterMs, i)
        if (!isRetryableError(result.status, result.errorBody)) continue
        continue
      }

      const reader = result.response.body.getReader()
      const abort = new AbortController()
      recordStage("streaming")

      const pipeResult = await pipeProviderStream(reader, writer, {
        modelId,
        textId,
        reasoningId,
        partialPrefix: accumulated,
        signal: abort.signal,
        onStage: recordStage,
        onModelSwitch: (_, to) => {
          metrics.lastModel = to
        },
        onFirstToken: () => {
          const ttft = Date.now() - startedAt
          modelLatency.record(modelId, ttft, ttft)
          providerHealth.recordSuccess(modelId, ttft)
        },
      })

      if (!pipeResult.failed && pipeResult.hadContent) {
        accumulated = sanitizeAssistantContent(pipeResult.text)
        modelLatency.record(modelId, Date.now() - startedAt, Date.now() - startedAt)
        recordStage("complete")
        emitRuntimeMarker(writer, textId, "complete", modelId)

        if (decision.backgroundModel && req.userQuery.length > 200) {
          await this.appendBackgroundSynthesis(req, writer, textId, accumulated, decision.backgroundModel)
        }

        await responseCache.set(cacheKeyStr, accumulated, 1800)
        writer.write({ type: "text-end", id: textId })
        return
      }

      accumulated = sanitizeAssistantContent(pipeResult.text || accumulated)
      abort.abort()
      providerHealth.recordStreamFailure(modelId)
      metrics.retryCount++
      if (result.retryAfterMs) await sleepWithJitter(result.retryAfterMs, i)
    }

    recordStage("deterministic")
    emitRuntimeMarker(writer, textId, "deterministic", lastModel ?? DEFAULT_INTERACTIVE_MODEL)
    const fallbackText = buildDeterministicResponse(req.userQuery, req.mcpResult)
    const finalBody = accumulated
      ? `${accumulated}\n\n${fallbackText}`
      : fallbackText
    await streamTextDeltas(writer, textId, finalBody)
    writer.write({ type: "text-end", id: textId })
  }

  private async appendBackgroundSynthesis(
    req: InferenceRequest,
    writer: UIMessageStreamWriter,
    textId: string,
    fastOutput: string,
    backgroundModel: string
  ): Promise<void> {
    recordStage("deep_synthesis")
    emitRuntimeMarker(writer, textId, "deep_synthesis", backgroundModel)
    writer.write({ type: "text-delta", id: textId, delta: "\n\n## Extended Analysis\n\n" })

    const bgMessages: OpenRouterMessage[] = [
      ...req.messages,
      {
        role: "assistant",
        content: fastOutput.slice(0, 2000),
      },
      {
        role: "user",
        content:
          "Provide a concise structured addendum (bullets, key risks, action items). Max 400 words. No preamble.",
      },
    ]

    const result = await fetchProviderStream({
      model: backgroundModel,
      messages: bgMessages,
      referer: req.referer,
      maxTokens: 800,
    })

    if (!result.ok || !result.response?.body) return

    const { reasoningId } = createStreamIds()
    const pipeResult = await pipeProviderStream(result.response.body.getReader(), writer, {
      modelId: backgroundModel,
      textId,
      reasoningId,
      onStage: recordStage,
    })

    if (!pipeResult.hadContent) {
      writer.write({
        type: "text-delta",
        id: textId,
        delta: generateMockResponse(req.userQuery, []).slice(0, 500),
      })
    }
  }
}

export const inferenceRuntime = new FaultTolerantInferenceRuntime()
