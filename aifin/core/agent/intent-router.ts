import type { AgentMode, Domain, IntentClassification } from "./types"

// --- Domain taxonomy triggers ---

const DOMAIN_PATTERNS: { domain: Domain; patterns: RegExp[]; weight: number }[] = [
  {
    domain: "technology_research",
    weight: 2,
    patterns: [
      /AI|artificial intelligence|machine learning|deep learning|neural/i,
      /India.*tech|tech.*India|digital India|IndiaAI/i,
      /compute|infrastructure|data center|GPU|semiconductor|chip/i,
      /developer|ecosystem|startup|innovation|patent|R&D/i,
      /adoption|digital transformation|enterprise tech|SaaS|cloud/i,
      /NASSCOM|MeitY|ministry of electronics/i,
      /GitHub|Stanford AI Index|Gartner|Forrester|IDC/i,
      /talent|workforce|skill|engineering|graduate|STEM/i,
      /5G|6G|broadband|internet penetration|digital public/i,
    ],
  },
  {
    domain: "macroeconomic_analysis",
    weight: 2,
    patterns: [
      /GDP|gross domestic product|fiscal deficit|fiscal policy/i,
      /inflation|CPI|WPI|monetary policy|RBI|repo rate/i,
      /unemployment|employment|labor|workforce|job/i,
      /trade deficit|export|import|current account|FDI/i,
      /yield curve|treasury|bond|spread|duration/i,
      /economic (outlook|forecast|projection|indicator)/i,
      /recession|stagflation|soft landing|recovery/i,
    ],
  },
  {
    domain: "financial_portfolio_analysis",
    weight: 2,
    patterns: [
      /\bportfolio\b|\ballocation\b|\brebalance\b|\bdiversif/i,
      /\bassets?\b.*\bweights?\b|\bholdings?\b|\bpositions?\b/i,
      /\bsecurities?\b|\bstocks?\b|\bequities?\b|\bbonds?\b/i,
      /\brisk\b|\bvolatility\b|\bVaR\b|\bSharpe\b|\bBeta\b/i,
      /\binvestment (strategy|thesis|recommendation|universe)/i,
      /\bETF\b|\bmutual fund\b|\bhedge fund\b|\basset manager/i,
      /\binvest\b|\bbuy\b|\bsell\b|\bhold\b|\boverweight\b|\bunderweight\b/i,
      /\byield\b|\bdivi\b|\bcoupon\b|\bmaturity\b|\bcredit rating/i,
    ],
  },
  {
    domain: "startup_analysis",
    weight: 1.5,
    patterns: [
      /\bstartup\b|\bfunding\b|\bventure\b|\bseed\b|\bSeries [ABCDE]\b/i,
      /\bunicorn\b|\bvaluation\b|\bexit\b|\bIPO\b|\bacquisition\b/i,
      /\bpitch\b|\bdeck\b|\bbusiness model\b|\bunit economics\b|\bCAC\b|\bLTV\b/i,
      /\bfounder\b|\bcohort\b|\bmarket (size|share|penetration)/i,
    ],
  },
  {
    domain: "policy_analysis",
    weight: 1.5,
    patterns: [
      /\bpolicy\b|\bregulation\b|\bcompliance\b|\bgovernance\b/i,
      /\bcentral bank\b|\bgovernment\b|\bministry\b|\bparliament\b|\blaw\b/i,
      /\btax\b|\btariff\b|\bsubsidy\b|\bincentive\b|\bPLI\b|\bproduction linked/i,
      /\bDPDP\b|\bdata protection\b|\bprivacy\b|\bcyber\b|\bdigital (policy|regulation)/i,
      /\bMake in India\b|\bAtmanirbhar\b|\bDigital India\b|\bSkill India\b/i,
    ],
  },
  {
    domain: "market_intelligence",
    weight: 1.5,
    patterns: [
      /\bmarket (analysis|size|share|trend|research|intelligence|sizing)\b/i,
      /\bcompetitive (landscape|analysis|intelligence|positioning)\b/i,
      /\bindustry (analysis|report|overview|outlook)\b/i,
      /\bCAGR\b|\bgrowth (rate|trajectory|driver|projection)\b/i,
      /\bPESTEL?\b|\bSWOT\b|\bPorter\b|\bfive forces\b/i,
      /\btotal addressable\b|\bTAM\b|\bSAM\b|\bSOM\b/i,
    ],
  },
  {
    domain: "scientific_research",
    weight: 1.5,
    patterns: [
      /\bresearch paper\b|\bstudy\b|\bexperiment\b|\bclinical trial\b/i,
      /\bhypothesis\b|\bstatistical\b|\bsignificance\b|\bp.value\b/i,
      /\bpeer.review\b|\bjournal\b|\bpublication\b|\bcitation\b/i,
      /\bmethodology\b|\bliterature review\b|\bsystematic review\b/i,
    ],
  },
  {
    domain: "coding",
    weight: 1.5,
    patterns: [
      /\bcode\b|\bprogram\b|\bimplement\b|\bfunction\b|\balgorithm\b/i,
      /\brefactor\b|\bdebug\b|\bfix\b|\bbug\b|\bcompile\b|\bscript\b/i,
      /\bAPI\b|\bendpoint\b|\bdatabase\b|\bquery\b|\bfrontend\b|\bbackend\b/i,
      /\bReact\b|\bNext\.?\b|\bTypeScript\b|\bJavaScript\b|\bPython\b|\bNode\b/i,
      /\bPR\b|\bpull request\b|\bcommit\b|\bpush\b|\bmerge\b|\breview\b/i,
    ],
  },
  {
    domain: "debugging",
    weight: 2,
    patterns: [
      /\b(error|bug|crash|fail|broken|doesn'?t work|not working)\b/i,
      /\b(stack trace|exception|throw|uncaught|undefined|null)\b/i,
      /\bstrange (behavior|output|result)\b/i,
      /\b(debug|fix|troubleshoot|diagnose|investigate) (this|the|an|a)\b/i,
      /why (is|does|are|can'?t|won'?t|didn'?t)/i,
    ],
  },
]

// --- Finance-only keyword blacklist (for preventing false positives) ---

const FINANCE_ONLY_PATTERNS = [
  /\bassets?\b/,
  /\bportfolios?\b/,
  /\bholdings?\b/,
  /\ballocation\b/,
  /\bweights?\b/,
  /\bsecurities?\b/,
]

const TECHNOLOGY_PATTERNS = [
  /\bAI\b|\bartificial intelligence\b|\bmachine learning\b|\bdeep learning\b/i,
  /\bcompute\b|\binfrastructure\b|\bdata center\b|\bGPU\b|\bsemiconductor\b|\bchip\b/i,
  /\bdeveloper\b|\bstartup\b|\binnovation\b|\bpatent\b|\bR&D\b/i,
  /\bdigital\b|\btransformation\b|\benterprise\b|\btech\b|\bSaaS\b|\bcloud\b/i,
  /\bIndia\b|\becosystem\b|\btalent\b|\bworkforce\b|\bskills?\b|\bengineering\b/i,
  /\bNASSCOM\b|\bMeitY\b|\bGitHub\b|\bStanford\b|\bGartner\b|\bIDC\b/i,
  /\badoption\b|\btrend\b|\bmarket sizing\b|\bgrowth\b|\bprojection\b/i,
]

const MACRO_PATTERNS = [
  /\bmacro\b|\beconom\b|\bGDP\b|\binflation\b|\bCPI\b|\bmonetary\b|\bfiscal\b/i,
  /\bmarket\b|\boutlook\b|\bforecast\b|\bprojection\b|\bstrategy\b/i,
]

const COMPLEX_TRIGGERS = [
  "analyze", "build", "portfolio", "strategy", "compare",
  "versus", "vs ", "recommend", "optimize", "evaluate",
  "forecast", "project", "scenario", "allocation", "diversif",
  "rebalance", "risk assessment", "deep dive", "research", "report",
]

const MULTI_ENTITY_PATTERN = /\b(?:and|vs|versus|compare|both)\b.*\b(?:stock|etf|fund|sector|company|market)\b/i
const TIME_SERIES_PATTERN = /\b(?:trend|historical|performance|returns? over|yoy|qoq|trailing)\b/i
const FINANCIAL_DECISION_PATTERN = /\b(?:should I|best|optimal|which|recommend|worth)\b.*\b(?:invest|buy|sell|hold|allocate)\b/i

export function classifyDomain(text: string): Domain {
  const trimmed = text.trim().toLowerCase()

  // Score each domain
  let bestDomain: Domain = "general"
  let bestScore = 0

  for (const entry of DOMAIN_PATTERNS) {
    let score = 0
    for (const pattern of entry.patterns) {
      if (pattern.test(trimmed)) {
        score += entry.weight
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestDomain = entry.domain
    }
  }

  // If score is too low, default to general
  if (bestScore < 1) {
    return "general"
  }

  // Disambiguation: if technology patterns AND finance patterns both match,
  // check which is stronger
  const hasFinanceTerms = FINANCE_ONLY_PATTERNS.some((p) => p.test(trimmed))
  const hasTechTerms = TECHNOLOGY_PATTERNS.some((p) => p.test(trimmed))
  const hasMacroTerms = MACRO_PATTERNS.some((p) => p.test(trimmed))

  if (hasTechTerms && hasFinanceTerms && !hasFinanceTerms && hasMacroTerms) {
    // If tech + macro, route to technology_research or macroeconomic_analysis
    const techScore = TECHNOLOGY_PATTERNS.filter((p) => p.test(trimmed)).length
    const macroScore = MACRO_PATTERNS.filter((p) => p.test(trimmed)).length
    if (techScore >= macroScore) return "technology_research"
    return "macroeconomic_analysis"
  }

  // If it has strong tech signals, override finance
  if (bestDomain === "financial_portfolio_analysis" && hasTechTerms) {
    const techCount = TECHNOLOGY_PATTERNS.filter((p) => p.test(trimmed)).length
    if (techCount >= 3) return "technology_research"
  }

  return bestDomain
}

export function classifyIntent(
  text: string,
  agentEnabled: boolean
): IntentClassification {
  const trimmed = text.trim().toLowerCase()

  if (!trimmed) {
    return { mode: "chat", isComplex: false, requiresPlan: false, domain: "general", confidence: 1 }
  }

  // Handle explicit commands
  if (trimmed.startsWith("/chat ")) {
    return { mode: "chat", isComplex: false, requiresPlan: false, domain: "general", confidence: 1 }
  }
  if (trimmed.startsWith("/reason ")) {
    const domain = classifyDomain(trimmed)
    return { mode: "reason", isComplex: true, requiresPlan: true, domain, confidence: 0.95 }
  }
  if (trimmed.startsWith("/fast ")) {
    const domain = classifyDomain(trimmed)
    return { mode: "fast", isComplex: true, requiresPlan: false, domain, confidence: 0.95 }
  }
  if (trimmed.startsWith("/deep ")) {
    const domain = classifyDomain(trimmed)
    return { mode: "deep", isComplex: true, requiresPlan: true, domain, confidence: 0.95 }
  }

  if (!agentEnabled) {
    return { mode: "chat", isComplex: false, requiresPlan: false, domain: "general", confidence: 1 }
  }

  const domain = classifyDomain(trimmed)

  // Compute complexity score
  const hasComplexTrigger = COMPLEX_TRIGGERS.some((t) => trimmed.includes(t))
  const hasMultiEntity = MULTI_ENTITY_PATTERN.test(trimmed)
  const hasTimeSeries = TIME_SERIES_PATTERN.test(trimmed)
  const hasDecision = FINANCIAL_DECISION_PATTERN.test(trimmed)
  const isLongQuery = trimmed.split(/\s+/).length > 30
  const hasMultipleQuestions = (trimmed.match(/\?/g) || []).length > 1

  // Domain-specific complexity boost
  const domainComplexityBoost =
    domain === "technology_research" ||
    domain === "macroeconomic_analysis" ||
    domain === "market_intelligence" ||
    domain === "policy_analysis"
      ? 1
      : 0

  const complexityScore = [
    hasComplexTrigger,
    hasMultiEntity,
    hasTimeSeries,
    hasDecision,
    isLongQuery,
    hasMultipleQuestions,
  ].filter(Boolean).length + domainComplexityBoost

  // Determine mode based on domain
  const isResearchDomain =
    domain === "technology_research" ||
    domain === "macroeconomic_analysis" ||
    domain === "market_intelligence" ||
    domain === "policy_analysis"

  if (complexityScore >= 2 || (isResearchDomain && isLongQuery)) {
    return { mode: "auto", isComplex: true, requiresPlan: true, domain, confidence: 0.75 }
  }

  if (complexityScore === 1) {
    return { mode: "auto", isComplex: true, requiresPlan: false, domain, confidence: 0.65 }
  }

  return { mode: "auto", isComplex: false, requiresPlan: false, domain, confidence: 0.5 }
}

export function shouldUseAgentPipeline(classification: IntentClassification): boolean {
  return classification.mode !== "chat" && classification.isComplex
}

export function stripCommandPrefix(text: string): string {
  return text.replace(/^\/(chat|reason|fast|deep)\s+/, "").trim()
}