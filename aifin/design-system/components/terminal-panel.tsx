import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TerminalPanelProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
}

export function TerminalPanel({ children, className, header, footer }: TerminalPanelProps) {
  return (
    <div className={cn("border border-border bg-card", className)}>
      {header && <div className="border-b border-border">{header}</div>}
      <div>{children}</div>
      {footer && <div className="border-t border-border">{footer}</div>}
    </div>
  )
}
