"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Brain } from "lucide-react"

interface ResearchPlanProps {
  content: string
  completedSteps: string[]
}

export function ResearchPlan({ content, completedSteps }: ResearchPlanProps) {
  const agentPlanMatch = content.match(/\[AGENT_PLAN\]([\s\S]*?)\[\/AGENT_PLAN\]/)

  if (!agentPlanMatch) return null

  const planText = agentPlanMatch[1].trim()
  const lines = planText.split(/\n/)
  const goalLine = lines.find((l) => l.startsWith("Goal:"))
  const steps = lines
    .filter((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith("Goal:")) return false
      if (trimmed === "Plan:") return false
      return /^\d+\.\s*|^[-*]\s*/.test(trimmed)
    })
    .map((line) => line.replace(/^\d+\.\s*|^[-*]\s*/, "").trim())
    .filter(Boolean)

  if (steps.length === 0) return null

  return (
    <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-amber-400/80">
            Agent Plan
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/40">
          {completedSteps.length}/{steps.length} completed
        </span>
      </div>
      {goalLine && (
        <p className="mb-2 text-[11px] italic text-muted-foreground/70">
          {goalLine.replace("Goal:", "").trim()}
        </p>
      )}
      <div className="grid gap-1.5">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.length > i
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                isCompleted ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              ) : (
                <Circle className="h-3 w-3 text-muted-foreground/30" />
              )}
              <span className={cn(isCompleted && "line-through opacity-70")}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
