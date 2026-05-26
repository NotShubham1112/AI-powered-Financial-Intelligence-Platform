import { z } from "zod"

// ============================================================================
// ARTIFACT SCHEMA - AI generates this semantic structure, not UI code
// ============================================================================

const ContentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    level: z.enum(["2", "3", "4"]).transform(v => parseInt(v) as 2 | 3 | 4).optional(),
    content: z.string(),
  }),
  z.object({
    type: z.literal("paragraph"),
    content: z.string(),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal("blockquote"),
    content: z.string(),
  }),
  z.object({
    type: z.literal("code"),
    content: z.string(),
    language: z.string().optional(),
  }),
  z.object({
    type: z.literal("emphasis"),
    content: z.string(),
  }),
])

const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  subtext: z.string().optional(),
})

const ChartSchema = z.object({
  type: z.enum(["revenue", "margin", "market-share", "line", "bar", "pie"]),
  title: z.string(),
  data: z.array(z.record(z.string(), z.any())),
})

const TableSchema = z.object({
  title: z.string(),
  data: z.object({
    columns: z.array(z.string()),
    rows: z.array(z.record(z.string(), z.any())),
  }),
})

const SectionSchema = z.object({
  title: z.string(),
  content: z.array(ContentBlockSchema),
})

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
  }).optional(),
})

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
