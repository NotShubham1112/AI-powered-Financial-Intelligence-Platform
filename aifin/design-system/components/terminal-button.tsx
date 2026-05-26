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
  size = "md",
  ...props
}: TerminalButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center border border-border font-mono transition-colors",
        "hover:bg-accent hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "px-3 py-1.5 text-[11px]",
        size === "md" && "px-4 py-2 text-[13px]",
        variant === "primary" && "bg-foreground text-background hover:opacity-90",
        variant === "ghost" && "border-transparent hover:border-border",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
