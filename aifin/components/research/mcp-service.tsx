/**
 * MCP SERVICE LAYER
 * 
 * Maps semantic artifact data to React components
 * Acts as the bridge between LLM-generated JSON and UI rendering
 * 
 * Flow:
 * 1. LLM generates ResearchArtifact JSON
 * 2. validateArtifact() ensures it matches schema
 * 3. mapArtifactToComponents() converts to React components
 * 4. MCPRenderer displays the result
 */

import React from "react"
import { ResearchArtifact, validateArtifact } from "./schemas"
import { getSafeComponent, isComponentSafe } from "./component-registry"
import { ExecutiveSummary } from "./executive-summary"
import { FinancialMetrics } from "./financial-metrics"
import { ChartRenderer } from "./chart-renderer"
import { TableRenderer } from "./table-renderer"
import { ContentRenderer } from "./content-renderer"
import { TypographyH2 } from "./typography"

export interface RenderedComponent {
  id: string
  component: React.ReactNode
  type: string
}

/**
 * Convert artifact to renderable components
 * This is where the "intent → presentation" magic happens
 */
export function mapArtifactToComponents(
  artifact: ResearchArtifact
): RenderedComponent[] {
  const components: RenderedComponent[] = []
  let idCounter = 0

  // 1. Executive Summary (highest priority)
  if (artifact.executive_summary) {
    components.push({
      id: `component-${idCounter++}`,
      type: "executive_summary",
      component: <ExecutiveSummary content={artifact.executive_summary} />,
    })
  }

  // 2. Key Metrics
  if (artifact.key_metrics && artifact.key_metrics.length > 0) {
    components.push({
      id: `component-${idCounter++}`,
      type: "metrics",
      component: <FinancialMetrics metrics={artifact.key_metrics} />,
    })
  }

  // 3. Charts (in order)
  if (artifact.charts) {
    for (const chart of artifact.charts) {
      components.push({
        id: `component-${idCounter++}`,
        type: `chart_${chart.type}`,
        component: (
          <ChartRenderer chart={chart as any} />
        ),
      })
    }
  }

  // 4. Custom Sections
  if (artifact.sections) {
    for (const section of artifact.sections) {
      components.push({
        id: `component-${idCounter++}`,
        type: "section",
        component: (
          <div className="border border-zinc-800 rounded-lg bg-black p-6">
            <TypographyH2>{section.title}</TypographyH2>
            <div className="mt-4">
              <ContentRenderer blocks={section.content} />
            </div>
          </div>
        ),
      })
    }
  }

  // 5. Tables
  if (artifact.tables) {
    for (const table of artifact.tables) {
      components.push({
        id: `component-${idCounter++}`,
        type: "table",
        component: (
          <div className="border border-zinc-800 rounded-lg bg-black p-6">
            <TypographyH2>{table.title}</TypographyH2>
            <div className="mt-4">
              <TableRenderer data={table.data} />
            </div>
          </div>
        ),
      })
    }
  }

  return components
}

/**
 * Safe artifact processing pipeline
 * 1. Validate schema
 * 2. Map to components
 * 3. Return error if either step fails
 */
export function processingArtifact(data: unknown): {
  success: boolean
  components?: RenderedComponent[]
  error?: string
} {
  try {
    const artifact = validateArtifact(data)
    const components = mapArtifactToComponents(artifact)
    return { success: true, components }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid artifact"
    return {
      success: false,
      error: `Artifact validation failed: ${message}`,
    }
  }
}

/**
 * Generate LLM context about available components
 * Use this in system prompt to guide artifact generation
 */
export function getComponentContext(): string {
  return `
You are generating ResearchArtifact JSON for institutional financial analysis.
The frontend will render this as typed React components.

Available artifact structure:
{
  "executive_summary": "string", // Brief analysis overview
  "key_metrics": [
    { "label": "string", "value": "string", "subtext": "string?" }
  ],
  "charts": [
    {
      "type": "revenue|margin|market-share|line|bar|pie",
      "title": "string",
      "data": [{ "year|name": "string", "value|revenue|margin": number }]
    }
  ],
  "tables": [
    {
      "title": "string",
      "data": {
        "columns": ["string"],
        "rows": [{ "column": "value" }]
      }
    }
  ],
  "sections": [
    {
      "title": "string",
      "content": [
        { "type": "paragraph|heading|list|blockquote|code", ... }
      ]
    }
  ]
}

IMPORTANT:
- Generate SEMANTIC INTENT, not UI code
- Each chart/table/section maps to a specific React component
- The frontend controls typography, spacing, and visual rendering
- Your data drives the content; the UI layer handles presentation
`
}
