const CB = '```'

export function generateMockResponse(
  userContent: string,
  _messages: unknown[]
): string {
  const lower = userContent.toLowerCase()

  if (lower.includes("earnings") || lower.includes("/earnings")) {
    return generateEarningsResponse()
  }
  if (lower.includes("risk") || lower.includes("/risk")) {
    return generateRiskResponse()
  }
  if (lower.includes("portfolio") || lower.includes("/portfolio")) {
    return generatePortfolioResponse()
  }
  if (lower.includes("market") || lower.includes("/market")) {
    return generateMarketResponse()
  }
  if (
    lower.includes("nvidia") ||
    lower.includes("nvda") ||
    lower.includes("tsla") ||
    lower.includes("aapl") ||
    lower.includes("msft")
  ) {
    return generateStockAnalysis(userContent)
  }

  return generateGeneralResponse()
}

function chart(inner: string): string {
  return CB + "chart:" + inner + "\n" + CB
}

const CHART_DATA: Record<string, { title: string; xKey: string; yKeys: string[]; data: Record<string, string | number>[] }> = {}

function generateEarningsResponse(): string {
  const c = chart(`bar\n${JSON.stringify({
    title: "Revenue by Segment (USD Billions)",
    xKey: "segment",
    yKeys: ["q1_2025", "q1_2026"],
    data: [
      { segment: "Data Center", q1_2025: 18.4, q1_2026: 38.2 },
      { segment: "Gaming", q1_2025: 2.6, q1_2026: 2.8 },
      { segment: "Pro Viz", q1_2025: 0.4, q1_2026: 0.6 },
      { segment: "Auto", q1_2025: 0.3, q1_2026: 0.3 }
    ]
  }, null, 2)}`)

  return [
    "## NVIDIA Q1 FY2026 Earnings Analysis",
    "",
    "### Revenue Breakdown",
    "",
    "| Segment | Q1 FY2026 | Q1 FY2025 | YoY Change |",
    "|---------|-----------|-----------|------------|",
    "| Data Center | $38.2B | $18.4B | +107.6% |",
    "| Gaming | $2.8B | $2.6B | +7.7% |",
    "| Professional Visualization | $0.6B | $0.4B | +50.0% |",
    "| Automotive | $0.3B | $0.3B | 0.0% |",
    "",
    "**Key Metrics:**",
    "- **EPS:** $6.82 (Beat by $0.41)",
    "- **Revenue:** $42.1B (+118% YoY)",
    "- **Gross Margin:** 76.2% (expansion of 540bps)",
    "- **Free Cash Flow:** $27.3B",
    "",
    "### Segment Performance",
    "",
    "Data Center revenue surged 107.6% YoY to $38.2B, driven by continued demand for Hopper and Blackwell GPU platforms. Enterprise AI adoption remains the primary growth catalyst.",
    "",
    c,
    "",
    "### Forward Guidance",
    "",
    "Q2 FY2026 guidance implies $45.0-47.5B in revenue, above consensus of $42.8B. Management highlighted Blackwell ramp as the primary driver, with Hopper demand remaining robust.",
    "",
    "**Key risk factors:**",
    "- Export controls on advanced GPUs to certain markets",
    "- Increasing competition from AMD MI300X and custom ASICs",
    "- Supply chain concentration on TSMC CoWoS packaging",
    "- Valuation at 45x forward P/E versus 5-year average of 35x",
    "",
    "*Data sourced from NVDA Q1 FY2026 earnings release and investor call transcript.*",
  ].join("\n")
}

