/**
 * INTEGRATION GUIDE: Connecting Research Artifacts to Chat
 * 
 * This file shows exactly how to integrate the research component system
 * into your existing chat application.
 */

// ============================================================================
// STEP 1: Update Chat Message Type
// ============================================================================

// In your chat-store.ts or message type definition:

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  
  // NEW: Add artifact support
  artifact?: {
    type: "research"
    data: any // This will be ResearchArtifact after validation
  }
  
  // Existing fields
  executionMeta?: ExecutionMeta
  evidence?: EvidenceClaim[]
  liveSignals?: LiveSignal[]
  debate?: McpDebate
  toolTraces?: ToolTrace[]
}

// ============================================================================
// STEP 2: Update Chat Message Rendering
// ============================================================================

// In your chat-messages.tsx component:

"use client"

import { Message } from "@/stores/chat-store"
import { ArtifactRenderer, validateArtifact } from "@/components/research"

export function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </div>
  )
}

export function ChatMessage({ message }: { message: Message }) {
  // If message has artifact, render as research output
  if (message.artifact) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-black p-4 mb-4">
        <div className="text-xs text-zinc-500 mb-4 font-semibold">
          RESEARCH ARTIFACT
        </div>
        <ArtifactRenderer artifact={message.artifact.data} />
      </div>
    )
  }

  // Otherwise render as normal chat message
  return (
    <div className={`mb-4 ${message.role === "user" ? "text-right" : ""}`}>
      <div
        className={`inline-block rounded-lg p-4 max-w-2xl ${
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-zinc-900 text-zinc-100 border border-zinc-800"
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

// ============================================================================
// STEP 3: Update Backend Response Handler
// ============================================================================

// In your API route (app/api/chat/route.ts):

import { validateArtifact, tryValidateArtifact } from "@/components/research"

export async function POST(request: Request) {
  // ... existing code ...

  // After getting response from LLM/agents:
  const response = await agent.analyze(query)
  
  // Check if response contains artifact
  const { content, artifact } = response
  
  // Validate artifact if present
  let validatedArtifact = null
  if (artifact) {
    try {
      validatedArtifact = validateArtifact(artifact)
    } catch (error) {
      console.error("Artifact validation failed:", error)
      // Fallback: render just content without artifact
    }
  }

  // Send to frontend
  return {
    content,
    artifact: validatedArtifact ? {
      type: "research",
      data: validatedArtifact
    } : undefined
  }
}

// ============================================================================
// STEP 4: Update Store to Handle Artifacts
// ============================================================================

// In your chat-store.ts:

interface Message {
  // ... existing fields ...
  artifact?: {
    type: "research"
    data: any
  }
}

interface ChatState {
  // ... existing state ...
}

export const useChatStore = create<ChatState>((set) => ({
  // ... existing methods ...

  addMessage: (message: Message) => set((state) => ({
    sessions: state.sessions.map(s =>
      s.id === state.activeSessionId
        ? { ...s, messages: [...s.messages, message] }
        : s
    )
  })),

  updateLastAssistantMessage: (updates: Partial<Message>) =>
    set((state) => {
      const session = state.sessions.find(s => s.id === state.activeSessionId)
      if (!session?.messages.length) return state

      const lastIdx = session.messages.length - 1
      const updated = {
        ...session.messages[lastIdx],
        ...updates
      }

      return {
        sessions: state.sessions.map(s =>
          s.id === state.activeSessionId
            ? {
                ...s,
                messages: [
                  ...s.messages.slice(0, -1),
                  updated
                ]
              }
            : s
        )
      }
    }),
}))

// ============================================================================
// STEP 5: Backend Should Return
// ============================================================================

// Your agent/backend should return response like:

interface ResearchResponse {
  content: string  // Summary text
  artifact: {
    executive_summary: string
    key_metrics: Array<{ label: string; value: string; subtext?: string }>
    charts: Array<{
      type: "revenue" | "margin" | "market-share" | "line" | "bar" | "pie"
      title: string
      data: any[]
    }>
    sections: Array<{
      title: string
      content: Array<{
        type: "paragraph" | "heading" | "list" | "blockquote" | "code"
        content?: string
        items?: string[]
        level?: number
      }>
    }>
  }
}

// ============================================================================
// STEP 6: Streaming Support (Optional)
// ============================================================================

// For streaming artifacts progressively:

export async function* streamingResearchArtifact(query: string) {
  // Step 1: Send summary immediately
  yield {
    type: "artifact_section",
    section: "executive_summary",
    data: await agent.summarize(query)
  }

  // Step 2: Send metrics
  yield {
    type: "artifact_section",
    section: "metrics",
    data: await agent.extractMetrics(query)
  }

  // Step 3: Send charts
  const charts = await agent.generateCharts(query)
  for (const chart of charts) {
    yield {
      type: "artifact_section",
      section: "chart",
      data: chart
    }
  }

  // Step 4: Send detailed analysis
  yield {
    type: "artifact_section",
    section: "analysis",
    data: await agent.deepAnalysis(query)
  }

  // Step 5: Final artifact
  yield {
    type: "artifact_complete",
    data: {
      executive_summary: summary,
      key_metrics: metrics,
      charts: charts,
      sections: sections
    }
  }
}

// ============================================================================
// STEP 7: Example Component Integration
// ============================================================================

// In a new file: components/chat/chat-research-panel.tsx

"use client"

import { ArtifactRenderer } from "@/components/research"
import { Message } from "@/stores/chat-store"

export function ChatResearchPanel({ message }: { message: Message }) {
  if (!message.artifact) return null

  return (
    <div className="w-full bg-black rounded-lg border border-zinc-800 p-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Research Analysis</h2>
        <p className="text-sm text-zinc-400 mt-1">
          {message.artifact.type === "research" ? "AI-Generated Research Artifact" : ""}
        </p>
      </div>

      {/* Content */}
      <ArtifactRenderer artifact={message.artifact.data} />

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          Generated using institutional artifact rendering system
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// CHECKLIST
// ============================================================================

/*
Integration Steps:

- [ ] Add artifact field to Message type
- [ ] Update ChatMessage component to render artifacts
- [ ] Update API route to validate and return artifacts
- [ ] Add artifact handling to chat store
- [ ] Update backend to return structured ResearchArtifact
- [ ] Test with example artifact
- [ ] Add streaming support (optional)
- [ ] Deploy and verify production build

*/
