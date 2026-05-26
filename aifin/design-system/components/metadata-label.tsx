import { cn } from "@/lib/utils"

interface MetadataLabelProps {
  children: React.ReactNode
  className?: string
}

export function MetadataLabel({ children, className }: MetadataLabelProps) {
  return (
    <span
      className={cn(
        "text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium",
        className
      )}
    >
      {children}
    </span>
  )
}
