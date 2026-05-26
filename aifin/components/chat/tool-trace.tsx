"use client"

import { cn } from "@/lib/utils"
import type { ToolTrace as ToolTraceType } from "@/stores/chat-store"
import { Check, X, CircleDashed, Minus } from "lucide-react"

const statusMap = {
  running: { border: "border-foreground/35", icon: "running" as const },
  complete: { border: "border-foreground/20", icon: "complete" as const },
  error: { border: "border-destructive/40", icon: "error" as const },
}

export function ToolTrace({ trace }: { trace: ToolTraceType }) {
  const s = statusMap[trace.status]

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-l-2 bg-transparent py-1 pl-3",
        s.border
      )}
    >
      <TraceIcon kind={s.icon} />
      <code className="font-mono text-[11px] font-medium tracking-tight text-foreground/65">
        [{trace.toolName}]
      </code>
      <span className="font-mono text-[11px] text-muted-foreground/50">{trace.message}</span>
    </div>
  )
}

function TraceIcon({ kind }: { kind: "running" | "complete" | "error" }) {
  const cls = "h-3 w-3 flex-shrink-0"
  if (kind === "running")
    return <CircleDashed className={cn(cls, "animate-spin text-foreground/45")} />
  if (kind === "complete") return <Check className={cn(cls, "text-foreground/55")} />
  if (kind === "error") return <X className={cn(cls, "text-destructive/70")} />
  return <Minus className={cn(cls, "text-muted-foreground/30")} />
}
