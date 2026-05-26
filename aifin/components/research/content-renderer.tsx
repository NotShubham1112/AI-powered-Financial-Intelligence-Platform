"use client"

import {
  TypographyH2,
  TypographyH3,
  TypographyP,
  TypographyList,
  TypographyBlockquote,
  TypographyLarge,
  TypographySmall,
} from "./typography"

export interface ContentBlock {
  type: "heading" | "paragraph" | "list" | "blockquote" | "emphasis" | "code"
  level?: 2 | 3 | 4
  content?: string
  items?: string[]
}

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading":
            if (block.level === 3) {
              return <TypographyH3 key={idx}>{block.content}</TypographyH3>
            }
            return <TypographyH2 key={idx}>{block.content}</TypographyH2>

          case "paragraph":
            return <TypographyP key={idx}>{block.content}</TypographyP>

          case "list":
            return <TypographyList key={idx} items={block.items || []} />

          case "blockquote":
            return (
              <blockquote
                key={idx}
                className="mt-6 border-l-2 border-zinc-700 pl-6 italic text-zinc-400"
              >
                {block.content}
              </blockquote>
            )

          case "emphasis":
            return <TypographyLarge key={idx}>{block.content}</TypographyLarge>

          case "code":
            return (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded p-4 overflow-x-auto"
              >
                <code className="text-zinc-300 font-mono text-sm">
                  {block.content}
                </code>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
