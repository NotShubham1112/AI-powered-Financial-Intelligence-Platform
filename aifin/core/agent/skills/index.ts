import type { SkillDefinition, SkillResult } from "../types"
import { riskModel } from "./risk-model"
import { portfolioBuilder } from "./portfolio-builder"
import { trendAnalyzer } from "./trend-analyzer"
import { tableBuilder } from "./table-builder"
import { chartBuilder } from "./chart-builder"
import { reportGenerator } from "./report-generator"

export const SKILL_REGISTRY: Record<string, SkillDefinition> = {
  "/skills/risk_model": {
    name: "/skills/risk_model",
    description: "Compute portfolio risk score, Sharpe ratio, volatility, category",
    requiredInputs: ["assets", "weights"],
    domain: ["financial_portfolio_analysis"],
    run: (params) => riskModel(params) as SkillResult,
  },
  "/skills/portfolio_builder": {
    name: "/skills/portfolio_builder",
    description: "Build optimized portfolio allocation by risk tolerance and goals",
    requiredInputs: ["goals", "constraints", "riskTolerance"],
    domain: ["financial_portfolio_analysis"],
    run: (params) => portfolioBuilder(params) as SkillResult,
  },
  "/skills/trend_analyzer": {
    name: "/skills/trend_analyzer",
    description: "Analyze trend direction, strength, RSI, momentum from data points",
    requiredInputs: ["dataPoints"],
    domain: ["financial_portfolio_analysis", "market_intelligence", "macroeconomic_analysis"],
    run: (params) => trendAnalyzer(params) as SkillResult,
  },
  "/skills/table_builder": {
    name: "/skills/table_builder",
    description: "Format data as markdown table with headers and rows",
    requiredInputs: ["headers", "rows"],
    domain: ["technology_research", "macroeconomic_analysis", "financial_portfolio_analysis", "market_intelligence", "general"],
    run: (params) => tableBuilder(params) as SkillResult,
  },
  "/skills/chart_builder": {
    name: "/skills/chart_builder",
    description: "Generate chart-ready JSON for Recharts rendering (line/bar/pie/area)",
    requiredInputs: ["type", "labels", "datasets"],
    domain: ["technology_research", "macroeconomic_analysis", "financial_portfolio_analysis", "market_intelligence", "general"],
    run: (params) => chartBuilder(params) as SkillResult,
  },
  "/skills/report_generator": {
    name: "/skills/report_generator",
    description: "Build structured report sections with formatting",
    requiredInputs: ["sections"],
    domain: ["technology_research", "macroeconomic_analysis", "financial_portfolio_analysis", "market_intelligence", "policy_analysis", "general"],
    run: (params) => reportGenerator(params) as SkillResult,
  },
}

export function getSkill(name: string): SkillDefinition | undefined {
  return SKILL_REGISTRY[name]
}

export function validateSkillInputs(
  name: string,
  params: Record<string, unknown>,
  domain?: string
): { valid: boolean; reason?: string } {
  const skill = getSkill(name)
  if (!skill) {
    return { valid: false, reason: `Skill not found: ${name}` }
  }

  // Check domain relevance
  if (domain && skill.domain.length > 0) {
    const isDomainMatch = skill.domain.includes(domain as any)
    if (!isDomainMatch) {
      return {
        valid: false,
        reason: `Domain mismatch: "${domain}" is not in skill's allowed domains [${skill.domain.join(", ")}]`,
      }
    }
  }

  // Check required inputs
  for (const required of skill.requiredInputs) {
    if (params[required] === undefined || params[required] === null) {
      return {
        valid: false,
        reason: `Missing required input: "${required}"`,
      }
    }
  }

  return { valid: true }
}

export function executeSkill(
  name: string,
  params: Record<string, unknown>,
  domain?: string
): SkillResult | Promise<SkillResult> {
  const skill = getSkill(name)
  if (!skill) {
    return { success: false, data: {}, error: `Skill not found: ${name}` }
  }

  // Validate before execution
  const validation = validateSkillInputs(name, params, domain)
  if (!validation.valid) {
    return { success: false, data: {}, error: validation.reason! }
  }

  return skill.run(params)
}

export function listSkills(): SkillDefinition[] {
  return Object.values(SKILL_REGISTRY)
}
