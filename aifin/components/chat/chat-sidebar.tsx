"use client"

import { useState } from "react"
import { Plus, History, Puzzle, Store, FileText, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/chat-store"
import { TerminalButton } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"
import { SkillsDialog } from "./skills-dialog"
import Link from "next/link"

const navItems = [
  { id: "history", label: "History", icon: History },
  { id: "artifacts", label: "Artifacts", icon: FileText },
] as const

export function ChatSidebar() {
  const isSidebarOpen = useChatStore((s) => s.isSidebarOpen)
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const setActiveSession = useChatStore((s) => s.setActiveSession)
  const createSession = useChatStore((s) => s.createSession)
  const [skillsOpen, setSkillsOpen] = useState(false)

  if (!isSidebarOpen) return null

  return (
    <>
      <aside className="relative z-10 flex w-[260px] flex-shrink-0 flex-col justify-between border-r border-border bg-background">
        <div>
          <div className="border-b border-border px-4 py-3">
            <TerminalButton
              onClick={createSession}
              className="h-8 w-full justify-start gap-2 bg-transparent text-[11px] text-muted-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              New Session
            </TerminalButton>
          </div>

          <div className="flex flex-col gap-4 px-3 py-3">
            {navItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <MetadataLabel>{item.label}</MetadataLabel>
                </div>

                {item.id === "history" && (
                  <div className="flex flex-col">
                    {sessions.slice(0, 8).map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setActiveSession(session.id)}
                        className={cn(
                          "group flex items-center gap-2 px-3 py-1.5 text-left text-[11px] transition-colors",
                          session.id === activeSessionId
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground/70 hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 flex-shrink-0",
                            session.id === activeSessionId
                              ? "text-muted-foreground/70"
                              : "opacity-0 group-hover:opacity-40"
                          )}
                        />
                        <span className="truncate">{session.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {item.id === "artifacts" && (
                  <div className="px-3 py-2 text-[11px] text-muted-foreground/40 font-medium">
                    no artifacts indexed
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[1px] border-t border-border p-3">
          <TerminalButton
            variant="ghost"
            className="h-8 w-full justify-start gap-2 text-[11px] text-muted-foreground"
            onClick={() => setSkillsOpen(true)}
          >
            <Puzzle className="h-3.5 w-3.5" />
            Skills Registry
          </TerminalButton>
          <Link href="/" className="w-full">
            <TerminalButton variant="ghost" className="h-8 w-full justify-start gap-2 text-[11px] text-muted-foreground">
              <Store className="h-3.5 w-3.5" />
              Platform Home
            </TerminalButton>
          </Link>
        </div>
      </aside>

      <SkillsDialog open={skillsOpen} onOpenChange={setSkillsOpen} />
    </>
  )
}
