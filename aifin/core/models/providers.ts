import { getTimeoutProfile } from "./config"
import { providerHealth } from "./health"

export type OpenRouterMessage = { role: string; content: string }

export type ProviderFetchResult = {
  ok: boolean
  response?: Response
  status?: number
  modelUsed?: string
  errorBody?: string
  retryAfterMs?: number
}

function parseRetryAfterMs(headers: Headers, body?: string): number | undefined {
  const header = headers.get("retry-after")
  if (header) {
    const n = parseInt(header, 10)
    if (!Number.isNaN(n)) return n * 1000
  }
  if (body) {
    const m = body.match(/retry[_\s-]?after[:\s]+(\d+)/i)
    if (m) return parseInt(m[1], 10) * 1000
  }
  return undefined
}

export function isRetryableError(status: number | undefined, errorBody?: string): boolean {
  if (status === 429 || status === 503 || status === 502 || status === 404 || status === 408)
    return true
  if (status !== 400 || !errorBody) return false
  const lower = errorBody.toLowerCase()
  return (
    lower.includes("not a valid model") ||
    lower.includes("invalid model") ||
    lower.includes("model not found") ||
    lower.includes("no endpoints found") ||
    lower.includes("rate limit")
  )
}

export async function fetchOpenRouterStream(
  apiKey: string,
  options: {
    model: string
    messages: OpenRouterMessage[]
    referer: string
    maxTokens?: number
  }
): Promise<ProviderFetchResult> {
  const profile = getTimeoutProfile(options.model)
  providerHealth.recordAttempt(options.model)

  const controller = new AbortController()
  const connectTimer = setTimeout(() => controller.abort("connect_timeout"), profile.connectMs)

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": options.referer,
        "X-Title": "FININTEL AI",
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: true,
        max_tokens: options.maxTokens ?? 2048,
        route: "fallback",
      }),
      signal: controller.signal,
    })

    clearTimeout(connectTimer)

    if (res.ok) {
      return { ok: true, response: res, modelUsed: options.model }
    }

    const errorBody = await res.text()
    if (res.status === 429) providerHealth.recordRateLimit(options.model)

    return {
      ok: false,
      status: res.status,
      errorBody,
      retryAfterMs: parseRetryAfterMs(res.headers, errorBody),
    }
  } catch (e) {
    clearTimeout(connectTimer)
    const message = e instanceof Error ? e.message : "request_failed"
    const timedOut =
      message.includes("timeout") ||
      message.includes("aborted") ||
      message.includes("connect_timeout")
    if (timedOut) providerHealth.recordTimeout(options.model)
    return {
      ok: false,
      status: timedOut ? 408 : 503,
      errorBody: message,
    }
  }
}

export async function sleepWithJitter(ms: number, attempt: number): Promise<void> {
  const jitter = Math.random() * 400
  const backoff = ms * Math.pow(1.5, attempt) + jitter
  await new Promise((r) => setTimeout(r, Math.min(backoff, 12_000)))
}
