import { checkMcpHealth } from "@/lib/mcp-client"

export const dynamic = "force-dynamic"

export async function GET() {
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY?.trim())
  let openRouterOk = false
  let openRouterError: string | undefined

  if (hasOpenRouter) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
        signal: AbortSignal.timeout(8000),
      })
      openRouterOk = res.ok
      if (!res.ok) openRouterError = `HTTP ${res.status}`
    } catch (e) {
      openRouterError = e instanceof Error ? e.message : "request failed"
    }
  }

  const mcp = await checkMcpHealth()

  return Response.json({
    openrouter: {
      configured: hasOpenRouter,
      ok: openRouterOk,
      error: openRouterError,
    },
    mcp: {
      url: process.env.FINANCIAL_MCP_URL ?? "http://127.0.0.1:8000",
      ...mcp,
    },
    chat: {
      api: "/api/chat",
      mode: hasOpenRouter ? (openRouterOk ? "openrouter" : "openrouter_error") : "mock_fallback",
    },
  })
}