function generateRiskResponse(): string {
  const c = chart(`bar\n${JSON.stringify({
    title: "Sector Allocation vs Benchmark",
    xKey: "sector",
    yKeys: ["portfolio", "benchmark"],
    data: [
      { sector: "Technology", portfolio: 42, benchmark: 28 },
      { sector: "Healthcare", portfolio: 12, benchmark: 14 },
      { sector: "Financials", portfolio: 15, benchmark: 13 },
      { sector: "Energy", portfolio: 8, benchmark: 11 },
      { sector: "Consumer", portfolio: 10, benchmark: 10 },
      { sector: "Other", portfolio: 13, benchmark: 24 }
    ]
  }, null, 2)}`)

  return [
    "## Portfolio Risk Assessment",
    "",
    "### Current Risk Metrics",
    "",
    "| Metric | Value | Threshold | Status |",
    "|--------|-------|-----------|--------|",
    "| VaR (95%, 1d) | 2.34% | 3.00% | ✓ Normal |",
    "| Beta (vs S&P 500) | 1.15 | <1.20 | ✓ Normal |",
    "| Sharpe Ratio | 1.82 | >1.50 | ✓ Healthy |",
    "| Max Drawdown (90d) | -8.7% | -15.0% | ✓ Normal |",
    "| Correlation to Bonds | 0.22 | <0.50 | ✓ Low |",
    "",
    "### Sector Concentration Risk",
    "",
    c,
    "",
    "### Key Risk Flags",
    "",
    "- **Concentration Risk:** Technology overweight by 14pp vs S&P 500",
    "- **Single-Name Risk:** NVIDIA position at 8.2% of portfolio (max recommended: 5%)",
    "- **Geopolitical Risk:** 18% revenue exposure to China-related markets",
    "- **FX Risk:** 22% non-USD denominated holdings",
    "",
    "### Recommendations",
    "",
    "1. **Reduce** NVIDIA to 5% max position size",
    "2. **Increase** Healthcare allocation to 15%",
    "3. **Add** tail-risk hedges (6-month put spreads on SPX)",
    "4. **Consider** duration-hedged bond exposure for rates risk",
  ].join("\n")
}

function generatePortfolioResponse(): string {
  const c = chart(`bar\n${JSON.stringify({
    title: "Sector Performance (YTD)",
    xKey: "sector",
    yKeys: ["return"],
    data: [
      { sector: "Technology", return: 18.4 },
      { sector: "Healthcare", return: 8.2 },
      { sector: "Financials", return: 11.5 },
      { sector: "Energy", return: -2.1 },
      { sector: "Consumer Cyclical", return: 5.8 }
    ]
  }, null, 2)}`)

  return [
    "## Portfolio Analysis",
    "",
    "### Current Holdings Summary",
    "",
    "| Ticker | Shares | Price | Value | Weight | 1D Chg | YTD |",
    "|--------|--------|-------|-------|--------|--------|-----|",
    "| NVDA | 850 | $824.30 | $700.7K | 8.2% | +2.3% | +62.1% |",
    "| AAPL | 2,400 | $198.50 | $476.4K | 5.6% | +0.8% | +18.4% |",
    "| MSFT | 1,200 | $425.30 | $510.4K | 6.0% | -0.4% | +22.7% |",
    "| AMZN | 1,800 | $178.90 | $322.0K | 3.8% | -0.1% | +14.2% |",
    "| GOOGL | 2,100 | $167.20 | $351.1K | 4.1% | +0.5% | +19.8% |",
    "",
    "**Total Portfolio Value:** $8,542,300",
    "**Cash Position:** $684,200 (8.0%)",
    "**YTD Return:** +14.2%",
    "**vs S&P 500:** +240bps",
    "",
    "### Performance by Sector",
    "",
    c,
    "",
    "### Rebalancing Opportunities",
    "",
    "- **Technology:** Overweight by 12pp - consider taking profits",
    "- **Energy:** Underweight by 4pp - cyclical bottom possible",
    "- **Cash:** 8.0% allocation provides dry powder for drawdowns",
    "",
    "### Tax-Loss Harvesting Candidates",
    "",
    "- No significant loss positions identified in current holdings",
    "- Consider monitoring: energy positions if oil prices continue declining",
  ].join("\n")
}

