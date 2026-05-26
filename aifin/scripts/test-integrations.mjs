/**
 * Run: node scripts/test-integrations.mjs
 * Requires: FINANCIAL_MCP_URL (optional), aifin dev server on :3000, MCP on :8000
 */
const MCP_URL = process.env.FINANCIAL_MCP_URL || "http://127.0.0.1:8000"
const APP_URL = process.env.APP_URL || "http://127.0.0.1:3000"

async function check(name, fn) {
  try {
    await fn()
    console.log(`✓ ${name}`)
    return true
  } catch (e) {
    console.error(`✗ ${name}:`, e.message)
    return false
  }
}

async function main() {
  console.log("FININTEL integration checks\n")

  await check("MCP /health", async () => {
    const r = await fetch(`${MCP_URL}/health`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    if (j.status !== "ok") throw new Error(JSON.stringify(j))
  })

  await check("MCP /agent/run (yield curve)", async () => {
    const r = await fetch(`${MCP_URL}/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "yield curve recession signal",
        inputs_by_tool: {
          yield_curve_signal: { ten_year_yield: 3.8, two_year_yield: 4.0 },
        },
        parallel: true,
      }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status} ${await r.text()}`)
    const j = await r.json()
    if (!j.run_id) throw new Error("missing run_id")
    console.log("  run_id:", j.run_id, "status:", j.status)
  })

  await check("Next.js /api/status", async () => {
    const r = await fetch(`${APP_URL}/api/status`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    console.log("  openrouter:", j.openrouter)
    console.log("  mcp:", j.mcp)
    console.log("  chat mode:", j.chat?.mode)
  })

  console.log("\nDone.")
}

main()
