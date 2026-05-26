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

export const dynamic = "force-dynamic"

const COMPACT_SYSTEM = `You are FININTEL institutional research terminal.

STRUCTURE: Executive Summary · Investment Thesis · Valuation · Macro Risks · Quant · Scenarios.

EVIDENCE RULES (mandatory):
- Every quantitative claim MUST cite an MCP evidence-bound claim (source + confidence) OR be tagged [Unverified].
- NEVER invent market share %, developer counts, or efficiency multiples without engine backing.
- Reconcile bull vs risk thesis when contradictions are provided — do not contradict yourself silently.

STYLE: Concise bullets/tables. Signal interpretation over raw indicators. Probabilistic scenarios when provided.
No chain-of-thought. Max 2 short paragraphs per section unless user requests detail.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawMessages = body.messages ?? []
    const model = resolveModel(body.model ?? DEFAULT_OPENROUTER_MODEL)

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

    let mcpResult = null
    if (lastUserText && shouldInvokeMcp(lastUserText)) {
      mcpResult = await runMcpAgent(lastUserText, resolveMcpRunOptions(lastUserText))
      if (mcpResult) {
        modelMessages.unshift({
          role: "system",
          content: `${COMPACT_SYSTEM}\n\n## MCP Engine Results\n${formatMcpContext(mcpResult)}`,
        })
      } else {
        modelMessages.unshift({ role: "system", content: COMPACT_SYSTEM })
      }
    } else {
      modelMessages.unshift({ role: "system", content: COMPACT_SYSTEM })
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
    console.error("POST Handler Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

type MockFallbackOptions = {
  reason?: string
  triedModels?: string[]
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
