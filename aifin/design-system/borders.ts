/** Brutalist grid borders — no rounded consumer cards */
export const borders = {
  default: "border border-border",
  panel: "border border-border bg-background",
  panelMuted: "border border-border bg-card",
  divider: "border-b border-border",
  gridGap: "gap-[1px] border border-border bg-border",
} as const

export const radius = {
  none: "rounded-none",
  sm: "rounded-sm",
} as const
