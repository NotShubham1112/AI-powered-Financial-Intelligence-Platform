export function ReportTypography({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <article
      className="
        prose
        prose-invert
        max-w-none

        prose-headings:text-white
        prose-headings:font-bold
        prose-headings:tracking-tight

        prose-h1:text-5xl
        prose-h1:leading-tight
        prose-h1:mb-8

        prose-h2:text-3xl
        prose-h2:mt-16
        prose-h2:mb-6
        prose-h2:border-b
        prose-h2:border-zinc-800
        prose-h2:pb-3

        prose-p:text-zinc-300
        prose-p:text-lg
        prose-p:leading-8

        prose-strong:text-white

        prose-blockquote:border-zinc-700
        prose-blockquote:text-zinc-300
        prose-blockquote:italic

        prose-li:text-zinc-300

        prose-code:text-white
        prose-code:bg-zinc-900

        prose-pre:bg-zinc-950

        prose-table:text-zinc-300
        prose-th:text-white
        prose-td:text-zinc-400

        prose-hr:border-zinc-800
      "
    >
      {children}
    </article>
  )
}
