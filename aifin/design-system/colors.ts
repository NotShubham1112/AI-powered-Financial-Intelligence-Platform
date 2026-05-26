/** FININTEL monochrome palette — matches landing page */
export const colors = {
  bg: "#000000",
  fg: "#ffffff",
  muted: "rgba(255,255,255,0.65)",
  dim: "rgba(255,255,255,0.35)",
  faint: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  accent: "rgba(255,255,255,0.06)",
  accentHover: "rgba(255,255,255,0.10)",
  /** Execution states — restrained, not rainbow */
  stateIdle: "rgba(255,255,255,0.25)",
  stateRunning: "rgba(255,255,255,0.85)",
  stateSuccess: "rgba(255,255,255,0.70)",
  stateError: "rgba(180,80,80,0.85)",
} as const

export const cssVars = {
  "--fin-bg": colors.bg,
  "--fin-fg": colors.fg,
  "--fin-muted": colors.muted,
  "--fin-dim": colors.dim,
  "--fin-faint": colors.faint,
  "--fin-border": colors.border,
  "--fin-border-strong": colors.borderStrong,
  "--fin-accent": colors.accent,
  "--fin-state-idle": colors.stateIdle,
  "--fin-state-running": colors.stateRunning,
  "--fin-state-success": colors.stateSuccess,
  "--fin-state-error": colors.stateError,
} as const
