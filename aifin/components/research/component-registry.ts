import React from "react"
import { ExecutiveSummary } from "./executive-summary"
import { FinancialMetrics } from "./financial-metrics"
import { ChartRenderer } from "./chart-renderer"
import { TableRenderer } from "./table-renderer"
import { ContentRenderer } from "./content-renderer"
import { TypographyH2 } from "./typography"

/**
 * COMPONENT REGISTRY
 * 
 * This is the SINGLE SOURCE OF TRUTH for all UI rendering.
 * LLM generates semantic artifact JSON → registry maps to React components
 * 
 * This approach provides:
 * - Type safety
 * - Consistency
 * - Security (no arbitrary JSX generation)
 * - Traceability (all components are tracked here)
 */

export const COMPONENT_REGISTRY = {
  // Section types
  executive_summary: "ExecutiveSummary",
  metrics: "FinancialMetrics",
  analysis: "AnalysisSection",
  valuation: "ValuationSection",
  risk: "RiskSection",

  // Chart types
  revenue_chart: "RevenueChart",
  margin_chart: "MarginChart",
  market_share: "MarketShareChart",
  performance: "PerformanceChart",

  // Table types
  financials: "FinancialsTable",
  comparison: "ComparisonTable",
  metrics_table: "MetricsTable",

  // Content types
  content_block: "ContentBlock",
  section: "Section",
} as const

export type ComponentType = typeof COMPONENT_REGISTRY[keyof typeof COMPONENT_REGISTRY]

/**
 * Component mapper - converts artifact sections to React components
 * Centralized mapping prevents hallucinated/broken components
 */
export const componentMap = {
  ExecutiveSummary,
  FinancialMetrics,
  RevenueChart: ChartRenderer,
  MarginChart: ChartRenderer,
  MarketShareChart: ChartRenderer,
  ContentBlock: ContentRenderer,
  // Section is handled in mcp-service.tsx with proper JSX
}

/**
 * Get safe component reference from registry
 * Returns null if component doesn't exist in controlled set
 */
export function getSafeComponent(name: string): React.ComponentType<any> | null {
  const component = componentMap[name as keyof typeof componentMap]
  return component || null
}

/**
 * Validate that a component reference is in the registry
 * Prevents LLM from generating arbitrary component names
 */
export function isComponentSafe(name: string): boolean {
  return name in componentMap
}

/**
 * Get all registered component names
 * Useful for LLM context about what components are available
 */
export function getAvailableComponents(): string[] {
  return Object.keys(componentMap)
}
