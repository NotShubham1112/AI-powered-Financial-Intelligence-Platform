"use client"

import Link from "next/link"
import { Settings, PanelLeft, Sun, Moon, Activity } from "lucide-react"
import { useChatStore } from "@/stores/chat-store"
import { useTheme } from "next-themes"
import { TerminalButton } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"

export function ChatNavbar() {
  const toggleSidebar = useChatStore((s) => s.toggleSidebar)
  const isSidebarOpen = useChatStore((s) => s.isSidebarOpen)
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="relative z-20 flex h-12 flex-shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
        <Link href="/" className="text-[13px] font-bold tracking-tight text-foreground">
          FININTEL
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <MetadataLabel>Research Terminal</MetadataLabel>
        {isSidebarOpen && (
          <>
            <span className="text-muted-foreground/30">/</span>
            <span className="font-mono text-[11px] text-muted-foreground/60">workspace</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 border border-border px-2 py-1 md:flex">
          <Activity className="h-3 w-3 text-muted-foreground/50" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            runtime idle
          </span>
        </div>
        <TerminalButton
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-3.5 w-3.5 dark:hidden" />
          <Moon className="hidden h-3.5 w-3.5 dark:block" />
        </TerminalButton>
        <TerminalButton size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="Settings">
          <Settings className="h-3.5 w-3.5" />
        </TerminalButton>
      </div>
    </header>
  )
}
