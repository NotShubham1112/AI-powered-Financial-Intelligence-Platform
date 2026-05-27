"use client"

import { useChatStore } from "@/stores/chat-store"
import { DotmSquare11 } from "@/components/ui/dotm-square-11"
import { MetadataLabel } from "@/design-system/components"
import { cn } from "@/lib/utils"

/** User-facing labels — never expose failover / model IDs */
const FRIENDLY_LABELS: Record<string, string> = {
  routing: "Preparing analysis",
  connecting: "Preparing analysis",
  streaming: "Generating report",
  fallback: "Generating report",
  heartbeat: "Generating report",
  deep_synthesis: "Extending analysis",
  deterministic: "Running financial engines",
  complete: "Complete",
  agent_planning: "Planning analysis steps",
  agent_executing: "Executing research plan",
  agent_step_complete: "Step complete",
  agent_synthesizing: "Synthesizing results",
}

export function RuntimeStatusBar() {
  const status = useChatStore((s) => s.runtimeStatus)
  const isStreaming = useChatStore((s) => s.isStreaming)

  if (!isStreaming) return null

  const stage = status?.stage ?? "streaming"
  const label = FRIENDLY_LABELS[stage] ?? "Generating report"

  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-4 border border-border/60 bg-card/20 px-4 py-3"
      )}
    >
      <DotmSquare11
        animated
        speed={1.4}
        pattern="diamond"
        dotShape="square"
        size={36}
        dotSize={4}
        opacityBase={0.12}
        opacityMid={0.35}
        opacityPeak={0.95}
        ariaLabel={label}
      />
      <div className="min-w-0">
        <MetadataLabel>{label}</MetadataLabel>
        <p className="font-mono text-[11px] text-muted-foreground/45">
          Processing your request
        </p>
      </div>
    </div>
  )
}

export { parseRuntimeMarkers as parseRuntimeFromContent } from "@/lib/sanitize-assistant-content"
