"use client"

import React from "react"
import { tryValidateArtifact } from "./schemas"
import { mapArtifactToComponents } from "./mcp-service"
import { TypographyLarge } from "./typography"

/**
 * ARTIFACT RENDERER
 * 
 * Entry point for rendering AI-generated research artifacts.
 * Uses MCP service to safely map semantic JSON → React components.
 * 
 * The LLM generates intent (JSON structure).
 * This component handles presentation (React rendering).
 * This separation ensures professional, consistent UX.
 */

export function ArtifactRenderer({
  artifact,
}: {
  artifact: unknown
}) {
  const [error, setError] = React.useState<string | null>(null)
  const [components, setComponents] = React.useState<React.ReactNode[]>([])

  React.useEffect(() => {
    try {
      // 1. Validate artifact matches schema (graceful fallback)
      const validated = tryValidateArtifact(artifact)

      if (!validated) {
        setError(null)
        setComponents([])
        return
      }

      // 2. Map to React components (per-item validation, skips invalid items)
      const rendered = mapArtifactToComponents(validated)

      // 3. Extract components for rendering
      setComponents(rendered.map((item) => item.component))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(`Render error: ${message}`)
      setComponents([])
    }
  }, [artifact])

  if (error) {
    return (
      <div className="rounded-lg border border-border/40 bg-background p-6 mb-6">
        <TypographyLarge>Unable to render report</TypographyLarge>
        <p className="text-muted-foreground text-sm mt-2">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {components.length === 0 && (
        <div className="rounded-lg border border-border/40 bg-background p-6 mb-6">
          <TypographyLarge>Analysis Result</TypographyLarge>
          <p className="text-muted-foreground text-sm mt-2">
            The analysis was completed but generated no structured data.
          </p>
        </div>
      )}
      {components.map((component, idx) => (
        <div key={idx} className="animate-in fade-in duration-500">
          {component}
        </div>
      ))}
    </div>
  )
}
