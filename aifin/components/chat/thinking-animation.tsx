"use client"

import { DotmSquare11 } from "@/components/ui/dotm-square-11"
import { MetadataLabel } from "@/design-system/components"

export type TerminalLoaderPhase =
  | "thinking"
  | "planning"
  | "executing"
  | "streaming"
  | "validating"
  | "fallback"
  | "heartbeat"

const PHASE_LABELS: Record<TerminalLoaderPhase, string> = {
  thinking: "Analyzing query",
  planning: "Planning research",
  executing: "Gathering data",
  streaming: "Generating report",
  validating: "Validating results",
  fallback: "Processing",
  heartbeat: "Processing",
}

interface ThinkingAnimationProps {
  phase?: TerminalLoaderPhase
  label?: string
}

/** Terminal loader for thinking, planning, MCP execution, and streaming */
export function TerminalLoader(props: ThinkingAnimationProps) {
  return <ThinkingAnimation {...props} />
}

export function ThinkingAnimation({
  phase = "thinking",
  label,
}: ThinkingAnimationProps) {
  const statusLabel = label ?? PHASE_LABELS[phase]

  return (
    <div className="flex items-start gap-4 border border-border bg-card/40 px-4 py-3">
      <div className="flex-shrink-0 text-foreground/90">
        <DotmSquare11
          animated
          speed={1.2}
          pattern="diamond"
          dotShape="square"
          size={44}
          dotSize={5}
          opacityBase={0.14}
          opacityMid={0.38}
          opacityPeak={1}
          ariaLabel={`${statusLabel} in progress`}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1.5 pt-1">
        <MetadataLabel>{statusLabel}</MetadataLabel>
        <span className="font-mono text-[11px] text-muted-foreground/50 animate-[terminal-blink_1.4s_step-end_infinite]">
          awaiting deterministic output…
        </span>
      </div>
    </div>
  )
}
