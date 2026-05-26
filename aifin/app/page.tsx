
"use client"

import { Navbar } from "@/components/navbar"
import { MarginLines } from "@/design-system/components"
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



const START_COMMANDS = {
  mcp: "cd financial-mcp && make install && make run",
  web: "cd aifin && npm install && cp .env.example .env.local && npm run dev",
  test: "cd aifin && npm run test:integrations",
} as const

type StartTab = keyof typeof START_COMMANDS

/* ─── HERO ─── */
function HeroSection() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<StartTab>("mcp")

  function handleCopy() {
    navigator.clipboard.writeText(START_COMMANDS[activeTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabLabels: { id: StartTab; label: string }[] = [
    { id: "mcp", label: "MCP" },
    { id: "web", label: "web" },
    { id: "test", label: "test" },
  ]

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
                Open source
              </span>
              <span className="text-[13px] text-muted-foreground">
                Next.js terminal + Python financial MCP server
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground"
            >
              Institutional-grade financial research infrastructure
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 max-w-[600px] text-[15px] leading-relaxed text-muted-foreground"
            >
              Deterministic valuation, macro, credit, and technical engines run through an
              agent pipeline — then OpenRouter synthesizes structured research with
              evidence binding, debate resolution, and execution traces in the chat UI.
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
                  {tabLabels.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`border-r border-border px-4 py-2 text-[13px] last:border-r-0 ${
                        activeTab === tab.id
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {/* Command */}
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <code className="break-all text-[12px] leading-snug text-muted-foreground">
                    <span className="text-foreground">{START_COMMANDS[activeTab]}</span>
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="ml-2 shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground"
                    aria-label="Copy command"
                  >
                    {copied ? (
                      <span className="text-[11px] text-foreground">copied</span>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-muted-foreground/70">
                MCP listens on{" "}
                <code className="text-foreground/80">http://127.0.0.1:8000</code> · web app on{" "}
                <code className="text-foreground/80">http://localhost:3000</code>
              </p>
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
      label: "Agent pipeline",
      description:
        "AgentRouter plans tool chains; ExecutionRuntime runs parallel DAG batches with retries, validation, and synthesis.",
    },
    {
      label: "Evidence registry",
      description:
        "Engine outputs register source-bound claims (confidence, freshness, tool provenance) before the LLM narrates.",
    },
    {
      label: "Debate resolution",
      description:
        "MacroAgent, QuantAgent, ValuationAgent, and RiskAgent theses are reconciled when macro and technical signals conflict.",
    },
    {
      label: "Deterministic engines",
      description:
        "DCF, Black-Scholes, Taylor rule, yield curve, Merton default, credit spreads, RSI, MACD, and Bollinger — pure math, no I/O in engines.",
    },
    {
      label: "Research terminal",
      description:
        "Next.js chat UI with structured report sections, inline charts, intelligence panel (live signals, execution metadata), and model failover.",
    },
    {
      label: "Local-first setup",
      description:
        "Run MCP and the web app on your machine. API keys live in .env.local; optional OpenRouter for live LLM (demo mode without a key).",
    },
  ]

  return (
    <section id="research" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          What is FININTEL?
        </h2>
        <p className="mb-16 max-w-[700px] text-[14px] leading-relaxed text-muted-foreground">
          FININTEL is an AI-powered financial intelligence platform in this monorepo: a
          Python <code className="text-foreground/80">financial-mcp</code> server for
          computation and orchestration, plus the <code className="text-foreground/80">aifin</code>{" "}
          Next.js app for interactive research. The moat is execution quality and
          trust layers — not raw indicator count.
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
            href="#getting-started"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            How to start locally
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
      title: "Equity research skill",
      description:
        "Fixed workflow: yield curve signal, RSI, and credit spread analysis — routed from /earnings and ticker queries in chat.",
    },
    {
      icon: Globe,
      title: "Macro regime skill",
      description:
        "Parallel macro tools: yield curve, Taylor rule, and inflation momentum for regime-style queries.",
    },
    {
      icon: FileText,
      title: "Valuation",
      description:
        "Two-stage DCF engine (dcf_valuation_tool) with input validation on terminal growth, WACC, and cash flows.",
    },
    {
      icon: Activity,
      title: "Credit & risk",
      description:
        "Merton structural default probability, credit spread buckets, and post-run contradiction detection across macro vs technicals.",
    },
    {
      icon: Cpu,
      title: "Technical quant",
      description:
        "RSI, MACD, and Bollinger engines with signal interpretation in synthesis — not raw indicator dumps.",
    },
    {
      icon: Zap,
      title: "Derivatives",
      description:
        "Black-Scholes-Merton pricing and Greeks via the black_scholes tool in the registry.",
    },
  ]

  return (
    <section id="markets" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          What ships today
        </h2>
        <p className="mb-16 text-[14px] text-muted-foreground">
          Ten registered MCP tools, two bundled skills, and a chat layer that combines
          engine output with OpenRouter (or local demo mode).
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
      title: "MCP SSE surface",
      description:
        "FastMCP server mounted at /mcp (SSE). Tool registry loaded at startup from engines and MCP wrappers.",
    },
    {
      icon: Server,
      title: "Agent HTTP API",
      description:
        "POST /agent/run returns JSON with validation, synthesis, evidence, debate, and live_signals. POST /agent/run/stream emits SSE execution events.",
    },
    {
      icon: Workflow,
      title: "Skills",
      description:
        "equity_research and macro_regime_detection bundle fixed tool plans on the same ExecutionRuntime used by the router.",
    },
    {
      icon: Radio,
      title: "Streaming events",
      description:
        "SSE stages: plan_ready, node_started, node_completed, validation, synthesis, final — suitable for progress UIs (stream endpoint ready; chat uses sync /run today).",
    },
    {
      icon: Lock,
      title: "Validation layer",
      description:
        "FinancialRiskValidator flags macro–technical contradictions; ClaimValidator range-checks engine numerics.",
    },
    {
      icon: Database,
      title: "Market data (in progress)",
      description:
        "MarketDataService and Yahoo/Alpha Vantage/FRED provider stubs exist; agent tools still use caller inputs or skill defaults until fully wired.",
    },
  ]

  return (
    <section id="mcp" className="relative border-b border-border">
      <MarginLines />
      <div className="relative mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          Financial MCP server
        </h2>
        <p className="mb-4 max-w-[600px] text-[14px] text-muted-foreground">
          FastAPI app in <code className="text-foreground/80">financial-mcp/apps/mcp-server</code>.
          Health check at GET /health. Default port 8000.
        </p>

        {/* Install snippet */}
        <div className="mb-16 inline-flex items-center gap-3 border border-border bg-card px-4 py-2.5">
          <code className="text-[13px] text-muted-foreground">
            cd financial-mcp && <span className="font-bold text-foreground">make run</span>
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
            href="/chat"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Open research terminal
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
          Local development model
        </h2>
        <p className="max-w-[700px] text-[14px] leading-relaxed text-muted-foreground">
          The MCP server and Next.js app are designed to run on your machine. Chat
          sessions are held in browser state (Zustand); there is no hosted multi-tenant
          backend in this repo. When{" "}
          <code className="text-foreground/80">OPENROUTER_API_KEY</code> is set, prompts
          go to OpenRouter for synthesis — otherwise the UI falls back to deterministic
          demo responses. Check integration health at{" "}
          <code className="text-foreground/80">GET /api/status</code> while the dev server
          is running.
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
      a: "A monorepo with two main parts: financial-mcp (Python FastAPI + MCP + agent pipeline) and aifin (Next.js research terminal). Together they produce structured equity-style reports with engine-backed evidence, not a standalone CLI product.",
    },
    {
      q: "How do I start locally?",
      a: "1) In financial-mcp: pip install -r requirements.txt && make run (port 8000). 2) In aifin: npm install, copy .env.example to .env.local, add OPENROUTER_API_KEY (optional), npm run dev. 3) Open http://localhost:3000/chat. Run npm run test:integrations to verify MCP + app health.",
    },
    {
      q: "What chat commands work?",
      a: "Slash commands: /earnings, /risk, /macro, /portfolio, /market-analysis, /compare. Queries mentioning DCF, RSI, yield curve, valuation, or tickers like NVDA route the MCP agent (equity_research skill for earnings-style prompts).",
    },
    {
      q: "What does the MCP server expose?",
      a: "Tools: dcf_valuation_tool, black_scholes, taylor_rule, yield_curve_signal, inflation_momentum_tool, merton_default_prob, credit_spread_analysis_tool, rsi_indicator, macd_indicator, bollinger_bands. APIs: /agent/run, /agent/run/stream, /health, /mcp.",
    },
    {
      q: "Do I need an API key?",
      a: "OpenRouter is optional — without OPENROUTER_API_KEY the chat uses local demo/mock narratives. For live LLM synthesis, add a key from openrouter.ai. MCP runs without external keys; market data provider keys (Alpha Vantage, FRED, Polygon) are optional in financial-mcp settings when you wire feeds.",
    },
    {
      q: "What is not implemented yet?",
      a: "SEC filing ingestion, earnings call NLP, Slack alerts, hosted enterprise SSO, and automatic live market data fetch in the agent path are roadmap items. Market data providers exist as stubs; skills still use default inputs unless you pass inputs_by_tool to /agent/run.",
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
        <div className="inline-flex flex-wrap items-center gap-3">
          <span className="border border-border bg-accent px-2 py-0.5 text-[11px] font-medium uppercase tracking-widest text-foreground">
            Roadmap
          </span>
          <span className="text-[14px] text-muted-foreground">
            OTEL export, vector memory, multi-agent swarms, and full market-data wiring —
            see financial-mcp/docs/architecture.md.
          </span>
        </div>
      </div>
    </section>
  )
}

/* ─── GETTING STARTED ─── */
function GettingStartedSection() {
  const steps = [
    {
      step: "01",
      title: "Start the MCP server",
      body: "From the repo root: cd financial-mcp, pip install -r requirements.txt, then make run. Confirm GET http://127.0.0.1:8000/health returns status ok.",
    },
    {
      step: "02",
      title: "Configure the web app",
      body: "cd aifin, npm install, cp .env.example .env.local. Set FINANCIAL_MCP_URL=http://127.0.0.1:8000. Optionally set OPENROUTER_API_KEY for live LLM (see openrouter.ai/keys).",
    },
    {
      step: "03",
      title: "Run the research terminal",
      body: "npm run dev and open http://localhost:3000 — click Launch Terminal or go to /chat. Try /earnings NVIDIA investment thesis or a macro query with yield curve and RSI.",
    },
    {
      step: "04",
      title: "Verify integrations",
      body: "With both servers running: npm run test:integrations (checks MCP /health, /agent/run, and app /api/status).",
    },
  ]

  return (
    <section id="getting-started" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mb-3 text-[22px] font-bold tracking-tight text-foreground">
          How to start
        </h2>
        <p className="mb-12 max-w-[640px] text-[14px] text-muted-foreground">
          Prerequisites: Node.js 18+, Python 3.11+, and npm. Docker optional via{" "}
          <code className="text-foreground/80">make docker-up</code> in financial-mcp.
        </p>
        <div className="grid grid-cols-1 gap-[1px] border border-border bg-border md:grid-cols-2">
          {steps.map((s) => (
            <div key={s.step} className="bg-background p-6">
              <span className="mb-3 block font-mono text-[11px] text-muted-foreground/60">
                {s.step}
              </span>
              <h3 className="mb-2 text-[14px] font-semibold text-foreground">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a
            href="/chat"
            className="inline-flex items-center gap-2 border border-border bg-foreground px-5 py-2.5 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Launch Terminal
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  const footerLinks = [
    { label: "Terminal", href: "/chat" },
    { label: "Getting started", href: "#getting-started" },
    { label: "FAQ", href: "#docs" },
    { label: "MCP", href: "#mcp" },
    { label: "Architecture", href: "#enterprise" },
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
        <GettingStartedSection />
        <EnterpriseBanner />
      </main>
      <Footer />
    </div>
  )
}
