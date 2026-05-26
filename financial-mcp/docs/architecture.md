# Financial MCP Server — Architecture

## Platform layers

```txt
core/
  executor/     # DAG runtime, retries, timeouts, cancellation
  memory/       # Structured observations + compression
  validators/   # Contradiction detection, confidence, flags
  providers/    # MarketDataService facade
  skills/       # Reusable multi-tool workflows
  telemetry/    # Spans + execution metrics
engines/        # Pure deterministic math (no I/O)
tools/          # MCP wrappers
orchestration/  # AgentRouter + AgentPipeline
registry/       # Tool catalog metadata
```

## Execution flow (production path)

```txt
query
  → AgentRouter (decomposition / tool ranking)
  → ExecutionDAG (dependency levels)
  → ExecutionRuntime (parallel batches, retry, timeout)
  → ResultMemoryStore (raw + compressed observations)
  → FinancialRiskValidator
  → synthesis report
```

Skills wrap the same runtime with fixed tool plans (`macro_regime_detection`, `equity_research`).

## HTTP streaming

- `POST /agent/run` — synchronous JSON result
- `POST /agent/run/stream` — SSE: `plan_ready`, `node_started`, `node_completed`, `validation`, `synthesis`, `final`
- `GET /agent/metrics` — run/tool counters

## Maturity roadmap

| Layer | Status |
|-------|--------|
| Engines | Strong |
| MCP tools | Good |
| Execution runtime | **Phase 1 — implemented** |
| Skills | **Phase 2 — foundation** |
| Financial memory | **Phase 3 — in-process store** |
| Validation | **Phase 4 — rule-based** |
| Observability | **Tracing stub + metrics** |
| Vector memory / OTEL | Planned |
| Multi-agent swarms | Planned |

## Design rules

1. Engines never fetch market data.
2. Tools validate inputs then call engines.
3. Runtime never embeds financial formulas — only invokes registry handlers.
4. Moat = execution quality + skills + validation + artifacts, not indicator count.
