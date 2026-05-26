"use client"

import { cn } from "@/lib/utils"
import { CircleDashed, Check, X, Minus } from "lucide-react"

export type ExecutionTraceStatus = "idle" | "running" | "success" | "error"

export interface ExecutionTraceItem {
  id: string
  label: string
  detail?: string
  status: ExecutionTraceStatus
}

const statusBorder: Record<ExecutionTraceStatus, string> = {
  idle: "border-muted-foreground/20",
  running: "border-foreground/40",
  success: "border-foreground/25",
  error: "border-destructive/40",
}

export function ExecutionTrace({ items }: { items: ExecutionTraceItem[] }) {
  return (
    <div className="flex flex-col border border-border bg-card/50 font-mono">
      <div className="border-b border-border px-3 py-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
          execution_trace
        </span>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-2.5 border-l-2 px-3 py-2",
              statusBorder[item.status]
            )}
          >
            <TraceIcon status={item.status} />
            <div className="min-w-0 flex-1">
              <code className="text-[11px] text-foreground/70">[{item.label}]</code>
              {item.detail && (
                <p className="mt-0.5 text-[11px] text-muted-foreground/50">{item.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TraceIcon({ status }: { status: ExecutionTraceStatus }) {
  const cls = "h-3 w-3 flex-shrink-0"
  if (status === "running")
    return <CircleDashed className={cn(cls, "animate-spin text-foreground/50")} />
  if (status === "success")
    return <Check className={cn(cls, "text-foreground/60")} />
  if (status === "error")
    return <X className={cn(cls, "text-destructive/70")} />
  return <Minus className={cn(cls, "text-muted-foreground/30")} />
}
