import { z } from "zod"

// ============================================================================
// ARTIFACT SCHEMA - AI generates this semantic structure, not UI code
// ============================================================================

const ContentBlockSchema = z.object({
  type: z.enum(["heading", "paragraph", "list", "blockquote", "code", "emphasis"]),
  level: z.union([z.literal(2), z.literal(3), z.literal(4), z.string().transform(v => parseInt(v) as 2 | 3 | 4).pipe(z.union([z.literal(2), z.literal(3), z.literal(4)]))]).optional(),
  content: z.string().optional(),
  items: z.array(z.string()).optional(),
  language: z.string().optional(),
}).passthrough()

const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  subtext: z.string().optional(),
}).passthrough()

export const ChartSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  data: z.array(z.record(z.string(), z.any())).default([]),
  config: z.record(z.string(), z.object({ label: z.string(), color: z.string().optional() })).optional(),
  xKey: z.string().optional(),
  yKeys: z.array(z.string()).optional(),
}).passthrough()

export const TableSchema = z.object({
  title: z.string(),
  data: z.object({
    columns: z.array(z.string()).default([]),
    rows: z.array(z.record(z.string(), z.any())).default([]),
  }).passthrough().default({ columns: [], rows: [] }),
}).passthrough()

const SectionSchema = z.object({
  title: z.string(),
  content: z.array(ContentBlockSchema).default([]),
}).passthrough()

export const ResearchArtifactSchema = z.object({
  executive_summary: z.string().optional(),
  key_metrics: z.array(MetricSchema).optional(),
  charts: z.array(ChartSchema).optional(),
  tables: z.array(TableSchema).optional(),
  sections: z.array(SectionSchema).optional(),
  metadata: z.object({
    timestamp: z.number().optional(),
    model: z.string().optional(),
    version: z.string().optional(),
  }).passthrough().optional(),
}).passthrough()

export type ResearchArtifact = z.infer<typeof ResearchArtifactSchema>
export type ContentBlock = z.infer<typeof ContentBlockSchema>
export type Metric = z.infer<typeof MetricSchema>
export type Chart = z.infer<typeof ChartSchema>
export type Table = z.infer<typeof TableSchema>
export type Section = z.infer<typeof SectionSchema>

/**
 * Validate and parse artifact from AI
 * Throws if schema is invalid - prevents broken UI generation
 */
export function validateArtifact(data: unknown): ResearchArtifact {
  return ResearchArtifactSchema.parse(data)
}

/**
 * Safe validation - returns null if invalid instead of throwing
 */
export function tryValidateArtifact(data: unknown): ResearchArtifact | null {
  const result = ResearchArtifactSchema.safeParse(data)
  return result.success ? result.data : null
}

/**
 * Soft-validate individual chart item.
 * Returns parsed data if valid, null if invalid (doesn't throw).
 */
export function tryValidateChart(data: unknown): Chart | null {
  const result = ChartSchema.safeParse(data)
  return result.success ? result.data : null
}

/**
 * Soft-validate individual table item.
 * Returns parsed data if valid, null if invalid (doesn't throw).
 */
export function tryValidateTable(data: unknown): Table | null {
  const result = TableSchema.safeParse(data)
  return result.success ? result.data : null
}
