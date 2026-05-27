import { create } from "zustand"

export interface ToolTrace {
  id: string
  toolName: string
  status: "running" | "complete" | "error"
  message: string
}

export interface EvidenceClaim {
  claimId: string
  claim: string
  source: string
  confidence: number
  freshnessDays: number
  toolName: string
  verified?: boolean
}

export interface LiveSignal {
  label: string
  direction: string
  detail: string
  sourceTool: string
}

export interface McpDebate {
  reconciliation?: string
  adjustedConfidence?: number
  resolution?: string
  bullThesis?: Array<{ agent: string; thesis: string; confidence: number }>
  riskThesis?: Array<{ agent: string; thesis: string; confidence: number }>
}

export interface ExecutionMeta {
  runId: string
  toolsUsed: string[]
  agentsParticipated: string[]
  workflowRuntimeMs: number
  confidence: number
  contradictionScore?: number
  resolution?: string
}

export interface ChartData {
  type: "bar" | "line" | "area" | "pie"
  title: string
  description?: string
  config: Record<string, { label: string; color?: string }>
  data: Record<string, string | number>[]
  xKey: string
  yKeys: string[]
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  toolTraces?: ToolTrace[]
  charts?: ChartData[]
  executionMeta?: ExecutionMeta
  evidence?: EvidenceClaim[]
  liveSignals?: LiveSignal[]
  debate?: McpDebate
}

export interface RuntimeStatus {
  stage: string
  model: string | null
  fallbackCount: number
  isRecovering: boolean
  lastHeartbeat: number
}

export interface AgentTodo {
  id: string
  title: string
  status: "not-started" | "in-progress" | "completed"
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export type AgentModeToggle = "auto" | "reason" | "fast" | "deep"

interface ChatState {
  sessions: ChatSession[]
  activeSessionId: string | null
  isStreaming: boolean
  isThinking: boolean
  isSidebarOpen: boolean
  isArtifactOpen: boolean
  activeArtifactId: string | null
  streamContent: string
  selectedModel: string
  setSelectedModel: (model: string) => void
  runtimeStatus: RuntimeStatus | null
  setRuntimeStatus: (status: RuntimeStatus | null) => void
  agentTodos: AgentTodo[]
  setAgentTodos: (todos: AgentTodo[]) => void
  addAgentTodo: (todo: AgentTodo) => void
  updateAgentTodo: (id: string, updates: Partial<AgentTodo>) => void

  // Agent mode state
  agentEnabled: boolean
  setAgentEnabled: (enabled: boolean) => void
  agentMode: AgentModeToggle
  setAgentMode: (mode: AgentModeToggle) => void
  devMode: boolean
  setDevMode: (mode: boolean) => void

  getActiveSession: () => ChatSession | undefined
  getActiveMessages: () => Message[]

  createSession: () => string
  deleteSession: (id: string) => void
  setActiveSession: (id: string) => void
  addMessage: (message: Message) => void
  updateLastAssistantMessage: (updates: Partial<Message>) => void
  setStreaming: (isStreaming: boolean) => void
  setThinking: (isThinking: boolean) => void
  setStreamContent: (content: string) => void
  appendStreamContent: (chunk: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleArtifact: () => void
  setArtifactOpen: (open: boolean) => void
  setActiveArtifact: (id: string | null) => void
}

const DEFAULT_SESSION_ID = "default"

const sampleSessions: ChatSession[] = [
  {
    id: DEFAULT_SESSION_ID,
    title: "NVIDIA Earnings Analysis",
    messages: [],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: "session-2",
    title: "Portfolio Risk Assessment",
    messages: [],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 43200000,
  },
  {
    id: "session-3",
    title: "AAPL vs MSFT Comparison",
    messages: [],
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 86400000,
  },
]

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: sampleSessions,
  activeSessionId: DEFAULT_SESSION_ID,
  isStreaming: false,
  isThinking: false,
  isSidebarOpen: true,
  isArtifactOpen: false,
  activeArtifactId: null,
  streamContent: "",
  selectedModel: "google/gemini-flash:free",
  setSelectedModel: (model) => set({ selectedModel: model }),
  runtimeStatus: null,
  setRuntimeStatus: (runtimeStatus) => set({ runtimeStatus }),
  agentTodos: [],
  setAgentTodos: (agentTodos) => set({ agentTodos }),
  addAgentTodo: (todo) =>
    set((state) => ({
      agentTodos: [...state.agentTodos, todo],
    })),
  updateAgentTodo: (id, updates) =>
    set((state) => ({
      agentTodos: state.agentTodos.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  agentEnabled: false,
  setAgentEnabled: (agentEnabled) => set({ agentEnabled }),
  agentMode: "auto",
  setAgentMode: (agentMode) => set({ agentMode }),
  devMode: false,
  setDevMode: (devMode) => set({ devMode }),

  getActiveSession: () => {
    const { sessions, activeSessionId } = get()
    return sessions.find((s) => s.id === activeSessionId)
  },

  getActiveMessages: () => {
    const session = get().getActiveSession()
    return session?.messages ?? []
  },

  createSession: () => {
    const id = `session-${Date.now()}`
    const session: ChatSession = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: id,
    }))
    return id
  },

  deleteSession: (id) => {
    set((state) => {
      const filtered = state.sessions.filter((s) => s.id !== id)
      const newActive =
        state.activeSessionId === id
          ? filtered[0]?.id ?? null
          : state.activeSessionId
      return { sessions: filtered, activeSessionId: newActive }
    })
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id })
  },

  addMessage: (message) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === state.activeSessionId
          ? {
              ...s,
              messages: [...s.messages, message],
              updatedAt: Date.now(),
              title:
                s.title === "New Chat" && message.role === "user"
                  ? message.content.slice(0, 60)
                  : s.title,
            }
          : s
      ),
    }))
  },

  updateLastAssistantMessage: (updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === state.activeSessionId && s.messages.length > 0
          ? {
              ...s,
              messages: s.messages.map((m, i) =>
                i === s.messages.length - 1 && m.role === "assistant"
                  ? { ...m, ...updates }
                  : m
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }))
  },

  setStreaming: (isStreaming) => set({ isStreaming }),
  setThinking: (isThinking) => set({ isThinking }),
  setStreamContent: (content) => set({ streamContent: content }),
  appendStreamContent: (chunk) =>
    set((state) => ({ streamContent: state.streamContent + chunk })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleArtifact: () =>
    set((state) => ({ isArtifactOpen: !state.isArtifactOpen })),
  setArtifactOpen: (open) => set({ isArtifactOpen: open }),
  setActiveArtifact: (id) => set({ activeArtifactId: id }),
}))
