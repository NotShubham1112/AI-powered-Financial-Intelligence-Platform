"use client"

import * as React from "react"
import { TerminalPanel } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"
import { cn } from "@/lib/utils"
import {
  H2,
  P,
  List,
  ListItem
} from "@/components/ui/typography"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  const { artifact, isJson } = React.useMemo(() => {
    let parsedJson: unknown = null
    let validJson = false
    try {
      parsedJson = JSON.parse(content)
      validJson = true
    } catch {
      // not JSON
    }
    const artifact = validJson ? tryValidateArtifact(parsedJson) : null
    return { artifact, isJson: validJson }
  }, [content])

  // If valid artifact, render with institutional styling
  if (artifact) {
    return (
      <ResearchLayout>
        <ArtifactRenderer artifact={artifact} />
      </ResearchLayout>
    )
  }

  // Skip raw JSON rendering - never expose structured data objects to users
  // Render as markdown instead, which is more user-friendly
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
        <H2 className="mb-4 pb-2">
          {title}
        </H2>
      )}

      <div className="space-y-4">
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3 border-0 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm">
                <div className="mb-1 text-xs font-medium text-muted-foreground/60">{m.label}</div>
                <p className="font-medium text-sm text-foreground">
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
          const items = trimmed.split("\n").filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*"))
          return (
            <List key={i}>
              {items.map((item, j) => (
                <ListItem
                  key={j}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  <InlineText text={item.trim().replace(/^[-*]\s*/, "")} />
                </ListItem>
              ))}
            </List>
          )
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="text-lg font-semibold text-foreground mt-4 mb-2">
              {trimmed.replace(/^### /, "")}
            </h4>
          )
        }

        return (
          <P key={i} className="leading-7 text-base">
            <InlineText text={trimmed} />
          </P>
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
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-medium text-muted-foreground/80"
              >
                <InlineText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/50/50">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-4 py-3 text-muted-foreground",
                    ci === 0 && "font-medium text-foreground"
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
        <strong key={key++} className="font-semibold text-foreground">
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
          className="rounded-sm bg-muted/50 px-2 py-0.5 font-mono text-xs text-foreground border border-border"
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
