import { getRuntimeMetrics } from "@/core/models/runtime"

export const dynamic = "force-dynamic"

export async function GET() {
  return Response.json({
    runtime: "fault-tolerant-free-inference",
    timestamp: new Date().toISOString(),
    ...getRuntimeMetrics(),
  })
}
