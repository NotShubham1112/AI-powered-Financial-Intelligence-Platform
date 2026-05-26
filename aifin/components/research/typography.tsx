// Semantic typography components for structured research output

export function TypographyH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-white mb-6">
      {children}
    </h1>
  )
}

export function TypographyH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="scroll-m-20 border-b border-zinc-800 pb-2 text-3xl font-semibold tracking-tight text-white mt-8 mb-4 first:mt-0">
      {children}
    </h2>
  )
}

export function TypographyH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-white mt-6 mb-3">
      {children}
    </h3>
  )
}

export function TypographyH4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-white mt-4 mb-2">
      {children}
    </h4>
  )
}

export function TypographyP({ children }: { children: React.ReactNode }) {
  return (
    <p className="leading-7 text-zinc-300 [&:not(:first-child)]:mt-6">
      {children}
    </p>
  )
}

export function TypographyBlockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="mt-6 border-l-2 border-zinc-700 pl-6 italic text-zinc-400">
      {children}
    </blockquote>
  )
}

export function TypographyList({ items }: { items: string[] }) {
  return (
    <ul className="my-6 ml-6 list-disc text-zinc-300 [&>li]:mt-2 [&>li]:text-zinc-300">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  )
}

export function TypographyLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-lg text-zinc-400 font-medium mb-4">
      {children}
    </p>
  )
}

export function TypographyLarge({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-lg font-semibold text-white">
      {children}
    </div>
  )
}

export function TypographySmall({ children }: { children: React.ReactNode }) {
  return (
    <small className="text-sm font-medium text-zinc-400">
      {children}
    </small>
  )
}

export function TypographyMuted({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-zinc-500">
      {children}
    </p>
  )
}

export function TypographyCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="relative rounded bg-zinc-900 px-2 py-1 font-mono text-sm font-semibold text-white border border-zinc-800">
      {children}
    </code>
  )
}

export function TypographyStrong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-white">
      {children}
    </strong>
  )
}
