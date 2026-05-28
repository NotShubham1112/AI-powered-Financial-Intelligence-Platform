"use client"

import React, { useState, type ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

function DetailsBlock({ summary, children }: { summary: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="my-4 rounded-lg border border-border/60 bg-card/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-muted-foreground/70 hover:text-foreground/90 transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
        <span>{summary}</span>
      </button>
      {open && (
        <div className="border-t border-border/40 px-4 py-3 text-xs text-muted-foreground/80 space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null

  // Pre-process: convert HTML details/summary into block syntax for rehype-raw
  // rehype-raw will parse the HTML tags
  return (
    <div className={cn("max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          details: (props: any) => {
            let summaryText = "Details"
            const childrenArray = React.Children.toArray(props.children) as React.ReactElement[]
            const summaryEl = childrenArray.find((c: React.ReactElement) => c.type === "summary")
            if (summaryEl && summaryEl.props && typeof summaryEl.props === "object") {
              const p = summaryEl.props as Record<string, unknown>
              summaryText = (p.children as string) ?? "Details"
            }
            const bodyChildren = childrenArray.filter((c: React.ReactElement) => c.type !== "summary")
            return <DetailsBlock summary={summaryText}>{bodyChildren}</DetailsBlock>
          },
          summary: () => null,
          h1: ({ node, ...props }) => (
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-0" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-8 first:mt-0" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-6" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="" {...props} />
          ),
          code: ({ node, inline, className: codeClass, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <pre className="my-4 overflow-x-auto rounded border border-border bg-muted p-3">
                <code className={cn("text-sm font-mono whitespace-pre-wrap break-words", codeClass)} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
          pre: ({ node: _node, ...props }) => (
            <div {...(props as React.HTMLAttributes<HTMLDivElement>)} />
          ),
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto">
              <table className="my-6 w-full border-collapse border border-border text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-border" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border-r border-border px-3 py-2" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border-r border-border px-3 py-2 font-semibold" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-border" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-400 hover:underline" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
