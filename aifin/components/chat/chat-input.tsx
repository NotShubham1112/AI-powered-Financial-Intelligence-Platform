"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { ArrowUp, Paperclip } from "lucide-react"
import { DotmSquare11 } from "@/components/ui/dotm-square-11"
import { SlashCommandPopover } from "./slash-command-popover"
import { useChatStore } from "@/stores/chat-store"
import { TerminalPanel } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"
import { cn } from "@/lib/utils"
import { OPENROUTER_MODELS } from "@/lib/openrouter"
import TodoPanel from "./todo-panel"
import { Brain, MessageSquare } from "lucide-react"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  placeholder?: string
  onAgentToggle?: () => void
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  placeholder = "Submit research query or /command",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashInput, setSlashInput] = useState("")

  const selectedModel = useChatStore((s) => s.selectedModel)
  const setSelectedModel = useChatStore((s) => s.setSelectedModel)
  const agentEnabled = useChatStore((s) => s.agentEnabled)
  const setAgentEnabled = useChatStore((s) => s.setAgentEnabled)
  const agentMode = useChatStore((s) => s.agentMode)
  const setAgentMode = useChatStore((s) => s.setAgentMode)

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setInput(value)
      if (value.startsWith("/")) {
        setShowSlashMenu(true)
        setSlashInput(value)
      } else {
        setShowSlashMenu(false)
      }
    },
    [setInput]
  )

  const handleCommandSelect = useCallback(
    (command: string) => {
      setShowSlashMenu(false)
      setInput(command + " ")
      textareaRef.current?.focus()
    },
    [setInput]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (input.trim() && !isLoading) {
          ;(e.target as HTMLTextAreaElement).closest("form")?.requestSubmit()
        }
      }
    },
    [input, isLoading]
  )

  return (
    <div className="flex-shrink-0 border-t border-border bg-background px-6 py-4">
      <div className="mx-auto max-w-[1200px]">
        <form onSubmit={onSubmit} className="relative">
          <SlashCommandPopover
            isOpen={showSlashMenu}
            onSelect={handleCommandSelect}
            onClose={() => setShowSlashMenu(false)}
            inputValue={slashInput}
          />

          <TerminalPanel
            header={null}
            footer={
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  {/* Active status indicator + Todo panel */}
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]" />
                  </div>
                  <TodoPanel />
                  <div className="h-3 w-px bg-border" />
                  {/* Agent mode toggle */}
                  <button
                    type="button"
                    onClick={() => setAgentEnabled(!agentEnabled)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider font-medium border transition-colors",
                      agentEnabled
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                        : "border-border text-muted-foreground/50 hover:text-muted-foreground"
                    )}
                    title={agentEnabled ? "Agent mode ON - complex queries use planning" : "Agent mode OFF - all queries use chat pipeline"}
                  >
                    {agentEnabled ? (
                      <Brain className="h-3 w-3" />
                    ) : (
                      <MessageSquare className="h-3 w-3" />
                    )}
                    {agentEnabled ? "Agent" : "Chat"}
                  </button>
                  {agentEnabled && (
                    <select
                      value={agentMode}
                      onChange={(e) => setAgentMode(e.target.value as typeof agentMode)}
                      className="bg-transparent text-[10px] uppercase tracking-wider text-muted-foreground outline-none font-medium"
                    >
                      <option value="auto">Auto</option>
                      <option value="reason">Deep</option>
                      <option value="fast">Fast</option>
                    </select>
                  )}
                  <div className="h-3 w-px bg-border" />
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-transparent text-[10px] uppercase tracking-wider text-muted-foreground outline-none font-medium"
                  >
                    {OPENROUTER_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <MetadataLabel>return · send</MetadataLabel>
              </div>
            }
          >
            <div className="flex items-end gap-2 px-3 py-3">
              <button
                type="button"
                disabled={isLoading}
                className="mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center border border-border text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
                title="Attach"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                disabled={isLoading}
                className="min-h-[24px] max-h-[200px] flex-1 resize-none bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
              />

              <button
                type="submit"
                disabled={!input.trim() && !isLoading}
                className={cn(
                  "mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center border transition-colors",
                  isLoading
                    ? "border-border text-muted-foreground/50"
                    : input.trim()
                      ? "border-foreground bg-foreground text-background hover:opacity-90"
                      : "border-border text-muted-foreground/30"
                )}
              >
                {isLoading ? (
                  <DotmSquare11
                    animated
                    speed={1.35}
                    size={22}
                    dotSize={3}
                    pattern="diamond"
                    dotShape="square"
                    ariaLabel="Sending"
                  />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </TerminalPanel>
        </form>
      </div>
    </div>
  )
}
