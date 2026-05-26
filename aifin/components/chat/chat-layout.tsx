"use client"

import type { ReactNode } from "react"
import { TerminalShell, MarginLines } from "@/design-system/components"
import { ChatNavbar } from "./chat-navbar"
import { ChatSidebar } from "./chat-sidebar"
import { ArtifactPanel } from "./artifact-panel"

interface ChatLayoutProps {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <TerminalShell className="flex h-screen flex-col overflow-hidden">
      <ChatNavbar />
      <div className="relative flex flex-1 overflow-hidden">
        <MarginLines />
        <ChatSidebar />
        <main className="relative z-10 flex flex-1 flex-col overflow-hidden border-x border-border">
          {children}
        </main>
        <ArtifactPanel />
      </div>
    </TerminalShell>
  )
}
