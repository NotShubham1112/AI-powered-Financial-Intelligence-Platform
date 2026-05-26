export function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-8 py-16">
        {children}
      </div>
    </div>
  )
}
