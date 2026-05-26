"use client"

import * as React from "react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { ChartData } from "@/stores/chat-store"
import { ThinkingAnimation } from "./thinking-animation"
import { InlineChart } from "./inline-chart"
import { ExportButtons } from "./export-buttons"
import { ToolTrace } from "./tool-trace"
import { IntelligencePanel } from "./intelligence-panel"
import { ResearchOutput } from "./research-output"
import { ResearchPlan } from "./research-plan"
import type { EvidenceClaim, ExecutionMeta, LiveSignal, McpDebate } from "@/stores/chat-store"
import {
  P,
  Small,
} from "@/components/ui/typography"
import { sanitizeAssistantContent } from "@/lib/sanitize-assistant-content"
import { MarkdownRenderer } from "./markdown-renderer"
import { tryValidateArtifact } from "@/components/research"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp?: number
    toolTraces?: Array<{ id: string; toolName: string; status: "running" | "complete" | "error"; message: string }>
    executionMeta?: ExecutionMeta
    evidence?: EvidenceClaim[]
    liveSignals?: LiveSignal[]
    debate?: McpDebate
    charts?: Array<{
      type: "bar" | "line" | "area" | "pie"
      title: string
      description?: string
      config: Record<string, { label: string; color?: string }>
      data: Record<string, string | number>[]
      xKey: string
      yKeys: string[]
    }>
  }
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user"

  const { parsedCharts, contentWithoutCharts, completedSteps, isArtifact } = useMemo(() => {
    if (isUser) {
      return { parsedCharts: [], contentWithoutCharts: message.content, completedSteps: [], isArtifact: false }
    }

    const chartRegex = /```chart:(bar|line|area|pie)\s*\n([\s\S]*?)```/g
    const charts: ChartData[] = []
    let cleaned = sanitizeAssistantContent(message.content)

    // Strip [AGENT_PLAN] blocks (rendered separately by ResearchPlan)
    cleaned = cleaned.replace(/\[AGENT_PLAN\][\s\S]*?\[\/AGENT_PLAN\]/g, "")

    let match
    while ((match = chartRegex.exec(message.content)) !== null) {
      try {
        const parsed = JSON.parse(match[2].trim())
        charts.push({
          type: match[1] as ChartData["type"],
          title: parsed.title ?? "Chart",
          description: parsed.description,
          config: parsed.config ?? {},
          data: parsed.data ?? [],
          xKey: parsed.xKey ?? "name",
          yKeys: parsed.yKeys ?? ["value"],
        })
      } catch {
        // skip invalid chart data
      }
      cleaned = cleaned.replace(match[0], "")
    }

    // Count completed agent steps from "Step N:" headers in content
    const stepHeaderRegex = /### Step (\d+):/g
    let stepCount = 0
    let stepMatch
    while ((stepMatch = stepHeaderRegex.exec(cleaned)) !== null) {
      const num = parseInt(stepMatch[1], 10)
      if (num > stepCount) stepCount = num
    }
    const completedSteps = stepCount > 0 ? Array.from({ length: stepCount }, (_, i) => String(i + 1)) : []

    // Detect if content is a ResearchArtifact JSON block
    const trimmed = cleaned.trim()
    let isArtifact = false
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        isArtifact = tryValidateArtifact(JSON.parse(trimmed)) !== null
      } catch {
        isArtifact = false
      }
    }

    return { parsedCharts: charts, contentWithoutCharts: cleaned.trim(), completedSteps, isArtifact }
  }, [message.content, isUser])

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
          {isUser ? "operator" : "system"}
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>
      <div className={cn("space-y-3", isUser && "border-l-2 border-muted pl-4")}>
        {isUser ? (
          <div className="whitespace-pre-wrap text-foreground">
            <MarkdownRenderer content={message.content} />
          </div>
        ) : (
          <div className="space-y-2">
            {isStreaming && !message.content && <ThinkingAnimation />}

            {/* Agent plan visualization */}
            {contentWithoutCharts && (
              <ResearchPlan
                content={contentWithoutCharts}
                completedSteps={completedSteps}
              />
            )}

            {(message.executionMeta ||
              message.evidence?.length ||
              message.liveSignals?.length ||
              message.debate) && (
              <IntelligencePanel
                executionMeta={message.executionMeta}
                evidence={message.evidence}
                liveSignals={message.liveSignals}
                debate={message.debate}
                toolTraces={message.toolTraces}
              />
            )}

            {message.toolTraces &&
              message.toolTraces.length > 0 &&
              !message.executionMeta && (
              <div className="flex flex-col gap-1">
                {message.toolTraces.map((trace) => (
                  <ToolTrace key={trace.id} trace={trace} />
                ))}
              </div>
            )}

            {contentWithoutCharts && isArtifact && (
              <ResearchOutput content={contentWithoutCharts} />
            )}

            {contentWithoutCharts && !isArtifact && (
              <div className="space-y-4">
                <MarkdownRenderer content={contentWithoutCharts} />
              </div>
            )}

            {parsedCharts.map((chart, i) => (
              <InlineChart key={i} chart={chart} />
            ))}

            {!isUser && !isStreaming && contentWithoutCharts && (
              <ExportButtons
                onExportCSV={() => {}}
                onExportXLSX={() => {}}
                onExportSheets={() => {}}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
