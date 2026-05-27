import type { Domain, ReasoningSummary, RoutedStepResult } from "./types"

const DOMAIN_LABELS: Record<Domain, string> = {
  technology_research: "Researching technology ecosystem",
  macroeconomic_analysis: "Analyzing macroeconomic indicators",
  financial_portfolio_analysis: "Evaluating portfolio metrics",
  startup_analysis: "Analyzing startup landscape",
  policy_analysis: "Analyzing policy implications",
  market_intelligence: "Gathering market intelligence",
  scientific_research: "Reviewing scientific literature",
  coding: "Implementing solution",
  debugging: "Investigating issue",
  general: "Analyzing query",
}

const DOMAIN_FRIENDLY_PREFIXES: Record<Domain, string[]> = {
  technology_research: [
    "Researching market sizing and projections",
    "Analyzing infrastructure and policy trends",
    "Evaluating talent ecosystem and enterprise adoption",
    "Comparing growth metrics and competitive landscape",
    "Assessing bottlenecks and risk factors",
  ],
  macroeconomic_analysis: [
    "Analyzing economic indicators and trends",
    "Evaluating fiscal and monetary policy",
    "Assessing sector and market conditions",
    "Reviewing risk factors and tail risks",
    "Synthesizing macro outlook",
  ],
  financial_portfolio_analysis: [
    "Analyzing portfolio composition and risk",
    "Evaluating asset class performance",
    "Assessing allocation and diversification",
    "Generating optimization recommendations",
  ],
  startup_analysis: [
    "Analyzing startup fundamentals",
    "Evaluating market positioning",
    "Assessing growth metrics and unit economics",
    "Comparing competitive landscape",
  ],
  policy_analysis: [
    "Analyzing regulatory framework",
    "Evaluating policy implications",
    "Assessing compliance landscape",
    "Reviewing strategic recommendations",
  ],
  market_intelligence: [
    "Researching market trends and sizing",
    "Analyzing competitive dynamics",
    "Evaluating growth drivers",
    "Assessing barriers and opportunities",
  ],
  scientific_research: [
    "Reviewing literature and methodology",
    "Analyzing findings and data",
    "Evaluating statistical significance",
    "Synthesizing conclusions",
  ],
  coding: [
    "Understanding requirements",
    "Designing solution architecture",
    "Implementing code",
    "Testing and verifying",
  ],
  debugging: [
    "Reproducing the issue",
    "Analyzing root cause",
    "Identifying fix",
    "Verifying resolution",
  ],
  general: [
    "Analyzing query context",
    "Gathering relevant information",
    "Evaluating options",
    "Synthesizing response",
  ],
}

export function createStepSummary(
  stepIndex: number,
  stepTitle: string,
  domain: Domain
): ReasoningSummary {
  const prefixes = DOMAIN_FRIENDLY_PREFIXES[domain] ?? DOMAIN_FRIENDLY_PREFIXES.general
  const prefix = prefixes[Math.min(stepIndex, prefixes.length - 1)] ?? "Processing step"

  return {
    stage: "executing",
    message: `${prefix}...`,
    details: [stepTitle],
  }
}

export function createDomainSummary(domain: Domain): ReasoningSummary {
  const label = DOMAIN_LABELS[domain] ?? "Analyzing query"
  return {
    stage: "planning",
    message: `${label}...`,
  }
}

export function createReasoningHeader(
  domain: Domain,
  planSteps: string[]
): string {
  const label = DOMAIN_LABELS[domain] ?? "Researching"
  const collapsed = planSteps.length <= 3
    ? planSteps.join(" → ")
    : `${planSteps[0]} → ${planSteps[1]} → ... (${planSteps.length} steps)`

  return [
    `<details>`,
    `<summary>${label} — ${collapsed}</summary>`,
    "",
  ].join("\n")
}

export function createReasoningFooter(): string {
  return ["", `</details>`, ""].join("\n")
}

export function synthesizeFinalSummary(
  results: RoutedStepResult[],
  domain: Domain
): string {
  const successCount = results.filter((r) => {
    const text = r.output || ""
    return !text.includes("error") && !text.includes("failed") && !text.includes("unavailable")
  }).length

  const label = DOMAIN_LABELS[domain] ?? "Analysis"
  const total = results.length

  if (successCount === total) {
    return `${label} complete — all ${total} analysis steps finished successfully.`
  }

  return `${label} complete — ${successCount}/${total} analysis steps completed.`
}