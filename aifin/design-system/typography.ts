/** Typography scale — editorial headings + terminal metadata */
export const typography = {
  display: "text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight",
  h1: "text-[28px] font-bold leading-tight tracking-tight",
  h2: "text-[22px] font-bold tracking-tight",
  h3: "text-[14px] font-semibold tracking-tight",
  body: "text-[14px] leading-relaxed",
  bodySm: "text-[13px] leading-relaxed",
  meta: "text-[11px] uppercase tracking-widest font-medium",
  mono: "font-mono text-[12px] leading-relaxed",
  monoSm: "font-mono text-[11px] leading-none tracking-tight",
  label: "text-[10px] font-mono uppercase tracking-wider",
} as const
