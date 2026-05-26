"use client"

import { TerminalPanel } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"
import type {
  EvidenceClaim,
  ExecutionMeta,
  LiveSignal,
  McpDebate,
  ToolTrace,
} from "@/stores/chat-store"
import { cn } from "@/lib/utils"

type IntelligencePanelProps = {
  executionMeta?: ExecutionMeta
  evidence?: EvidenceClaim[]
  liveSignals?: LiveSignal[]
  debate?: McpDebate
  toolTraces?: ToolTrace[]
}

export function IntelligencePanel({
  executionMeta,
  evidence,
  liveSignals,
  debate,
  toolTraces,
}: IntelligencePanelProps) {
  const hasContent =
    executionMeta ||
    (evidence && evidence.length > 0) ||
    (liveSignals && liveSignals.length > 0) ||
    debate?.reconciliation ||
    (toolTraces && toolTraces.length > 0)

  if (!hasContent) return null

  return (
    <div className="space-y-2">
      {executionMeta && (
        <TerminalPanel
          header={
            <div className="px-4 py-2">
              <MetadataLabel>execution_metadata</MetadataLabel>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-3">
            <MetaCell label="run_id" value={executionMeta.runId.slice(0, 8)} />
            <MetaCell
              label="runtime"
              value={
                executionMeta.workflowRuntimeMs > 0
                  ? `${(executionMeta.workflowRuntimeMs / 1000).toFixed(1)}s`
                  : "—"
              }
            />
            <MetaCell label="confidence" value={executionMeta.confidence.toFixed(2)} />
            <MetaCell
              label="agents"
              value={executionMeta.agentsParticipated.join(", ") || "—"}
            />
            <MetaCell
              label="tools"
              value={executionMeta.toolsUsed.join(", ") || "—"}
            />
            {executionMeta.resolution && (
              <MetaCell label="resolution" value={executionMeta.resolution} />
            )}
          </div>
        </TerminalPanel>
      )}

      {liveSignals && liveSignals.length > 0 && (
        <TerminalPanel
          header={
            <div className="px-4 py-2">
              <MetadataLabel>live_signals</MetadataLabel>
            </div>
          }
        >
          <ul className="divide-y divide-border/60 px-4 py-1">
            {liveSignals.map((s, i) => (
              <li key={i} className="flex items-start gap-2 py-2 text-[11px]">
                <DirectionBadge direction={s.direction} />
                <span className="text-foreground/85">{s.label}</span>
                <span className="text-muted-foreground/50">— {s.detail}</span>
              </li>
            ))}
          </ul>
        </TerminalPanel>
      )}

      {debate?.reconciliation && (
        <TerminalPanel
          header={
            <div className="px-4 py-2">
              <MetadataLabel>debate_resolution</MetadataLabel>
            </div>
          }
        >
          <p className="px-4 py-3 text-[11px] leading-relaxed text-foreground/80">
            {debate.reconciliation}
          </p>
          {debate.adjustedConfidence != null && (
            <p className="border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground/60">
              adjusted_confidence: {debate.adjustedConfidence.toFixed(2)} ·{" "}
              {debate.resolution ?? "balanced"}
            </p>
          )}
        </TerminalPanel>
      )}

      {evidence && evidence.length > 0 && (
        <TerminalPanel
          header={
            <div className="px-4 py-2">
              <MetadataLabel>evidence_registry</MetadataLabel>
            </div>
          }
        >
          <ul className="max-h-48 divide-y divide-border/60 overflow-y-auto px-4 py-1">
            {evidence.map((e) => (
              <li key={e.claimId} className="py-2 text-[10px] leading-snug">
                <span className="text-foreground/90">{e.claim}</span>
                <span className="mt-1 block text-muted-foreground/55">
                  {e.source} · conf {e.confidence} · {e.freshnessDays}d
                  {!e.verified && " · unverified"}
                </span>
              </li>
            ))}
          </ul>
        </TerminalPanel>
      )}
    </div>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-3 py-2.5">
      <MetadataLabel className="mb-1 block">{label}</MetadataLabel>
      <p className="truncate text-[11px] text-foreground/90">{value}</p>
    </div>
  )
}

function DirectionBadge({ direction }: { direction: string }) {
  const cls =
    direction === "up" || direction === "elevated"
      ? "text-emerald-600/80"
      : direction === "down"
        ? "text-red-500/80"
        : "text-muted-foreground/60"
  return (
    <span className={cn("mt-0.5 w-4 flex-shrink-0 font-mono text-[10px]", cls)}>
      {direction === "up" ? "↑" : direction === "down" ? "↓" : "·"}
    </span>
  )
}
