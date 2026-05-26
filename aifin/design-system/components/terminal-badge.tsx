import { cn } from "@/lib/utils"

interface TerminalBadgeProps {
  children: React.ReactNode
  className?: string
}

export function TerminalBadge({ children, className }: TerminalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-border bg-accent px-2 py-0.5",
        "text-[11px] font-medium uppercase tracking-widest text-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}