function generateMarketResponse(): string {
  const c = chart(`bar\n${JSON.stringify({
    title: "S&P 500 Sector Performance (5D)",
    xKey: "sector",
    yKeys: ["return"],
    data: [
      { sector: "Tech", return: 2.8 },
      { sector: "Comm Svcs", return: 2.1 },
      { sector: "Consumer Disc", return: 1.5 },
      { sector: "Healthcare", return: 0.8 },
      { sector: "Financials", return: 0.5 },
      { sector: "Industrials", return: 0.2 },
      { sector: "Energy", return: -0.8 },
      { sector: "Utilities", return: -1.2 }
    ]
  }, null, 2)}`)

  return [
    "## Market Overview",
    "",
    "### Major Indices",
    "",
    "| Index | Last | 1D Chg | 5D Chg | YTD |",
    "|-------|------|--------|--------|-----|",
    "| S&P 500 | 5,892.40 | +0.68% | +1.82% | +8.94% |",
    "| NASDAQ | 18,456.20 | +1.12% | +2.41% | +12.30% |",
    "| DJIA | 39,124.50 | +0.23% | +0.87% | +5.62% |",
    "| VIX | 14.82 | -3.45% | -8.74% | -22.10% |",
    "",
    "### Sector Performance",
    "",
    c,
    "",
    "### Macro Highlights",
    "",
    "| Economic Indicator | Actual | Consensus | Prior |",
    "|-------------------|--------|-----------|-------|",
    "| CPI (YoY) | 3.2% | 3.1% | 3.2% |",
    "| Core PCE (MoM) | 0.2% | 0.2% | 0.3% |",
    "| Employment Change | 228K | 240K | 215K |",
    "| 10Y Treasury | 4.38% | - | 4.42% |",
    "",
    "### Key Events This Week",
    "",
    "- **FOMC Minutes** - Wednesday (dovish tilt expected)",
    "- **PCE Data** - Friday (consensus +0.2% MoM)",
    "- **Earnings:** CRM, DELL, ADSK",
    "- **Treasury Auctions:** $42B 10-year, $28B 30-year",
  ].join("\n")
}

