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

        prose-headings:font-semibold
        prose-headings:text-white

        prose-p:text-zinc-300
        prose-p:leading-7
        prose-p:mb-4

        prose-strong:text-white
        prose-strong:font-semibold

        prose-h1:text-3xl
        prose-h1:mt-8
        prose-h1:mb-4

        prose-h2:text-2xl
        prose-h2:mt-6
        prose-h2:mb-3

        prose-h3:text-xl
        prose-h3:mt-4
        prose-h3:mb-2

        prose-table:border-zinc-800
        prose-th:bg-zinc-900
        prose-th:text-zinc-300
        prose-th:border-zinc-800
        prose-td:text-zinc-400
        prose-td:border-zinc-800

        prose-li:text-zinc-300
        prose-li:marker:text-zinc-500

        prose-code:text-white
        prose-code:bg-zinc-900
        prose-code:px-1.5
        prose-code:py-0.5
        prose-code:rounded

        prose-pre:bg-black
        prose-pre:border
        prose-pre:border-zinc-800

        prose-blockquote:text-zinc-400
        prose-blockquote:border-zinc-800
        prose-blockquote:pl-4

        prose-hr:border-zinc-800
      "
    >
      {children}
    </article>
  )
}
