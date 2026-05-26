import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TerminalShellProps {
  children: ReactNode
  className?: string
}

/** Full-viewport institutional terminal shell */
export function TerminalShell({ children, className }: TerminalShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground font-mono antialiased",
        className
      )}
    >
      {children}
    </div>
  )
}
