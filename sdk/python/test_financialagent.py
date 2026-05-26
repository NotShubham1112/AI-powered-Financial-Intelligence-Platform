"""
Unit tests for the Python SDK.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from financialagent import FinancialAgent
from financialagent.models import SkillRunResponse, StreamEvent


@pytest.fixture
def mock_client():
    """Create a mock HTTP client."""
    client = AsyncMock()
    return client


@pytest.fixture
def agent(mock_client):
    """Create a FinancialAgent instance with a mocked client."""
    with patch('financialagent.financialagent.httpx.AsyncClient') as mock_client_class:
        mock_client_class.return_value = mock_client
        agent = FinancialAgent(api_key="test-key")
        agent._client = mock_client
        return agent


@pytest.mark.asyncio
async def test_init():
    """Test initializing the FinancialAgent."""
    agent = FinancialAgent(api_key="test-key", base_url="https://test.example.com")
    assert agent.api_key == "test-key"
    assert agent.base_url == "https://test.example.com"
    assert agent.timeout == 30.0
    assert agent.max_retries == 3


@pytest.mark.asyncio
async def test_run_skill_success(agent, mock_client):
    """Test successful skill execution."""
    # Mock response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "run_id": "test-run-123",
        "status": "success",
        "validation": {"passed": True},
        "synthesis": {"result": "test result"},
        "tools": ["tool1", "tool2"],
        "execution_time_ms": 100
    }
    mock_response.raise_for_status.return_value = None

    mock_client.post.return_value = mock_response

    # Call the method
    result = await agent.run_skill("test_skill", param1="value1")

    # Verify
    assert isinstance(result, SkillRunResponse)
    assert result.run_id == "test-run-123"
    assert result.status == "success"
    assert result.validation == {"passed": True}
    assert result.synthesis == {"result": "test result"}
    assert result.tools == ["tool1", "tool2"]
    assert result.execution_time_ms == 100

    # Verify the request was made correctly
    mock_client.post.assert_called_once()
    args, kwargs = mock_client.post.call_args
    assert args[0] == "/skills/test_skill/run"
    assert kwargs["json"] == {"parameters": {"param1": "value1"}}


@pytest.mark.asyncio
async def test_run_skill_retry(agent, mock_client):
    """Test retry logic on server errors."""
    # First two calls return server errors, third succeeds
    mock_error_response = MagicMock()
    mock_error_response.raise_for_status.side_effect = Exception("500 Server Error")

    mock_success_response = MagicMock()
    mock_success_response.json.return_value = {
        "run_id": "test-run-123",
        "status": "success",
        "validation": None,
        "synthesis": {"result": "test result"},
        "tools": [],
        "execution_time_ms": 100
    }
    mock_success_response.raise_for_status.return_value = None

    mock_client.post.side_effect = [
        mock_error_response,
        mock_error_response,
        mock_success_response
    ]

    # Call the method
    result = await agent.run_skill("test_skill", param1="value1")

    # Verify
    assert isinstance(result, SkillRunResponse)
    assert result.run_id == "test-run-123"
    assert result.status == "success"

    # Verify retry attempts
    assert mock_client.post.call_count == 3


@pytest.mark.asyncio
async def test_stream_workflow(agent, mock_client):
    """Test streaming workflow."""
    # Mock streaming response
    async def mock_aiter_lines():
        lines = [
            'data: {"type": "status", "data": {"stage": "started"}}',
            'data: {"type": "progress", "data": {"step": 1, "total": 3}}',
            'data: {"type": "result", "data": {"output": "final result"}}',
        ]
        for line in lines:
            yield line

    mock_response = AsyncMock()
    mock_response.aiter_lines.return_value = mock_aiter_lines()
    mock_response.raise_for_status.return_value = None

    mock_client.stream.return_value.__aenter__.return_value = mock_response

    # Collect events
    events = []
    async for event in agent.stream_workflow("test_workflow", param1="value1"):
        events.append(event)

    # Verify
    assert len(events) == 3
    assert events[0].type == "status"
    assert events[0].data == {"stage": "started"}
    assert events[1].type == "progress"
    assert events[1].data == {"step": 1, "total": 3}
    assert events[2].type == "result"
    assert events[2].data == {"output": "final result"}

    # Verify the request was made correctly
    mock_client.stream.assert_called_once()
    args, kwargs = mock_client.stream.call_args
    assert args[0] == "POST"
    assert args[1] == "/workflows/test_workflow/stream"
    assert kwargs["json"] == {"parameters": {"param1": "value1"}}


if __name__ == "__main__":
    pytest.main([__file__])