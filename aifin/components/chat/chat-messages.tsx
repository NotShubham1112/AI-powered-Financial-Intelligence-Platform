"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { ThinkingAnimation, type TerminalLoaderPhase } from "./thinking-animation"
import { RuntimeStatusBar } from "./runtime-status"
import { TerminalBadge, MetadataLabel } from "@/design-system/components"
import { typography } from "@/design-system/typography"

interface ChatMessagesProps {
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp?: number
  }>
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 300
    if (isNearBottom || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1200px] space-y-0 px-6 py-6">
        {messages.length === 0 && !isLoading && <EmptyState />}
        {messages.map((message, index) => (
          <div key={message.id} className="border-b border-border/60 py-6 last:border-b-0">
            <ChatMessage
              message={message}
              isStreaming={
                isLoading && message.role === "assistant" && index === messages.length - 1
              }
            />
          </div>
        ))}
        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
            <div className="border-b border-border/60 py-6">
              <RuntimeStatusBar />
              <ThinkingAnimation phase="streaming" />
            </div>
          )}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
          <div className="border-b border-border/60 px-0 py-4">
            <RuntimeStatusBar />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function EmptyState() {
  const workflows = [
    { cmd: "/earnings", name: "Earnings Analysis", desc: "SEC filings + guidance synthesis" },
    { cmd: "/risk", name: "Risk Assessment", desc: "VaR, stress, factor exposure" },
    { cmd: "/macro", name: "Macro Regime", desc: "Yield curve + inflation momentum" },
    { cmd: "/portfolio", name: "Portfolio Build", desc: "Optimization + attribution" },
  ]

  return (
    <div className="py-16">
      <div className="mb-10">
        <TerminalBadge className="mb-6">Research Terminal</TerminalBadge>
        <h1 className={typography.h1 + " mb-4 text-foreground"}>
          Institutional AI infrastructure
        </h1>
        <p className={typography.body + " max-w-[640px] text-muted-foreground"}>
          Operate deterministic financial engines through MCP. Initialize workflows via slash
          commands or submit a research query to begin execution.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <MetadataLabel>Core Workflows</MetadataLabel>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-[1px] border border-border bg-border sm:grid-cols-2">
        {workflows.map((item) => (
          <div
            key={item.cmd}
            className="cursor-pointer bg-background p-5 transition-colors hover:bg-accent"
          >
            <div className="mb-2 font-mono text-[12px] font-medium text-foreground">{item.cmd}</div>
            <div className="mb-1 text-[13px] font-medium text-foreground/90">{item.name}</div>
            <p className="text-[12px] leading-relaxed text-muted-foreground/70">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
