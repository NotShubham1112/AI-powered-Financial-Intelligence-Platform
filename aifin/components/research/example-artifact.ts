// Example of how the backend should return research artifacts
// This is the correct format for institutional artifact platform stage

const EXAMPLE_RESEARCH_ARTIFACT = {
  executive_summary: `
    Our analysis indicates strong revenue growth and improving margins.
    The company maintains competitive positioning in core markets.
  `,
  
  key_metrics: [
    { label: "Revenue Growth", value: "+24.5%", subtext: "YoY" },
    { label: "Operating Margin", value: "18.3%", subtext: "2023" },
    { label: "P/E Ratio", value: "14.2x", subtext: "Peer avg: 16.8x" },
    { label: "ROE", value: "15.6%", subtext: "vs 12% industry" },
  ],

  charts: [
    {
      type: "revenue",
      title: "Revenue Growth Trajectory",
      data: [
        { year: "2021", revenue: 20 },
        { year: "2022", revenue: 35 },
        { year: "2023", revenue: 61 },
        { year: "2024E", revenue: 84 },
      ],
    },
    {
      type: "pie",
      title: "Market Segment Breakdown",
      data: [
        { name: "Enterprise", value: 45 },
        { name: "Mid-Market", value: 35 },
        { name: "SMB", value: 20 },
      ],
    },
  ],

  sections: [
    {
      title: "Business Model",
      content: [
        {
          type: "paragraph",
          content: "The company operates a subscription-based SaaS model with high gross margins.",
        },
        {
          type: "list",
          items: [
            "70% gross margin on subscriptions",
            "85% net revenue retention",
            "Strong enterprise customer base",
          ],
        },
      ],
    },
    {
      title: "Financial Health",
      content: [
        {
          type: "heading",
          level: 3,
          content: "Balance Sheet Strength",
        },
        {
          type: "paragraph",
          content: "Strong liquidity position with cash reserves of $200M.",
        },
        {
          type: "blockquote",
          content: "Debt-to-equity ratio of 0.3x indicates conservative leverage.",
        },
      ],
    },
  ],

  tables: [
    {
      title: "Historical Financials",
      data: {
        columns: ["Year", "Revenue", "Gross Margin", "Net Income"],
        rows: [
          { Year: "2021", Revenue: "$20M", "Gross Margin": "72%", "Net Income": "$2.1M" },
          { Year: "2022", Revenue: "$35M", "Gross Margin": "74%", "Net Income": "$4.2M" },
          { Year: "2023", Revenue: "$61M", "Gross Margin": "75%", "Net Income": "$9.2M" },
        ],
      },
    },
  ],
}

export default EXAMPLE_RESEARCH_ARTIFACT
