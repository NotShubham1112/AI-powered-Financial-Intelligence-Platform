"use client"

import React from "react"
import { validateArtifact } from "./schemas"
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
      // 1. Validate artifact matches schema
      const validated = validateArtifact(artifact)

      // 2. Map to React components
      const rendered = mapArtifactToComponents(validated)

      // 3. Extract components for rendering
      setComponents(rendered.map((item) => item.component))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid artifact"
      setError(message)
      setComponents([])
    }
  }, [artifact])

  if (error) {
    return (
      <div className="border border-red-900 rounded-lg bg-black p-6 mb-6">
        <TypographyLarge>Artifact Rendering Error</TypographyLarge>
        <p className="text-red-400 text-sm mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {components.map((component, idx) => (
        <div key={idx} className="animate-in fade-in duration-500">
          {component}
        </div>
      ))}
    </div>
  )
}
