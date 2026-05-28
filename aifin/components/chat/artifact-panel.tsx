"use client"

import { X, FileText, BarChart3, Table2, Download, ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/stores/chat-store"
import { cn } from "@/lib/utils"
import { MetadataLabel, TerminalButton } from "@/design-system/components"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

const dummyArtifacts = [
  { id: "art-1", type: "report" as const, title: "NVIDIA Earnings Summary", date: "2m ago" },
  { id: "art-2", type: "chart" as const, title: "Revenue by Segment", date: "2m ago" },
  { id: "art-3", type: "table" as const, title: "Key Financial Metrics", date: "2m ago" },
  { id: "art-4", type: "report" as const, title: "Portfolio Risk Assessment", date: "1h ago" },
]

const typeIcons = {
  report: FileText,
  chart: BarChart3,
  table: Table2,
  spreadsheet: Table2,
}

function ArtifactContent() {
  const activeArtifactId = useChatStore((s) => s.activeArtifactId)
  const setActiveArtifact = useChatStore((s) => s.setActiveArtifact)

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-[1px] border-b border-border bg-border">
        {dummyArtifacts.map((artifact) => {
          const Icon = typeIcons[artifact.type]
          const isActive = activeArtifactId === artifact.id
          return (
            <button
              key={artifact.id}
              type="button"
              onClick={() => setActiveArtifact(artifact.id)}
              className={cn(
                "flex flex-col gap-2 bg-background p-4 text-left transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent/60"
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground/50" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-sans text-sm font-semibold text-foreground">{artifact.title}</div>
                  <div className="mt-1 font-sans text-xs text-muted-foreground/60">
                    {artifact.type} · {artifact.date}
                  </div>
                </div>
              </div>
              {isActive && (
                <div className="flex gap-1 border-t border-border pt-2">
                  <TerminalButton size="sm" variant="ghost" className="h-6 px-2">
                    <Download className="h-3 w-3" />
                  </TerminalButton>
                  <TerminalButton size="sm" variant="ghost" className="h-6 px-2">
                    <ExternalLink className="h-3 w-3" />
                  </TerminalButton>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

export function ArtifactPanel() {
  const isArtifactOpen = useChatStore((s) => s.isArtifactOpen)
  const toggleArtifact = useChatStore((s) => s.toggleArtifact)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={isArtifactOpen} onOpenChange={(open) => { if (!open) toggleArtifact() }}>
        <SheetContent side="right" className="flex w-[300px] flex-col border-l border-border bg-background p-0" showCloseButton={false}>
          <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
              <MetadataLabel>Artifacts</MetadataLabel>
            </div>
            <button
              type="button"
              onClick={toggleArtifact}
              className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <ArtifactContent />
        </SheetContent>
      </Sheet>
    )
  }

  if (!isArtifactOpen) return null

  return (
    <aside className="relative z-10 flex w-[320px] flex-shrink-0 flex-col border-l border-border bg-background">
      <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
          <MetadataLabel>Artifacts</MetadataLabel>
        </div>
        <button
          type="button"
          onClick={toggleArtifact}
          className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <ArtifactContent />
    </aside>
  )
}
