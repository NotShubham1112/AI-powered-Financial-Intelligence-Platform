"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  label: string
  description: string
}

const commands: CommandItem[] = [
  { id: "/earnings", label: "/earnings", description: "Analyze latest earnings reports" },
  { id: "/risk", label: "/risk", description: "Portfolio risk assessment" },
  { id: "/portfolio", label: "/portfolio", description: "Portfolio performance analysis" },
  { id: "/market-analysis", label: "/market-analysis", description: "Market overview and sector performance" },
  { id: "/compare", label: "/compare", description: "Compare multiple tickers" },
]

interface SlashCommandPopoverProps {
  isOpen: boolean
  onSelect: (command: string) => void
  onClose: () => void
  inputValue: string
}

export function SlashCommandPopover({
  isOpen,
  onSelect,
  onClose,
  inputValue,
}: SlashCommandPopoverProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = commands.filter((cmd) =>
    cmd.id.startsWith(inputValue.toLowerCase())
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [inputValue])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filtered.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault()
        onSelect(filtered[selectedIndex].id)
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    },
    [isOpen, filtered, selectedIndex, onSelect, onClose]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!isOpen || filtered.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2">
      <div
        ref={listRef}
        className="overflow-hidden border border-border bg-card"
      >
        {filtered.map((cmd, i) => (
          <button
            key={cmd.id}
            onClick={() => onSelect(cmd.id)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
              i === selectedIndex
                ? "bg-accent"
                : "hover:bg-accent/50"
            )}
          >
            <code className="min-w-[100px] font-mono text-xs text-foreground">
              {cmd.label}
            </code>
            <span className="text-[11px] text-muted-foreground/65">
              {cmd.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
