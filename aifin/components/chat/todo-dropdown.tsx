"use client"

import React, { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { List, Trash2, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Todo = {
  id: string
  text: string
  done: boolean
}

export function TodoDropdown() {
  const [open, setOpen] = useState(false)
  const [todos, setTodos] = useState<Todo[]>(() => [
    { id: "1", text: "Add todo plan", done: false },
  ])
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const add = () => {
    if (!text.trim()) return
    setTodos((t) => [{ id: Date.now().toString(), text: text.trim(), done: false }, ...t])
    setText("")
  }

  const toggle = (id: string) => {
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
  }

  const remove = (id: string) => {
    setTodos((t) => t.filter((x) => x.id !== id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground/60 hover:bg-accent"
          aria-label="Todos"
        >
          <List className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-sm font-medium">Todos</div>
        </div>
        <div className="max-h-48 overflow-auto px-1 py-2">
          {todos.length === 0 && (
            <div className="px-2 text-sm text-muted-foreground">No todos</div>
          )}
          <ul className="space-y-2">
            {todos.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center justify-between gap-2 rounded px-2 py-1",
                  item.done ? "opacity-60" : ""
                )}
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggle(item.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{item.text}</span>
                </label>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-muted-foreground/60 hover:text-destructive"
                  aria-label="Remove todo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2 flex items-center gap-2 px-1">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add()
            }}
            placeholder="Add todo"
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none"
          />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-foreground hover:bg-accent"
            aria-label="Add todo"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TodoDropdown
