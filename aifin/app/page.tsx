"use client"

import { Navbar } from "@/components/navbar"
import {
  ArrowRight,
  Copy,
  BarChart3,
  Zap,
  Database,
  FileText,
  Activity,
  Globe,
  Lock,
  Cpu,
  ChevronDown,
  Plug,
  Server,
  Workflow,
  Radio,
} from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"



/* ─── BACKGROUND MARGIN LINES ─── */
function MarginLines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[1200px] border-x dark:border-white/10 border-black/10"
    />
  )
}

/* ─── HERO ─── */
function HeroSection() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText("npx finintel analyze TSLA")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative overflow-hidden border-b border-border">
      <MarginLines />
      <div className="relative mx-auto max-w-[1200px] px-6 pb-24 pt-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left — text content */}
          <div>
            {/* Banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-3"
            >
              <span className="border border-border bg-accent px-2 py-0.5 text-[11px] font-medium uppercase tracking-widest text-foreground">
                New
              </span>
              <span className="text-[13px] text-muted-foreground">
                AI-powered institutional financial intelligence
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground"
            >
              The autonomous financial research system
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 max-w-[600px] text-[15px] leading-relaxed text-muted-foreground"
            >
              Multi-agent AI platform for market analysis, portfolio intelligence,
              earnings research, and risk evaluation.
            </motion.p>

            {/* Command block */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-[520px]"
            >
              <div className="border border-border bg-card">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button className="border-r border-border px-4 py-2 text-[13px] font-medium text-foreground">
                    npx
                  </button>
                  <button className="border-r border-border px-4 py-2 text-[13px] text-muted-foreground">
                    pip
                  </button>
                  <button className="px-4 py-2 text-[13px] text-muted-foreground">
                    docker
                  </button>
                </div>
                {/* Command */}
                <div className="flex items-center justify-between px-4 py-3">
                  <code className="text-[13px] text-muted-foreground">
                    npx <span className="font-bold text-foreground">finintel</span>{" "}
                    analyze TSLA
                  </code>
                  <button
                    onClick={handleCopy}
                    className="ml-4 text-muted-foreground/50 transition-colors hover:text-foreground"
                  >
                    {copied ? (
                      <span className="text-[11px] text-foreground">copied</span>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:flex lg:items-center lg:justify-center"
          >
            <div className="relative flex h-[480px] w-[480px] items-center justify-center">
              {/* Lines extending outwards from the container to form a grid OUTSIDE the GIF */}
              {/* Top horizontal line */}
              <div className="pointer-events-none absolute top-0 -left-[50vw] right-0 h-px dark:bg-white/10 bg-black/10" />
              {/* Bottom horizontal line */}
              <div className="pointer-events-none absolute bottom-0 -left-[50vw] right-0 h-px dark:bg-white/10 bg-black/10" />
              {/* Left vertical line */}
              <div className="pointer-events-none absolute -top-[50vh] -bottom-[50vh] left-0 w-px dark:bg-white/10 bg-black/10" />
              {/* Right vertical line */}
              <div className="pointer-events-none absolute -top-[50vh] -bottom-[50vh] right-0 w-px dark:bg-white/10 bg-black/10" />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-visual.gif"
                alt="FININTEL platform visualization"
                draggable={false}
                className="relative z-10 h-full w-full pointer-events-none select-none object-contain dark:mix-blend-screen mix-blend-multiply dark:invert-0 invert opacity-90"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── WHAT IS ─── */
function WhatIsSection() {
  const features = [
    {
      label: "Multi-agent AI",
      description:
        "Autonomous agents coordinate to analyze markets, earnings, and risk factors simultaneously",
    },
    {
      label: "Deep research",
      description:
        "SEC filings, earnings calls, analyst reports, and news — parsed and synthesized in real-time",
    },
    {
      label: "Live market data",
      description:
        "Real-time equity, options, and fixed income data streamed directly to your analysis pipeline",
    },
    {
      label: "Risk models",
      description:
        "VaR, Monte Carlo, stress tests, and factor exposure analysis with institutional-grade accuracy",
    },
    {
      label: "Any data source",
      description:
        "Connect Bloomberg, Refinitiv, Yahoo Finance, Alpha Vantage, or your proprietary feeds",
    },
    {
      label: "Private deployment",
      description:
        "Run on-premise or in your VPC. No data leaves your infrastructure. SOC 2 compliant",
    },
  ]

  return (
    <section id="research" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          What is FININTEL?
        </h2>
        <p className="mb-16 max-w-[700px] text-[14px] leading-relaxed text-muted-foreground">
          FININTEL is an autonomous AI research platform that helps institutional
          teams analyze financial markets from your terminal, API, or desktop.
        </p>

        <div className="grid grid-cols-1 gap-[1px] border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.label}
              className="bg-background p-6 transition-colors hover:bg-accent"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-muted-foreground/50 text-[13px]">[*]</span>
                <span className="text-[13px] font-medium text-foreground">
                  {feat.label}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a
            href="#docs"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Read documentation
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── CAPABILITIES ─── */
function CapabilitiesSection() {
  const capabilities = [
    {
      icon: BarChart3,
      title: "Equity Research",
      description:
        "Automated DCF, comparable analysis, and earnings quality scoring across 10,000+ global equities.",
    },
    {
      icon: Activity,
      title: "Portfolio Analytics",
      description:
        "Factor decomposition, attribution analysis, and rebalancing signals for multi-asset portfolios.",
    },
    {
      icon: FileText,
      title: "Earnings Intelligence",
      description:
        "NLP-driven earnings call analysis with sentiment scoring, guidance tracking, and surprise detection.",
    },
    {
      icon: Globe,
      title: "Macro Research",
      description:
        "Cross-asset macro regime detection, yield curve analysis, and central bank policy impact modeling.",
    },
    {
      icon: Cpu,
      title: "Quant Signals",
      description:
        "Factor-based signal generation, momentum analysis, and statistical arbitrage opportunity screening.",
    },
    {
      icon: Zap,
      title: "Real-time Alerts",
      description:
        "Material event detection, filing alerts, and anomaly identification pushed to Slack, email, or webhook.",
    },
  ]

  return (
    <section id="markets" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          Built for institutional research
        </h2>
        <p className="mb-16 text-[14px] text-muted-foreground">
          Production-grade capabilities trusted by hedge funds, asset managers, and research teams.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="border-b border-r border-border p-8 transition-colors hover:bg-accent last:border-r-0 [&:nth-child(2n)]:md:border-r-0 [&:nth-child(3n)]:lg:border-r-0"
            >
              <cap.icon className="mb-4 h-5 w-5 text-muted-foreground/50" />
              <h3 className="mb-2 text-[14px] font-semibold text-foreground">
                {cap.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── MCP SERVER ─── */
function MCPSection() {
  const mcpFeatures = [
    {
      icon: Plug,
      title: "MCP Protocol",
      description:
        "Native Model Context Protocol support. Connect any MCP-compatible AI client directly to FININTEL's financial data layer.",
    },
    {
      icon: Server,
      title: "FININTEL MCP Server",
      description:
        "Run a local or hosted MCP server exposing financial tools — market data, SEC filings, earnings analysis — to any LLM.",
    },
    {
      icon: Workflow,
      title: "Tool Composition",
      description:
        "Compose financial tools into workflows. Chain market data → earnings NLP → risk scoring with simple MCP tool calls.",
    },
    {
      icon: Radio,
      title: "Streaming results",
      description:
        "MCP streaming responses for long-running research tasks. Get partial results as agents complete each analysis step.",
    },
    {
      icon: Lock,
      title: "Authenticated access",
      description:
        "OAuth 2.0 and API key authentication on the MCP server. Scope tool access per client or team.",
    },
    {
      icon: Database,
      title: "Any LLM client",
      description:
        "Works with Claude Desktop, Cursor, Windsurf, OpenAI Assistants, and any MCP-compatible host.",
    },
  ]

  return (
    <section id="mcp" className="relative border-b border-border">
      <MarginLines />
      <div className="relative mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          MCP Server
        </h2>
        <p className="mb-4 max-w-[600px] text-[14px] text-muted-foreground">
          FININTEL ships a native Model Context Protocol server — expose financial
          intelligence tools directly to any AI client.
        </p>

        {/* Install snippet */}
        <div className="mb-16 inline-flex items-center gap-3 border border-border bg-card px-4 py-2.5">
          <code className="text-[13px] text-muted-foreground">
            npx <span className="font-bold text-foreground">finintel</span> mcp
            --port 3100
          </code>
        </div>

        <div className="grid grid-cols-1 gap-[1px] border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {mcpFeatures.map((feat) => (
            <div
              key={feat.title}
              className="bg-background p-6 transition-colors hover:bg-accent"
            >
              <feat.icon className="mb-4 h-5 w-5 text-muted-foreground/50" />
              <h3 className="mb-2 text-[14px] font-semibold text-foreground">
                {feat.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a
            href="#docs"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Read MCP documentation
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── PRIVACY ─── */
function PrivacySection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          Built for privacy first
        </h2>
        <p className="max-w-[700px] text-[14px] leading-relaxed text-muted-foreground">
          FININTEL does not store any of your proprietary data, models, or research
          output. Deploy on-premise, in your VPC, or air-gapped. Purpose-built for{" "}
          <a
            href="#enterprise"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            regulated environments
          </a>
          .
        </p>
      </div>
    </section>
  )
}

/* ─── FAQ ─── */
function FAQSection() {
  const faqs = [
    {
      q: "What is FININTEL?",
      a: "FININTEL is an autonomous AI research platform that helps institutional teams analyze financial markets, generate research reports, and monitor portfolio risk — all from the terminal or API.",
    },
    {
      q: "How do I use FININTEL?",
      a: "Install via npx, pip, or Docker. Connect your data sources and run analysis commands. Output is structured JSON, Markdown, or direct API response.",
    },
    {
      q: "What is the MCP server?",
      a: "FININTEL ships a Model Context Protocol server that exposes financial intelligence tools to any MCP-compatible AI client — Claude Desktop, Cursor, and more.",
    },
    {
      q: "What data sources are supported?",
      a: "Bloomberg, Refinitiv, Alpha Vantage, Yahoo Finance, SEC EDGAR, and any REST/WebSocket endpoint. FININTEL also supports custom data adapters.",
    },
    {
      q: "Can I deploy on-premise?",
      a: "Yes. FININTEL is designed for private deployment. Run in your VPC, on-premise infrastructure, or air-gapped environments.",
    },
    {
      q: "What about data and privacy?",
      a: "FININTEL processes data locally by default. No telemetry, no data collection. Enterprise deployments include SOC 2 Type II compliance and audit trails.",
    },
  ]

  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="docs" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-12 text-[22px] font-bold tracking-tight text-foreground">
          FAQ
        </h2>
        <div className="max-w-[700px]">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left text-[14px] font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                {faq.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform ${openIdx === i ? "rotate-180" : ""
                    }`}
                />
              </button>
              {openIdx === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pb-5 text-[13px] leading-relaxed text-muted-foreground"
                >
                  {faq.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── ENTERPRISE ─── */
function EnterpriseBanner() {
  return (
    <section id="enterprise" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="inline-flex items-center gap-3">
          <span className="border border-border bg-accent px-2 py-0.5 text-[11px] font-medium uppercase tracking-widest text-foreground">
            Enterprise
          </span>
          <span className="text-[14px] text-muted-foreground">
            Managed deployment, SSO, audit logs, and dedicated support.
          </span>
          <a
            href="#"
            className="text-[13px] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Contact sales
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── WAITLIST ─── */
function WaitlistSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          Be the first to know when we release new products
        </h2>
        <p className="mb-8 text-[14px] text-muted-foreground">
          Join the waitlist for early access.
        </p>
        <div className="flex max-w-[480px] items-center border border-border">
          <input
            type="email"
            placeholder="Email address"
            className="flex-1 bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <button className="border-l border-border bg-foreground px-6 py-3 text-[13px] font-medium text-background transition-colors hover:opacity-90">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  const footerLinks = [
    { label: "GitHub", href: "#" },
    { label: "Docs", href: "#" },
    { label: "Changelog", href: "#" },
    { label: "Discord", href: "#" },
    { label: "X", href: "#" },
  ]
  const legalLinks = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Brand", href: "#" },
  ]

  return (
    <footer>
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-5">
            {footerLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className={`flex items-center justify-center py-4 text-[13px] text-muted-foreground transition-colors hover:text-foreground ${i < footerLinks.length - 1 ? "border-r border-border" : ""
                  }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-[12px] text-muted-foreground/50">
            ©2026 FININTEL
          </span>
          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[12px] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ─── */
export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <WhatIsSection />
        <CapabilitiesSection />
        <MCPSection />
        <PrivacySection />
        <FAQSection />
        <EnterpriseBanner />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  )
}
