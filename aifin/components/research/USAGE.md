/**
 * RESEARCH COMPONENTS USAGE GUIDE
 * 
 * Moving from raw chat rendering to structured institutional artifact platform
 */

// ============================================================================
// 1. ARTIFACT RENDERER - Main entry point for research output
// ============================================================================

import { ArtifactRenderer, type ResearchArtifact } from "@/components/research"

export function ResearchOutput() {
  const artifact: ResearchArtifact = {
    executive_summary: "Your analysis here...",
    key_metrics: [
      { label: "Metric", value: "123", subtext: "annotation" }
    ],
    charts: [
      {
        type: "revenue",
        title: "Growth",
        data: [{ year: "2023", revenue: 100 }]
      }
    ],
    sections: [
      {
        title: "Analysis",
        content: [
          { type: "paragraph", content: "Text..." }
        ]
      }
    ]
  }

  return <ArtifactRenderer artifact={artifact} />
}

// ============================================================================
// 2. SEMANTIC TYPOGRAPHY - Use for structured content
// ============================================================================

import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
  TypographyList,
  TypographyBlockquote,
  TypographyStrong,
  TypographyCode,
} from "@/components/research"

export function AnalysisSection() {
  return (
    <>
      <TypographyH2>Financial Analysis</TypographyH2>
      <TypographyP>
        The company shows <TypographyStrong>strong revenue growth</TypographyStrong>
      </TypographyP>
      <TypographyList
        items={[
          "70% gross margin",
          "85% NRR",
          "Strong cash position"
        ]}
      />
    </>
  )
}

// ============================================================================
// 3. INDIVIDUAL COMPONENTS
// ============================================================================

import {
  ExecutiveSummary,
  FinancialMetrics,
  ChartRenderer,
  TableRenderer,
  ContentRenderer,
} from "@/components/research"

// Render just a section
export function PartialResearch() {
  return (
    <>
      <ExecutiveSummary content="Summary text..." />
      <FinancialMetrics metrics={[
        { label: "Revenue", value: "$100M" }
      ]} />
      <ChartRenderer chart={{
        type: "revenue",
        title: "Growth",
        data: []
      }} />
    </>
  )
}

// ============================================================================
// 4. BACKEND DATA FORMAT (CORRECT)
// ============================================================================

/**
 * Backend should return structured data, NOT markdown tables
 * 
 * WRONG:
 * "| Year | Revenue | Margin |"
 * 
 * CORRECT:
 */
const correctFormat = {
  key_metrics: [
    { label: "Revenue", value: "$61M", subtext: "2023" },
    { label: "Margin", value: "75%", subtext: "Gross" }
  ],
  charts: [
    {
      type: "revenue",
      title: "Revenue Trend",
      data: [
        { year: "2021", revenue: 20 },
        { year: "2022", revenue: 35 },
        { year: "2023", revenue: 61 }
      ]
    }
  ],
  tables: [
    {
      title: "Financials",
      data: {
        columns: ["Year", "Revenue", "Margin"],
        rows: [
          { Year: "2021", Revenue: "$20M", Margin: "72%" },
          { Year: "2022", Revenue: "$35M", Margin: "74%" }
        ]
      }
    }
  ],
  sections: [
    {
      title: "Analysis",
      content: [
        { type: "paragraph", content: "Text..." },
        { type: "list", items: ["Item 1", "Item 2"] }
      ]
    }
  ]
}

// ============================================================================
// 5. STREAMING HYDRATION
// ============================================================================

/**
 * Render sections progressively as they stream from backend
 * This creates professional AI UX
 */

export function StreamingResearch() {
  // Sections arrive incrementally from backend
  return (
    <>
      {/* Section 1: Summary (arrives first) */}
      <ExecutiveSummary content="..." />
      
      {/* Section 2: Metrics (arrives second) */}
      <FinancialMetrics metrics={[]} />
      
      {/* Section 3: Charts (arrives third) */}
      <ChartRenderer chart={{
        type: "revenue",
        title: "Growth",
        data: []
      }} />
      
      {/* Section 4: Deep analysis (arrives last) */}
      <ContentRenderer blocks={[]} />
    </>
  )
}
