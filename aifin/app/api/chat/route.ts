import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type UIMessage,
} from "ai"
import { generateMockResponse } from "./mock"
import { extractUserContent, filterValidUIMessages } from "@/lib/chat-message-utils"
import {
  formatMcpContext,
  resolveMcpRunOptions,
  runMcpAgent,
  shouldInvokeMcp,
} from "@/lib/mcp-client"
import { toOpenRouterMessages } from "@/lib/openrouter-messages"
import { DEFAULT_OPENROUTER_MODEL, resolveModel } from "@/lib/openrouter"
import { inferenceRuntime } from "@/core/models/runtime"
import { classifyIntent, shouldUseAgentPipeline, agentPipeline } from "@/core/agent"

export const dynamic = "force-dynamic"

const INSTITUTIONAL_SYSTEM = `You are the FININTEL Institutional Research Terminal, a high-fidelity financial intelligence system.

Your role is SYNTHESIS ONLY. Planning, data retrieval, and tool execution are handled by the agent engine.

Given analysis results from previous steps, produce a comprehensive research report.

STRUCTURE:
- ## Strategic Overview: Deep dive into the core thesis using provided data.
- ## Quantitative Analysis: MANDATORY tables with row/column data AND interactive charts (bar, line, pie, area).
- ## Evidence Registry: Cite specific claims with source + confidence when available.
- ## Risk & Counter-Thesis: Detailed analysis of what could go wrong.
- ## Final Executive Summary: A concise synthesis of the findings.

REQUIRED ARTIFACT FORMAT for every report:
{
  "executive_summary": "string",
  "key_metrics": [{ "label": "string", "value": "string", "subtext": "string?" }],
  "charts": [{ "type": "bar|line|pie|area|radial|horizontal-bar|donut", "title": "string", "data": [...] }],
  "tables": [{ "title": "string", "data": { "columns": ["string"], "rows": [{}] } }],
  "sections": [{ "title": "string", "content": [{ "type": "paragraph|heading|list|blockquote", "content": "string" }] }]
}

RULES:
- ALWAYS generate at least ONE chart AND one table with numerical data from MCP evidence.
- Do NOT include [PLAN] blocks or planning artifacts.
- Do NOT call tools, MCP, or APIs. You are a synthesis engine only.
- Every quantitative claim MUST cite a source or be tagged [Unverified].
- Use professional, clinical financial language.
- Favor tables, charts, and structured lists over long paragraphs.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawMessages = body.messages ?? []
    const model = resolveModel(body.model ?? DEFAULT_OPENROUTER_MODEL)
    const agentEnabled = body.agentEnabled ?? false

    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY is not defined. Falling back to mock responses.")
      return mockUIMessageStream(rawMessages, { reason: "no_key" })
    }

    const uiMessages = filterValidUIMessages(rawMessages)
    if (uiMessages.length === 0) {
      return mockUIMessageStream(rawMessages, { reason: "empty_messages" })
    }

    const modelMessages = await convertToModelMessages(uiMessages)

    const lastUser = [...modelMessages].reverse().find((m) => m.role === "user")
    const lastUserText =
      lastUser && typeof lastUser.content === "string"
        ? lastUser.content
        : lastUser && Array.isArray(lastUser.content)
          ? lastUser.content
              .filter((p) => p.type === "text")
              .map((p) => (p as { text: string }).text)
              .join("\n")
          : ""

    // Intent routing: agent pipeline vs chat pipeline
    const intent = classifyIntent(lastUserText ?? "", agentEnabled)
    if (shouldUseAgentPipeline(intent)) {
      const apiKey = process.env.OPENROUTER_API_KEY
      const referer = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      return createAgentStreamResponse(lastUserText ?? "", apiKey, model, referer, uiMessages)
    }

    let mcpResult = null
    if (lastUserText && shouldInvokeMcp(lastUserText)) {
      mcpResult = await runMcpAgent(lastUserText, resolveMcpRunOptions(lastUserText))
      if (mcpResult) {
        modelMessages.unshift({
          role: "system",
          content: `${INSTITUTIONAL_SYSTEM}\n\n## MCP Engine Results\n${formatMcpContext(mcpResult)}`,
        })
      } else {
        modelMessages.unshift({ role: "system", content: INSTITUTIONAL_SYSTEM })
      }
    } else {
      modelMessages.unshift({ role: "system", content: INSTITUTIONAL_SYSTEM })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    const referer = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const openRouterMessages = toOpenRouterMessages(modelMessages)

    return inferenceRuntime.createStreamResponse({
      apiKey,
      referer,
      model,
      messages: openRouterMessages,
      userQuery: lastUserText,
      uiMessages,
      mcpResult,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.toLowerCase().includes("image")) {
      return new Response(
        JSON.stringify({ error: "This model does not support image inputs. Please use text-only queries." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    console.error("POST Handler Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

type MockFallbackOptions = {
  reason?: string
  triedModels?: string[]
}

function createAgentStreamResponse(
  query: string,
  apiKey: string,
  model: string,
  referer: string,
  uiMessages: UIMessage[]
): Response {
  const stream = createUIMessageStream({
    originalMessages: uiMessages,
    execute: async ({ writer }) => {
      const textId = generateId()
      await agentPipeline.streamAgentResponse({ query, apiKey, model, referer }, writer, textId)
    },
  })
  return createUIMessageStreamResponse({ stream })
}

function mockUIMessageStream(
  messages: UIMessage[] | unknown[],
  options: MockFallbackOptions = {}
) {
  const uiMessages = Array.isArray(messages) && messages[0] && "parts" in (messages[0] as object)
    ? (messages as UIMessage[])
    : filterValidUIMessages(messages as unknown[])

  const userContent = extractUserContent(uiMessages.length ? uiMessages : (messages as unknown[]))

  let preamble = ""
  if (options.reason === "rate_limited") {
    preamble =
      "> **System:** OpenRouter free-tier models are temporarily rate-limited. Using local FININTEL demo mode — retry in a few minutes.\n\n"
  } else if (options.reason && options.reason !== "no_key") {
    preamble = `> **System:** LLM unavailable (\`${options.reason}\`). Local demo response below.\n\n`
  }

  const fullText = preamble + generateMockResponse(userContent, uiMessages)

  const stream = createUIMessageStream({
    originalMessages: uiMessages,
    execute: async ({ writer }) => {
      const id = generateId()
      writer.write({ type: "text-start", id })
      const chunkSize = 48
      for (let i = 0; i < fullText.length; i += chunkSize) {
        writer.write({
          type: "text-delta",
          id,
          delta: fullText.slice(i, i + chunkSize),
        })
        await new Promise((r) => setTimeout(r, 8))
      }
      writer.write({ type: "text-end", id })
    },
  })

  return createUIMessageStreamResponse({ stream })
}