function generateStockAnalysis(userContent: string): string {
  const lower = userContent.toLowerCase()

  if (lower.includes("nvda") || lower.includes("nvidia")) {
    const c = chart(`bar\n${JSON.stringify({
      title: "Quarterly Revenue (USD Billions)",
      xKey: "quarter",
      yKeys: ["revenue"],
      data: [
        { quarter: "Q2 FY25", revenue: 22.4 },
        { quarter: "Q3 FY25", revenue: 26.8 },
        { quarter: "Q4 FY25", revenue: 32.1 },
        { quarter: "Q1 FY26", revenue: 42.1 }
      ]
    }, null, 2)}`)

    return [
      "## NVIDIA Corporation (NVDA) - Deep Dive",
      "",
      "### Company Profile",
      "NVIDIA is the leading designer of graphics processing units (GPUs) and AI accelerator chips. The company has pivoted from gaming to become the dominant supplier of AI training and inference hardware.",
      "",
      "### Key Financial Metrics",
      "",
      "| Metric | Value | Peer Avg | Percentile |",
      "|--------|-------|----------|------------|",
      "| Market Cap | $2.06T | $0.85T | 95th |",
      "| P/E (TTM) | 45.2x | 28.5x | 80th |",
      "| P/S (TTM) | 18.4x | 8.2x | 90th |",
      "| PEG Ratio | 0.85x | 1.45x | 25th |",
      "| Revenue Growth (YoY) | +118% | +12% | 98th |",
      "| Gross Margin | 76.2% | 52.4% | 95th |",
      "| FCF Yield | 2.8% | 3.5% | 55th |",
      "",
      "### Revenue Trajectory",
      "",
      c,
      "",
      "### Analyst Consensus",
      "",
      "| Broker | Rating | Target |",
      "|--------|--------|--------|",
      "| Goldman Sachs | Buy | $1,200 |",
      "| Morgan Stanley | Overweight | $1,050 |",
      "| Bernstein | Outperform | $975 |",
      "| JP Morgan | Neutral | $850 |",
      "",
      "### Key Catalysts",
      "1. **Blackwell B200 ramp** - expected to double inference performance",
      "2. **Enterprise AI adoption** - still in early innings (10-15% penetration)",
      "3. **AI factory buildout** - hyperscaler capex growing 40%+ YoY",
      "4. **Software/ recurring revenue** - CUDA enterprise licensing",
      "",
      "### Key Risks",
      "1. **Export controls** - potential escalation with China/Taiwan tensions",
      "2. **Competition** - AMD MI400, custom ASICs from hyperscalers",
      "3. **Valuation multiples compression** - if growth decelerates below 50%",
      "4. **Supply concentration** - 100% of advanced packaging at TSMC",
    ].join("\n")
  }

  if (lower.includes("aapl") || lower.includes("apple")) {
    return [
      "## Apple Inc. (AAPL) - Deep Dive",
      "",
      "### Company Profile",
      "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, along with services including digital content, streaming, and financial services.",
      "",
      "### Key Financial Metrics",
      "",
      "| Metric | Value | Peer Avg | Percentile |",
      "|--------|-------|----------|------------|",
      "| Market Cap | $3.05T | $1.20T | 97th |",
      "| P/E (TTM) | 30.5x | 28.5x | 60th |",
      "| Revenue Growth (YoY) | +4.8% | +6.2% | 45th |",
      "| Gross Margin | 46.8% | 44.2% | 65th |",
      "| Services Margin | 71.2% | - | - |",
      "| Installed Base | 2.2B+ | - | - |",
      "",
      "### Segment Revenue",
      "",
      "| Segment | Q1 FY2026 | YoY Change |",
      "|---------|-----------|------------|",
      "| iPhone | $52.4B | +2.8% |",
      "| Services | $24.8B | +12.4% |",
      "| Mac | $8.2B | +4.5% |",
      "| iPad | $7.5B | +8.2% |",
      "| Wearables | $4.8B | -3.5% |",
      "",
      "### Key Thesis Points",
      "",
      "**Bullish:**",
      "- Services gross margin (71.2%) driving overall margin expansion",
      "- Massive installed base (2.2B+ devices) provides recurring revenue moat",
      "- Capital returns program ($110B annual buyback)",
      "- AI integration via Apple Intelligence could drive upgrade supercycle",
      "",
      "**Bearish:**",
      "- iPhone revenue concentration (52% of total)",
      "- Regulatory headwinds in EU (DMA compliance costs)",
      "- China market share declining (Huawei competition)",
      "- Hardware innovation cycle maturing",
    ].join("\n")
  }

  return [
    "## " + userContent.toUpperCase() + " - Stock Analysis",
    "",
    "### Overview",
    "Performing deep analysis on " + userContent.trim() + "...",
    "",
    "### Key Metrics",
    "",
    "| Metric | Value | Evaluation |",
    "|--------|-------|------------|",
    "| Sentiment Score | 62/100 | Moderate Positive |",
    "| Technical Rating | 58/100 | Neutral |",
    "| Fundamental Score | 71/100 | Above Average |",
    "",
    "### Recent Price Action",
    "The stock is showing mixed signals with moderate volume. Key support and resistance levels are being established.",
    "",
    "*This is a simulated analysis. For production use, connect a live market data provider.*",
  ].join("\n")
}

function generateGeneralResponse(): string {
  return [
    "I can help you with financial analysis and market research. Here are some things I can do:",
    "",
    "### Available Commands",
    "",
    "| Command | Description |",
    "|---------|-------------|",
    "| `/earnings` | Analyze latest earnings reports |",
    "| `/risk` | Portfolio risk assessment |",
    "| `/portfolio` | Portfolio performance analysis |",
    "| `/market-analysis` | Market overview and sector performance |",
    "| `/stock SYMBOL` | Deep dive on a specific stock |",
    "",
    "### Example Queries",
    "",
    '- "Analyze NVIDIA earnings using /earnings"',
    '- "What\'s the risk profile of my portfolio?"',
    '- "Show me a market overview"',
    '- "Compare AAPL and MSFT"',
    "",
    "### Features Available",
    "",
    "- **Markdown rendering** with tables, code blocks, and structured sections",
    "- **Inline charts** using shadcn/ui Recharts components",
    "- **Export to CSV/Sheets** from data tables",
    "- **Artifact panel** for saving and reviewing outputs",
    "- **Thinking trace** showing AI analysis process",
    "",
    "Type a command or ask a question to get started.",
  ].join("\n")
}
