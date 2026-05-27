import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "default" | "primary" | "ghost"
  size?: "sm" | "md"
}

export function TerminalButton({
  children,
  className,
  variant = "default",
  size = "sm",
  ...props
}: TerminalButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center border border-border/40 rounded-md font-sans transition-colors",
        "hover:bg-muted hover:border-border/60 hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "px-2 py-1.5 text-xs",
        size === "md" && "px-3 py-2 text-sm",
        variant === "primary" && "bg-foreground text-background border-foreground hover:opacity-90",
        variant === "ghost" && "border-transparent hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
