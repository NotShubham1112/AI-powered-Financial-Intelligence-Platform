// Core renderers
export { ReportTypography } from "./report-typography"
export { ArtifactRenderer } from "./artifact-renderer"
export { ChartRenderer } from "./chart-renderer"
export { TableRenderer } from "./table-renderer"
export { ContentRenderer, type ContentBlock } from "./content-renderer"

// UI Components
export { MetricCard } from "./metric-card"
export { ExecutiveSummary } from "./executive-summary"
export { FinancialMetrics, type Metric } from "./financial-metrics"
export { ResearchLayout } from "./research-layout"

// Charts
export { RevenueChart } from "./charts/revenue-chart"
export { MarketShareChart } from "./charts/market-share-chart"
export { MarginChart } from "./charts/margin-chart"

// Typography (semantic HTML)
export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyList,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
  TypographyCode,
  TypographyStrong,
} from "./typography"

// MCP/Component System
export {
  type ResearchArtifact,
  type ContentBlock as SchemaContentBlock,
  type Metric as SchemaMetric,
  type Chart,
  type Table,
  type Section,
  validateArtifact,
  tryValidateArtifact,
  ResearchArtifactSchema,
} from "./schemas"

export {
  COMPONENT_REGISTRY,
  type ComponentType,
  componentMap,
  getSafeComponent,
  isComponentSafe,
  getAvailableComponents,
} from "./component-registry"

export {
  type RenderedComponent,
  mapArtifactToComponents,
  processingArtifact,
  getComponentContext,
} from "./mcp-service"
