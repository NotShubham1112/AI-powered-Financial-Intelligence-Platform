"use client"

import * as React from "react"
import { TerminalPanel } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"
import { cn } from "@/lib/utils"
import * as Typography from "@/components/ui/typography"
import { 
  ArtifactRenderer, 
  tryValidateArtifact,
  ResearchLayout,
  ReportTypography 
} from "@/components/research"

type Section = {
  title: string | null
  body: string
}

function splitSections(content: string): Section[] {
  const parts = content.split(/^## /m).filter(Boolean)
  if (parts.length <= 1 && !content.startsWith("## ")) {
    return [{ title: null, body: content.trim() }]
  }

  return parts.map((part) => {
    const nl = part.indexOf("\n")
    if (nl === -1) return { title: part.trim(), body: "" }
    return {
      title: part.slice(0, nl).trim(),
      body: part.slice(nl + 1).trim(),
    }
  })
}

function extractMetrics(body: string): { metrics: Array<{ label: string; value: string }>; rest: string } {
  const metrics: Array<{ label: string; value: string }> = []
  const lines = body.split("\n")
  const restLines: string[] = []

  for (const line of lines) {
    const m = line.match(/^\*\*([^*]+)\*\*[:\s·]+(.+)$/)
    if (m && m[1].length < 48) {
      metrics.push({ label: m[1].trim(), value: m[2].trim() })
    } else {
      restLines.push(line)
    }
  }

  return { metrics, rest: restLines.join("\n").trim() }
}

export function ResearchOutput({ content }: { content: string }) {
  // Try to parse as artifact JSON first
  const artifact = React.useMemo(() => {
    try {
      const parsed = JSON.parse(content)
      return tryValidateArtifact(parsed)
    } catch {
      return null
    }
  }, [content])

  // If valid artifact, render with institutional styling
  if (artifact) {
    return (
      <ResearchLayout>
        <ArtifactRenderer artifact={artifact} />
      </ResearchLayout>
    )
  }

  // Otherwise render as markdown sections with typography
  const sections = splitSections(content)

  return (
    <ResearchLayout>
      <ReportTypography>
        <div className="space-y-6">
          {sections.map((section, i) => (
            <SectionBlock key={i} title={section.title} body={section.body} />
          ))}
        </div>
      </ReportTypography>
    </ResearchLayout>
  )
}

function SectionBlock({ title, body }: { title: string | null; body: string }) {
  const { metrics, rest } = extractMetrics(body)

  return (
    <div>
      {title && (
        <h2 className="mb-4 border-b border-zinc-800 pb-2 text-2xl font-semibold text-white">
          {title}
        </h2>
      )}
      
      <div className="space-y-4">
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-[1px] border border-zinc-800 bg-zinc-900 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="bg-black px-3 py-2.5">
                <div className="mb-1 text-xs font-medium text-zinc-500">{m.label}</div>
                <p className="font-mono text-sm text-white">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        )}
        {rest && <ProseBlock text={rest} />}
      </div>
    </div>
  )
}

function ProseBlock({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/)

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        if (trimmed.startsWith("| ") && trimmed.includes("\n|")) {
          return <MarkdownTable key={i} raw={trimmed} />
        }

        if (/^[-*] /m.test(trimmed)) {
          const items = trimmed.split("\n").filter((l) => /^[-*] /.test(l))
          return (
            <ul key={i} className="space-y-1.5 border-l border-zinc-700 pl-4 text-zinc-300">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="font-mono text-sm leading-relaxed text-zinc-300"
                >
                  <InlineText text={item.replace(/^[-*] /, "")} />
                </li>
              ))}
            </ul>
          )
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="text-lg font-semibold text-white mt-4 mb-2">
              {trimmed.replace(/^### /, "")}
            </h4>
          )
        }

        return (
          <p key={i} className="text-zinc-300 leading-7 text-base">
            <InlineText text={trimmed} />
          </p>
        )
      })}
    </div>
  )
}

function MarkdownTable({ raw }: { raw: string }) {
  const lines = raw.split("\n").filter((l) => l.trim().startsWith("|"))
  if (lines.length < 2) return null

  const parseRow = (line: string) =>
    line
      .split("|")
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      .map((c) => c.trim())

  const headers = parseRow(lines[0])
  const rows = lines.slice(2).map(parseRow)

  return (
    <div className="overflow-x-auto border border-zinc-800 rounded-lg">
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-medium text-zinc-400"
              >
                <InlineText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-4 py-3 text-zinc-300",
                    ci === 0 && "font-medium text-white"
                  )}
                >
                  <InlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const bold = remaining.match(/^(\*\*)(.+?)\1/)
    if (bold) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {bold[2]}
        </strong>
      )
      remaining = remaining.slice(bold[0].length)
      continue
    }
    const code = remaining.match(/^`([^`]+)`/)
    if (code) {
      parts.push(
        <code
          key={key++}
          className="rounded-sm bg-zinc-900 px-2 py-0.5 font-mono text-xs text-white border border-zinc-800"
        >
          {code[1]}
        </code>
      )
      remaining = remaining.slice(code[0].length)
      continue
    }
    parts.push(remaining[0])
    remaining = remaining.slice(1)
  }

  return <>{parts}</>
}
