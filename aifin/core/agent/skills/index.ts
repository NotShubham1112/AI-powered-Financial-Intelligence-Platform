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
    run: (params) => riskModel(params) as SkillResult,
  },
  "/skills/portfolio_builder": {
    name: "/skills/portfolio_builder",
    description: "Build optimized portfolio allocation by risk tolerance and goals",
    run: (params) => portfolioBuilder(params) as SkillResult,
  },
  "/skills/trend_analyzer": {
    name: "/skills/trend_analyzer",
    description: "Analyze trend direction, strength, RSI, momentum from data points",
    run: (params) => trendAnalyzer(params) as SkillResult,
  },
  "/skills/table_builder": {
    name: "/skills/table_builder",
    description: "Format data as markdown table with headers and rows",
    run: (params) => tableBuilder(params) as SkillResult,
  },
  "/skills/chart_builder": {
    name: "/skills/chart_builder",
    description: "Generate chart-ready JSON for Recharts rendering (line/bar/pie/area)",
    run: (params) => chartBuilder(params) as SkillResult,
  },
  "/skills/report_generator": {
    name: "/skills/report_generator",
    description: "Build structured report sections with formatting",
    run: (params) => reportGenerator(params) as SkillResult,
  },
}

export function getSkill(name: string): SkillDefinition | undefined {
  return SKILL_REGISTRY[name]
}

export function executeSkill(name: string, params: Record<string, unknown>): SkillResult | Promise<SkillResult> {
  const skill = getSkill(name)
  if (!skill) {
    return { success: false, data: {}, error: `Skill not found: ${name}` }
  }
  return skill.run(params)
}

export function listSkills(): SkillDefinition[] {
  return Object.values(SKILL_REGISTRY)
}
