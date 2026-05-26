# Financial Agent Python SDK

Python SDK for the Financial Agent Infrastructure Platform.

## Installation

```bash
pip install financial-agent-sdk
```

## Usage

```python
from financialagent import FinancialAgent

# Initialize the client
agent = FinancialAgent(api_key="your-api-key")

# Run a skill
result = await agent.run_skill(
    "equity_research",
    company="NVDA"
)
print(result.synthesis)

# Stream a workflow
async for event in agent.stream_workflow(
    "macro_regime_detection",
    region="US"
):
    print(f"{event.type}: {event.data}")

# Don't forget to close the client when done
await agent.close()
```

Or use as an async context manager:

```python
async with FinancialAgent(api_key="your-api-key") as agent:
    result = await agent.run_skill("equity_research", company="NVDA")
    print(result.synthesis)
```

## API Reference

### FinancialAgent

Main client class for interacting with the Financial Agent Infrastructure Platform.

#### `__init__`

```python
FinancialAgent(
    api_key: Optional[str] = None,
    base_url: str = "http://localhost:8000",
    timeout: float = 30.0,
    max_retries: int = 3,
)
```

#### `run_skill`

Run a specific skill and return the result.

```python
await FinancialAgent.run_skill(
    skill_name: str,
    **kwargs: Any,
) -> SkillRunResponse
```

#### `stream_workflow`

Stream a workflow execution, yielding events as they occur.

```python
async for event in FinancialAgent.stream_workflow(
    workflow_name: str,
    **kwargs: Any,
) -> AsyncIterator[StreamEvent]
```

### Models

#### SkillRunResponse

Response from running a skill.

- `run_id`: Unique identifier for the run
- `status`: Status of the execution (success, error, etc.)
- `validation`: Validation results
- `synthesis`: Synthesized results from the skill
- `tools`: List of tools used in the execution
- `execution_time_ms`: Total execution time in milliseconds

#### StreamEvent

Event received from a streaming workflow execution.

- `type`: Type of event (status, progress, result, etc.)
- `data`: Event-specific data
- `timestamp`: Timestamp of when the event was generated