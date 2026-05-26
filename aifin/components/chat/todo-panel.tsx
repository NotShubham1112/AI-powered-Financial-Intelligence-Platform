"use client"

import React from "react"
import { CheckCircle, Circle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useChatStore, type AgentTodo } from "@/stores/chat-store"
import { cn } from "@/lib/utils"

export function TodoPanel() {
  const agentTodos = useChatStore((s) => s.agentTodos)
  const isThinking = useChatStore((s) => s.isThinking)

  // Only show if planning is active or there are todos
  if (!isThinking && agentTodos.length === 0) return null

  const todos = agentTodos
  const completed = todos.filter((t) => t.status === "completed").length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 border border-border text-muted-foreground/60 hover:bg-accent hover:text-foreground transition-colors"
        >
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span className="text-[12px] font-medium">Todos ({completed}/{todos.length})</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-sm font-medium">Todos ({completed}/{todos.length})</div>
        </div>
        <div className="max-h-56 overflow-auto px-1 py-2">
          <ul className="space-y-2">
            {todos.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <div className="mt-1">
                  {t.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : t.status === "in-progress" ? (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/40 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    </div>
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={cn("text-sm", t.status === "completed" ? "line-through opacity-70" : "")}>{t.title}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TodoPanel

/* Usage example in agent:
const { addAgentTodo, updateAgentTodo } = useChatStore.getState()
addAgentTodo({ id: '1', title: 'Fetch market data', status: 'in-progress' })
updateAgentTodo('1', { status: 'completed' })
*/
