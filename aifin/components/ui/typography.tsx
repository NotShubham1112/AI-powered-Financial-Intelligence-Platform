import { cn } from "@/lib/utils"
import { typography } from "@/design-system/typography"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function H1({ children, className }: TypographyProps) {
  return <h1 className={cn(typography.h1, "text-foreground", className)}>{children}</h1>
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(typography.h2, "text-foreground border-b border-border pb-2", className)}>
      {children}
    </h2>
  )
}

export function H3({ children, className }: TypographyProps) {
  return <h3 className={cn(typography.h3, "text-foreground", className)}>{children}</h3>
}

export function H4({ children, className }: TypographyProps) {
  return <h4 className={cn(typography.h3, "text-foreground", className)}>{children}</h4>
}

export function P({ children, className }: TypographyProps) {
  return <p className={cn(typography.bodySm, "text-muted-foreground", className)}>{children}</p>
}

export function BlockQuote({ children, className }: TypographyProps) {
  return (
    <blockquote
      className={cn("mt-4 border-l-2 border-border pl-4 text-[13px] italic text-muted-foreground", className)}
    >
      {children}
    </blockquote>
  )
}

export function InlineCode({ children, className }: TypographyProps) {
  return (
    <code className={cn("bg-accent px-1 py-0.5 font-mono text-[12px] text-foreground/85", className)}>
      {children}
    </code>
  )
}

export function Lead({ children, className }: TypographyProps) {
  return <p className={cn(typography.body, "text-muted-foreground", className)}>{children}</p>
}

export function Large({ children, className }: TypographyProps) {
  return <div className={cn(typography.h3, "text-foreground", className)}>{children}</div>
}

export function Small({ children, className }: TypographyProps) {
  return <small className={cn(typography.bodySm, "text-foreground", className)}>{children}</small>
}

export function Muted({ children, className }: TypographyProps) {
  return <p className={cn(typography.bodySm, "text-muted-foreground/70", className)}>{children}</p>
}

export function List({ children, className }: TypographyProps) {
  return <ul className={cn("my-4 ml-4 list-disc text-[13px] text-muted-foreground", className)}>{children}</ul>
}

export function ListItem({ children, className }: TypographyProps) {
  return <li className={cn("", className)}>{children}</li>
}

export function Table({ children, className }: TypographyProps) {
  return (
    <div className="my-4 w-full overflow-y-auto border border-border">
      <table className={cn("w-full border-collapse text-xs", className)}>{children}</table>
    </div>
  )
}

export function Thead({ children, className }: TypographyProps) {
  return <thead className={cn("border-b border-border bg-accent", className)}>{children}</thead>
}

export function Tbody({ children, className }: TypographyProps) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)}>{children}</tbody>
}

export function Tr({ children, className }: TypographyProps) {
  return <tr className={cn("border-b border-border/50", className)}>{children}</tr>
}

export function Th({ children, className }: TypographyProps) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-left align-middle text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70",
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({ children, className }: TypographyProps) {
  return <td className={cn("px-3 py-2 align-middle text-[12px] text-muted-foreground", className)}>{children}</td>
}
