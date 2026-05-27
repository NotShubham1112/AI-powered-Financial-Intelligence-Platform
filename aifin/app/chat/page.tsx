"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useChat, type UIMessage } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useChatStore } from "@/stores/chat-store"
import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import type { Message } from "@/stores/chat-store"
import { parseRuntimeFromContent } from "@/components/chat/runtime-status"
import { parseMcpMetadata } from "@/lib/mcp-metadata"
import { sanitizeAssistantContent } from "@/lib/sanitize-assistant-content"

export default function ChatPage() {
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const addMessage = useChatStore((s) => s.addMessage)
  const setThinking = useChatStore((s) => s.setThinking)
  const setStreaming = useChatStore((s) => s.setStreaming)
  const setRuntimeStatus = useChatStore((s) => s.setRuntimeStatus)
  const getActiveMessages = useChatStore((s) => s.getActiveMessages)
  const updateLastAssistantMessage = useChatStore((s) => s.updateLastAssistantMessage)

  const [input, setInput] = useState("")
  const syncFromStoreRef = useRef(false)
  const prevLoadingRef = useRef(false)
  const lastRuntimeStageRef = useRef<string | null>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          model: useChatStore.getState().selectedModel,
          agentEnabled: useChatStore.getState().agentEnabled,
        }),
      }),
    []
  )

  const { messages, setMessages: setChatMessages, sendMessage, status, error } = useChat({
    transport,
    onError(err) {
      console.error("useChat error:", err)
    },
  })

  const isLoading = status === "submitted" || status === "streaming"

  // Load session history into useChat only when switching sessions (not on every store write)
  useEffect(() => {
    const session = useChatStore
      .getState()
      .sessions.find((s) => s.id === activeSessionId)
    if (!session) return
    syncFromStoreRef.current = true
    setChatMessages(session.messages.map(toUIMessage))
    const t = window.setTimeout(() => {
      syncFromStoreRef.current = false
    }, 0)
    return () => window.clearTimeout(t)
  }, [activeSessionId, setChatMessages])

  // After stream completes: sync messages into zustand once (never per-token)
  useEffect(() => {
    if (isLoading) {
      prevLoadingRef.current = true
      return
    }
    if (!prevLoadingRef.current || syncFromStoreRef.current) return
    prevLoadingRef.current = false

    const storeMsgs = getActiveMessages()
    if (messages.length > storeMsgs.length) {
      for (const msg of messages.slice(storeMsgs.length)) {
        const content = getMessageContent(msg)
        const mcpMeta =
          msg.role === "assistant" ? parseMcpMetadata(content) : null
        addMessage({
          ...fromUIMessage(msg),
          content:
            msg.role === "assistant" ? sanitizeAssistantContent(content) : content,
          ...(mcpMeta
            ? {
                executionMeta: mcpMeta.executionMeta,
                evidence: mcpMeta.evidence,
                liveSignals: mcpMeta.liveSignals,
                debate: mcpMeta.debate,
                toolTraces: mcpMeta.toolTraces,
              }
            : {}),
        })
      }
    }

    const last = messages[messages.length - 1]
    if (last?.role === "assistant") {
      const raw = getMessageContent(last)
      const mcpMeta = parseMcpMetadata(raw)
      const sanitized = sanitizeAssistantContent(raw)
      const metaUpdates = mcpMeta
        ? {
            executionMeta: mcpMeta.executionMeta,
            evidence: mcpMeta.evidence,
            liveSignals: mcpMeta.liveSignals,
            debate: mcpMeta.debate,
            toolTraces: mcpMeta.toolTraces,
          }
        : {}
      if (storeMsgs.length < messages.length) {
        return
      }
      updateLastAssistantMessage({ content: sanitized, ...metaUpdates })
    }
  }, [isLoading, messages, addMessage, getActiveMessages, updateLastAssistantMessage])

  useEffect(() => {
    setThinking(isLoading)
    setStreaming(isLoading)
    if (!isLoading) {
      setRuntimeStatus(null)
      lastRuntimeStageRef.current = null
    }
  }, [isLoading, setThinking, setStreaming, setRuntimeStatus])

  useEffect(() => {
    if (!isLoading) return

    const last = messages[messages.length - 1]
    const stage =
      last?.role !== "assistant"
        ? "connecting"
        : (parseRuntimeFromContent(getMessageContent(last))?.stage ?? "streaming")

    if (lastRuntimeStageRef.current === stage) return
    lastRuntimeStageRef.current = stage

    setRuntimeStatus({
      stage,
      model: null,
      fallbackCount: 0,
      isRecovering: false,
      lastHeartbeat: stage === "heartbeat" ? Date.now() : 0,
    })
  }, [messages, isLoading, setRuntimeStatus])

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      sendMessage({ text: input.trim() })
      setInput("")
    },
    [input, isLoading, sendMessage]
  )

  const storeMsgs = useChatStore((s) => s.getActiveMessages())

  const displayMessages = messages.map((msg, idx) => {
    const raw = getMessageContent(msg)
    const content =
      msg.role === "assistant" ? sanitizeAssistantContent(raw) : raw
    const stored = storeMsgs.find((m) => m.id === msg.id)
    const isLastAssistant =
      msg.role === "assistant" && idx === messages.length - 1
    const mcpMeta = isLastAssistant ? parseMcpMetadata(raw) : null
    return {
      id: msg.id,
      role: msg.role === "system" ? ("assistant" as const) : (msg.role as "user" | "assistant"),
      content,
      timestamp: 0,
      executionMeta: stored?.executionMeta ?? mcpMeta?.executionMeta,
      evidence: stored?.evidence ?? mcpMeta?.evidence,
      liveSignals: stored?.liveSignals ?? mcpMeta?.liveSignals,
      debate: stored?.debate ?? mcpMeta?.debate,
      toolTraces: stored?.toolTraces ?? mcpMeta?.toolTraces,
    }
  })

  return (
    <ChatLayout>
      <ChatMessages messages={displayMessages} isLoading={isLoading} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
      {error && (
        <div className="mx-auto max-w-[1200px] px-6 pb-2">
          <div className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
            {error.message.includes("image")
              ? "This model doesn't support image inputs. Please try a text-only query."
              : `Error: ${error.message}`}
          </div>
        </div>
      )}
    </ChatLayout>
  )
}

function getMessageContent(msg: UIMessage): string {
  const text = msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")

  const reasoning = msg.parts
    .filter((p): p is { type: "reasoning"; text: string } => p.type === "reasoning")
    .map((p) => p.text)
    .join("")

  if (text) return text
  if (reasoning) {
    return `_Reasoning…_\n\n${reasoning}`
  }
  return ""
}

function toUIMessage(msg: Message): UIMessage {
  return {
    id: msg.id,
    role: msg.role,
    parts: [{ type: "text" as const, text: msg.content }],
  }
}

function fromUIMessage(msg: UIMessage): Omit<Message, "timestamp"> & { timestamp: number } {
  return {
    id: msg.id,
    role: msg.role === "system" ? "assistant" : (msg.role as "user" | "assistant"),
    content: getMessageContent(msg),
    timestamp: Date.now(),
  }
}
