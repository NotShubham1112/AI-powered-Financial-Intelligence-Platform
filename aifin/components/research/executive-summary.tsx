import { TypographyH2, TypographyP } from "./typography"

export function ExecutiveSummary({
  content,
}: {
  content: string
}) {
  return (
    <div className="border border-zinc-800 rounded-lg bg-black p-6 mb-6">
      <TypographyH2>Executive Summary</TypographyH2>
      <div className="mt-4 space-y-4">
        <article className="prose prose-invert max-w-none">
          {/* If content is HTML, render it safely */}
          {content.includes("<") ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            /* Otherwise render as paragraphs */
            <>
              {content.split("\n\n").map((paragraph, idx) => (
                <TypographyP key={idx}>{paragraph}</TypographyP>
              ))}
            </>
          )}
        </article>
      </div>
    </div>
  )
}
