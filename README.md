# FININTEL — AI-Powered Financial Intelligence Platform

> An open-source, multi-agent financial research platform that combines deterministic computation engines with LLM-powered synthesis to produce institutional-grade equity research.

[![CI](https://github.com/your-org/ai-powered-financial-intelligence-platform/actions/workflows/financial-mcp-ci.yml/badge.svg)](https://github.com/your-org/ai-powered-financial-intelligence-platform/actions)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Financial Engines](#financial-engines)
- [Agent Pipeline](#agent-pipeline)
- [MCP Tool Registry](#mcp-tool-registry)
- [Research Artifact System](#research-artifact-system)
- [LLM Inference Runtime](#llm-inference-runtime)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [SDK](#sdk)
- [Testing](#testing)
- [Deployment](#deployment)
- [Design Principles](#design-principles)
- [Roadmap](#roadmap)
- [Citation](#citation)
- [License](#license)

---

## Overview

FININTEL is a monorepo-based platform that bridges quantitative financial computation with large language model reasoning. It produces structured, evidence-backed research reports through a multi-phase agent pipeline that decomposes queries, executes deterministic financial engines in parallel, validates outputs for consistency, and synthesizes institutional-quality analysis.

### Key Capabilities

- **10 Deterministic Financial Engines** — Pure mathematical models (DCF, Black-Scholes, Taylor Rule, Merton Default, RSI, MACD, Bollinger Bands, etc.) with zero I/O
- **Multi-Agent Orchestration** — Intent routing, DAG-based execution, debate resolution, and risk validation
- **MCP Protocol Server** — Model Context Protocol-compliant tool registry with 10 registered financial tools
- **LLM-Powered Synthesis** — Institutional-grade report generation with CAGR validation and economic realism enforcement
- **Research Artifact Rendering** — Zod-validated structured output schemas with type-safe chart, table, and metric components
- **Fault-Tolerant Inference** — Multi-provider LLM routing (OpenRouter, Groq) with adaptive fallback, caching, and health tracking
- **Chat Research Terminal** — Interactive UI with slash commands, intelligence panels, tool traces, and session management

### What Makes This Different

| Aspect | FININTEL Approach |
|--------|-------------------|
| **Computation** | Deterministic engines with mathematical proofs — not LLM guesses |
| **Validation** | Multi-layer: CAGR checks, macro consistency, contradiction detection, risk flags |
| **Evidence** | Source-bound quantitative claims with confidence scoring and freshness tracking |
| **Debate** | Cross-agent thesis reconciliation (bull vs. risk) with contradiction scoring |
| **Moat** | Execution quality + skills + validation + artifacts — not raw indicator count |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Chat Research Terminal (Next.js)              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │  Intent   │  │ Planner  │  │ Execution │  │  Synthesizer │  │
│  │  Router   │→ │  (LLM)   │→ │  Engine   │→ │    (LLM)     │  │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────┘  │
│       │              │              │               │            │
│       └──────────────┴──────────────┴───────────────┘            │
│                            │  MCP Protocol                       │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│              Financial MCP Server (Python/FastAPI)               │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────┐      │
│  │              AgentPipeline                            │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │      │
│  │  │   Agent   │  │Execution │  │  Debate  │           │      │
│  │  │  Router   │→ │ Runtime  │→ │Resolver  │           │      │
│  │  └──────────┘  └──────────┘  └──────────┘           │      │
│  └─────────────────────────┬─────────────────────────────┘      │
│                            │                                     │
│  ┌──────────┐  ┌──────────┼──────────┐  ┌──────────────┐      │
│  │  DCF     │  │  Black   │  │  Taylor │  │    RSI /     │      │
│  │  Engine  │  │  Scholes │  │  Rule   │  │  MACD / BB   │      │
│  └──────────┘  └──────────┘  └─────────┘  └──────────────┘      │
│                    Deterministic Engines (Pure Math)              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Evidence Registry  │  Risk Validator  │  Live Signals   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Execution Flow

```
User Query
  → IntentRouter (domain classification, complexity scoring)
  → Planner (LLM-powered plan decomposition)
  → ExecutionEngine (multi-step DAG with tool routing)
  │
  ├──→ ToolRouter → MCP Tools (deterministic engines)
  ├──→ ToolRouter → Skills (multi-tool workflows)
  └──→ ToolRouter → LLM Reasoning (qualitative analysis)
  │
  → EvidenceRegistry (source-bound claims with confidence)
  → FinancialRiskValidator (contradiction detection)
  → DebateResolutionEngine (bull vs. risk reconciliation)
  → Synthesizer (institutional-grade report generation)
  → ResearchArtifact (Zod-validated structured output)
```

---

## Repository Structure

```
AI-powered-Financial-Intelligence-Platform/
│
├── financial-mcp/              # Python MCP server backend
│   ├── apps/mcp-server/        # FastAPI application & HTTP routes
│   ├── core/                   # Core platform modules
│   │   ├── executor/           # DAG runtime, retries, timeouts
│   │   ├── evidence/           # Source-bound evidence claims
│   │   ├── memory/             # Result memory & compression
│   │   ├── skills/             # Multi-tool workflow definitions
│   │   ├── validators/         # Financial risk validation
│   │   ├── synthesis/          # Institutional report builder
│   │   └── signals/            # Live signal engine
│   ├── engines/                # Deterministic financial engines
│   │   ├── valuation/          # DCF, DDM, WACC
│   │   ├── derivatives/        # Black-Scholes, Greeks, IV surface
│   │   ├── macro/              # Taylor rule, yield curve, inflation
│   │   ├── credit/             # Merton default, spread analysis
│   │   ├── technicals/         # RSI, MACD, Bollinger Bands
│   │   ├── fixed_income/       # Bond pricing
│   │   ├── risk/               # Portfolio risk
│   │   └── portfolio/          # Portfolio optimization
│   ├── tools/                  # MCP tool wrappers
│   ├── schemas/                # Pydantic data schemas
│   ├── registry/               # Tool catalog & loader
│   ├── orchestration/          # Agent pipeline & debate
│   ├── validation/             # Cross-cutting validators
│   ├── market_data/            # Market data providers
│   ├── workers/                # Celery background workers
│   ├── tests/                  # Pytest test suite
│   └── infrastructure/         # Docker & monitoring
│
├── aifin/                      # Next.js frontend application
│   ├── app/                    # App Router pages & API routes
│   │   ├── chat/               # Chat research terminal
│   │   └── api/                # Backend-for-frontend API
│   │       ├── chat/           # Main chat endpoint
│   │       ├── status/         # Integration health
│   │       └── agent/metrics/  # Runtime metrics
│   ├── components/             # React components
│   │   ├── chat/               # Chat UI components (21 files)
│   │   ├── research/           # Research artifact system (20 files)
│   │   └── ui/                 # shadcn/ui primitives (58 files)
│   ├── core/
│   │   ├── agent/              # TypeScript agent pipeline
│   │   └── models/             # LLM inference runtime
│   ├── lib/                    # MCP client, utilities
│   ├── stores/                 # Zustand state management
│   └── design-system/          # Design tokens & primitives
│
├── sdk/                        # Client SDKs
│   ├── python/                 # Python SDK
│   └── typescript/             # TypeScript SDK
│
└── prompts/                    # LLM prompt templates
    └── institutional-research-system-prompt.md
```

---

## Financial Engines

All engines are **pure mathematical functions** with no I/O, network calls, or side effects. They accept validated Pydantic models and return structured results.

### Valuation

| Engine | Model | Reference |
|--------|-------|-----------|
| **DCF Valuation** | Two-stage Discounted Cash Flow | Damodaran, CFA Institute |
| **Dividend Discount (DDM)** | Gordon Growth Model | Gordon (1956) |
| **WACC** | Weighted Average Cost of Capital | Modigliani & Miller (1958) |

### Derivatives

| Engine | Model | Reference |
|--------|-------|-----------|
| **Black-Scholes** | BSM option pricing | Black & Scholes (1973) |
| **Options Greeks** | Delta, gamma, vega, theta, rho | Black-Scholes partials |
| **IV Surface** | Implied volatility interpolation | Dupire (1994) |

### Macroeconomic

| Engine | Model | Reference |
|--------|-------|-----------|
| **Taylor Rule** | Implied policy rate from inflation & output gap | Taylor (1993) |
| **Yield Curve Signal** | 10Y-2Y spread & recession probability | Fed/NBER literature |
| **Inflation Momentum** | CPI YoY, momentum, and acceleration | BLS CPI methodology |

### Credit

| Engine | Model | Reference |
|--------|-------|-----------|
| **Merton Default** | Structural default probability & distance-to-default | Merton (1974) |
| **Credit Spread** | Spread decomposition & hazard approximation | CDS/hazard-rate literature |

### Technical Analysis

| Engine | Model | Reference |
|--------|-------|-----------|
| **RSI** | Relative Strength Index with signal bands | Wilder (1978) |
| **MACD** | Moving Average Convergence/Divergence | Appel (1979) |
| **Bollinger Bands** | %B and bandwidth | Bollinger (1980s) |

---

## Agent Pipeline

The platform implements a two-tier agent pipeline — a Python backend pipeline for computation orchestration and a TypeScript frontend pipeline for LLM-powered reasoning.

### Python Pipeline (`financial-mcp/orchestration/`)

```
Query → AgentRouter → ExecutionRuntime → Validation → Debate → Synthesis
```

1. **AgentRouter** — Keyword-scoring tool selection against the registry catalog
2. **ExecutionRuntime** — Async DAG executor with retries, timeouts, cancellation, and memory
3. **EvidenceRegistry** — Source-bound quantitative claims with confidence scoring
4. **FinancialRiskValidator** — Post-execution contradiction detection (e.g., macro bullish + technicals bearish)
5. **DebateResolutionEngine** — Cross-agent thesis reconciliation with contradiction scoring
6. **LiveSignalEngine** — Derives actionable signals from engine outputs
7. **InstitutionalReportBuilder** — Quant interpretation, probabilistic scenarios, market narrative

### TypeScript Pipeline (`aifin/core/agent/`)

```
Query → IntentRouter → Planner → ExecutionEngine → ToolRouter → Synthesizer
```

1. **IntentRouter** — 10-domain taxonomy classification with complexity scoring and mode selection
2. **Planner** — LLM-powered research plan decomposition with domain-specific prompts
3. **ExecutionEngine** — Step-by-step execution with tool routing
4. **ToolRouter** — Routes steps to MCP tools, client-side skills, or LLM reasoning
5. **Synthesizer** — 200+ line institutional-grade synthesis prompt with CAGR validation and economic realism constraints

### Skills

Pre-built multi-tool workflows:

| Skill | Tools | Purpose |
|-------|-------|---------|
| `equity_research` | yield_curve + RSI + credit_spread | Cross-domain equity analysis |
| `macro_regime_detection` | yield_curve + taylor_rule + inflation_momentum | Regime classification |

---

## MCP Tool Registry

10 tools registered via the Model Context Protocol with metadata including category, tags, complexity scores, validation rules, and authoritative source references.

| Tool | Category | Description |
|------|----------|-------------|
| `dcf_valuation_tool` | valuation | Two-stage DCF intrinsic value |
| `black_scholes` | derivatives | BSM option pricing and Greeks |
| `taylor_rule` | macro | Implied Fed funds rate |
| `yield_curve_signal` | macro | 10Y-2Y spread recession signal |
| `inflation_momentum_tool` | macro | CPI momentum and acceleration |
| `merton_default_prob` | credit | Structural default probability |
| `credit_spread_analysis_tool` | credit | Spread decomposition and rating |
| `rsi_indicator` | technicals | RSI with overbought/oversold bands |
| `macd_indicator` | technicals | MACD line, signal, and histogram |
| `bollinger_bands` | technicals | %B and bandwidth |

---

## Research Artifact System

A structured rendering pipeline that converts LLM-generated research into validated, type-safe React components.

### Schema Validation

All artifacts are validated against Zod schemas before rendering:

```typescript
ResearchArtifact
  ├── title: string
  ├── summary: string
  ├── sections: ContentBlock[]
  │     ├── heading | paragraph | list | blockquote | code
  ├── charts: Chart[]
  │     ├── revenue (line) | margin (bar) | market-share (pie)
  ├── tables: Table[]
  │     ├── headers + rows
  └── metrics: Metric[]
        ├── label, value, unit, change, trend
```

### Component Registry

Type-safe mapping ensures the LLM cannot generate arbitrary JSX — only pre-defined, validated components are rendered.

---

## LLM Inference Runtime

Production-grade multi-provider inference layer (`aifin/core/models/`).

### Features

- **Multi-Provider Routing** — OpenRouter and Groq with automatic provider detection
- **Adaptive Fallback Chains** — Health-aware model ranking with exponential backoff
- **Concurrency Control** — Per-model limits, global queue, backpressure handling
- **Response Caching** — Configurable TTL with Redis or in-memory fallback
- **Provider Health Tracking** — Success, failure, rate limit, and timeout metrics
- **Latency Measurement** — TTFT (time to first token) tracking per request
- **Deterministic Fallback** — When all providers fail, returns structured mock responses

### Model Configuration

| Tier | Models | Use Case |
|------|--------|----------|
| Fast/Free | `google/gemini-flash:free`, `openrouter/free` | Quick queries, streaming |
| Standard | `llama-3.3-70b-versatile`, `qwen3-32b` | General analysis |
| Deep | `gpt-oss-120b` | Complex multi-step reasoning |

---

## Getting Started

### Prerequisites

- **Python** >= 3.11
- **Node.js** >= 18
- **Redis** (optional — falls back to in-memory cache)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ai-powered-financial-intelligence-platform.git
cd ai-powered-financial-intelligence-platform

# Install all dependencies
npm run install:all
```

Or install components individually:

```bash
# Frontend
cd aifin && npm install

# Backend
cd financial-mcp && pip install -r requirements.txt
```

### Environment Setup

```bash
cp aifin/.env.example aifin/.env.local
```

Edit `aifin/.env.local`:

```env
# Required — at least one LLM provider
OPENROUTER_API_KEY=sk-or-v1-your-key-here
GROQ_API_KEY=gsk-your-groq-key-here

# MCP server (default: local)
FINANCIAL_MCP_URL=http://127.0.0.1:8000

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
REDIS_URL=redis://127.0.0.1:6379
```

### Running

```bash
# Start both frontend and MCP server concurrently
npm run dev

# Or start individually:
npm run dev:web    # Next.js on http://localhost:3000
npm run dev:mcp    # FastAPI on http://127.0.0.1:8000
```

### Verify

```bash
# Check MCP server health
curl http://127.0.0.1:8000/health

# Check integration health
curl http://localhost:3000/api/status

# Run integration tests
npm run test:integrations
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes* | — | OpenRouter API key ([get one](https://openrouter.ai/keys)) |
| `GROQ_API_KEY` | Yes* | — | Groq API key ([get one](https://console.groq.com/keys)) |
| `FINANCIAL_MCP_URL` | No | `http://127.0.0.1:8000` | MCP server URL |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public site URL |
| `REDIS_URL` | No | — | Redis for response cache (falls back to in-memory) |

*At least one LLM provider key is required for live inference. Without keys, the system operates in mock/demo mode.

### Model Configuration

Model tiers, aliases, and timeout profiles are defined in `aifin/core/models/config.ts`. The system supports:

- **OpenRouter** — Access to hundreds of models via OpenRouter API
- **Groq** — Low-latency inference for open-source models

### Python Settings

Backend configuration is managed via Pydantic Settings in `financial-mcp/apps/mcp-server/settings.py`:

- `REDIS_URL` — Redis connection string
- `DATABASE_URL` — PostgreSQL connection (for future use)
- `CELERY_BROKER_URL` — Celery broker
- `OPENROUTER_API_KEY` / `GROQ_API_KEY` — Provider keys

---

## API Reference

### MCP Server (Python — Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — `{status, version}` |
| `POST` | `/agent/run` | Synchronous agent execution |
| `POST` | `/agent/run/stream` | SSE streaming agent execution |
| `GET` | `/agent/metrics` | Runtime and inference metrics |
| `SSE` | `/mcp` | MCP SSE endpoint — tool discovery and invocation |

#### `POST /agent/run`

```json
{
  "query": "Analyze Apple's valuation using DCF and check technicals",
  "inputs_by_tool": {},
  "max_steps": 5,
  "parallel": true,
  "skill": null
}
```

Response includes: `run_id`, `status`, `validation`, `synthesis`, `evidence`, `debate`, `live_signals`, `tools`.

#### `POST /agent/run/stream`

Server-Sent Events with event types:
- `plan_ready` — Execution plan
- `node_started` — Tool execution started
- `node_completed` — Tool execution completed
- `validation` — Risk validation results
- `synthesis` — Generated report
- `final` — Complete result
- `error` — Error event

### Next.js API (Frontend — Port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Main chat endpoint — routes to agent pipeline or mock |
| `GET` | `/api/status` | Integration health check |
| `GET` | `/api/agent/metrics` | Runtime metrics |

---

## SDK

Client libraries for interacting with the platform programmatically.

### Python

```python
from sdk.python import FinancialAgent

agent = FinancialAgent(base_url="http://127.0.0.1:8000")

# Run a skill
result = await agent.run_skill(
    skill_name="equity_research",
    inputs={"ticker": "AAPL", "price": 195.0}
)

# Stream a workflow
async for event in agent.stream_workflow("macro_analysis", inputs={...}):
    print(event)
```

### TypeScript

```typescript
import { FinancialAgent } from './sdk/typescript/src';

const agent = new FinancialAgent({ baseUrl: 'http://127.0.0.1:8000' });

const result = await agent.runSkill('equity_research', {
  ticker: 'AAPL',
  price: 195.0
});
```

See [`sdk/README.md`](sdk/README.md) for full SDK documentation.

---

## Testing

### Python Tests

```bash
cd financial-mcp

# Run all tests
make test

# Run with coverage
pytest tests/ -v --tb=short

# Run specific test categories
pytest tests/unit/ -v                    # Unit tests
pytest tests/property/ -v                # Property-based tests
pytest tests/unit/test_agent_pipeline.py # Pipeline tests
```

Test categories:
- **Unit tests** — Engine, tool, pipeline, router, debate, evidence tests
- **Property-based tests** — Hypothesis-driven (e.g., Black-Scholes mathematical properties)
- **Integration tests** — End-to-end pipeline validation
- **Regression tests** — Known edge cases

### Frontend Tests

```bash
cd aifin

# Integration tests (MCP health, API routes, chat endpoint)
npm run test:integrations

# Linting
npm run lint

# Type checking
npm run typecheck
```

### CI Pipeline

GitHub Actions workflow (`financial-mcp-ci.yml`):
1. **Lint** — `ruff check` for Python, ESLint for TypeScript
2. **Test** — `pytest` unit + property tests
3. **Build** — Docker image build verification

---

## Deployment

### Docker

```bash
# Build and run MCP server
cd financial-mcp
docker build -f infrastructure/docker/Dockerfile.mcp -t finintel-mcp .
docker run -p 8000:8000 finintel-mcp

# Docker Compose (when configured)
make docker-up
```

### Manual Deployment

```bash
# MCP Server
cd financial-mcp
pip install -r requirements.txt
uvicorn apps.mcp-server.main:app --host 0.0.0.0 --port 8000

# Next.js App
cd aifin
npm install
npm run build
npm start
```

### Makefile Targets

| Target | Description |
|--------|-------------|
| `make install` | Install Python dependencies |
| `make test` | Run pytest suite |
| `make lint` | Run ruff linter |
| `make run` | Start MCP server on port 8000 |
| `make docker-up` | Docker Compose up |

### GitHub Actions

- **`financial-mcp-ci.yml`** — Lint, test, and Docker build on push/PR to `financial-mcp/`
- **`financial-mcp-deploy.yml`** — Docker image build with SHA tagging on push to main

---

## Design Principles

### 1. Engines Never Fetch Market Data

Deterministic engines are pure mathematical functions. They accept inputs and return outputs with no network calls, file I/O, or side effects. This ensures reproducibility, testability, and correctness guarantees.

### 2. Tools Validate Inputs, Then Call Engines

MCP tools serve as the validation layer between raw user inputs and mathematical engines. They enforce type safety via Pydantic models before any computation occurs.

### 3. Runtime Never Embeds Financial Formulas

The execution runtime is a general-purpose DAG executor. It never contains financial domain logic — only the registry handlers contain financial knowledge.

### 4. Moat = Execution Quality + Skills + Validation + Artifacts

The platform's competitive advantage is not the number of indicators it supports, but the quality of its execution pipeline, skill workflows, validation layer, and structured output system.

### 5. Evidence-Based Outputs

Every quantitative claim in a generated report is source-bound with confidence scoring. The system distinguishes between observed data, model-derived estimates, and critical unknowns.

### 6. Institutional-Grade Validation

Reports undergo mandatory validation:
- **CAGR consistency** — Stated vs. computed CAGR with ±0.5% tolerance
- **Economic realism** — No arbitrary percentages without justification
- **Compute consistency** — Scale-appropriate economics (startup vs. hyperscaler)
- **Macro consistency** — No unjustified exponential jumps

---

## Roadmap

| Phase | Layer | Status |
|-------|-------|--------|
| 1 | Deterministic engines | **Complete** |
| 2 | MCP tools | **Complete** |
| 3 | Execution runtime | **Complete** |
| 4 | Skills | **Foundation** |
| 5 | Financial memory | **In-process store** |
| 6 | Validation | **Rule-based** |
| 7 | Observability | **Tracing + metrics** |
| 8 | Vector memory / OTEL | Planned |
| 9 | Multi-agent swarms | Planned |

### Not Yet Implemented

- SEC filing ingestion and NLP
- Earnings call transcript analysis
- Slack/Discord alert integration
- Hosted enterprise SSO
- Automatic live market data fetch in agent path
- Market data providers exist as stubs — skills use default inputs unless custom `inputs_by_tool` are provided

---

## Research References

The financial engines in this platform are based on established academic and industry literature:

- Black, F., & Scholes, M. (1973). "The Pricing of Options and Corporate Liabilities." *Journal of Political Economy*, 81(3), 637-654.
- Merton, R. C. (1974). "On the Pricing of Corporate Debt: The Risk Structure of Interest Rates." *Journal of Finance*, 29(2), 449-470.
- Taylor, J. B. (1993). "Discretion versus Policy Rules in Practice." *Carnegie-Rochester Conference Series on Public Policy*, 39, 195-214.
- Damodaran, A. (2012). *Investment Valuation: Tools and Techniques for Determining the Value of Any Asset*. Wiley.
- Wilder, J. W. (1978). *New Concepts in Technical Trading Systems*. Trend Research.
- Gordon, M. J. (1956). "The Savings, Investment and Valuation of a Corporation." *Review of Economics and Statistics*, 38(1), 37-51.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **Python**: Follow ruff formatting (line-length 100, target Python 3.11)
- **TypeScript**: Use ESLint + Prettier with the project config
- **Tests**: Add tests for new engines, tools, or pipeline components
- **Engines**: Must be pure functions — no I/O, no network calls
- **Documentation**: Update relevant docs when adding new tools or engines

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io/) standard
- Frontend powered by [Next.js](https://nextjs.org/), [shadcn/ui](https://ui.shadcn.com/), and [Vercel AI SDK](https://sdk.vercel.ai/)
- Backend built with [FastAPI](https://fastapi.tiangolo.com/) and [Pydantic](https://docs.pydantic.dev/)
- LLM inference via [OpenRouter](https://openrouter.ai/) and [Groq](https://groq.com/)
