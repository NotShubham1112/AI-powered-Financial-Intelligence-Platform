"""
Main FinancialAgent class for the Python SDK.
"""

from __future__ import annotations

import os
from typing import Any, AsyncIterator, Dict, Optional

import httpx
from pydantic import BaseModel

from .models import SkillRunResponse, StreamEvent


class FinancialAgent:
    """
    Main client for interacting with the Financial Agent Infrastructure Platform.

    Example:
        >>> agent = FinancialAgent(api_key="your-api-key")
        >>> result = await agent.run_skill("equity_research", company="NVDA")
        >>> async for event in agent.stream_workflow("macro_regime_detection"):
        ...     print(event)
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "http://localhost:8000",
        timeout: float = 30.0,
        max_retries: int = 3,
    ):
        """
        Initialize the FinancialAgent client.

        Args:
            api_key: API key for authentication. If not provided, will check
                    FINANCIAL_AGENT_API_KEY environment variable.
            base_url: Base URL of the API server.
            timeout: Request timeout in seconds.
            max_retries: Maximum number of retry attempts.
        """
        self.api_key = api_key or os.getenv("FINANCIAL_AGENT_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries

        # Initialize HTTP client
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=timeout,
            headers=self._get_headers(),
        )

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for requests."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def run_skill(
        self,
        skill_name: str,
        **kwargs: Any,
    ) -> SkillRunResponse:
        """
        Run a specific skill and return the result.

        Args:
            skill_name: Name of the skill to execute (e.g., "equity_research")
            **kwargs: Skill-specific parameters

        Returns:
            SkillRunResponse containing the skill execution result

        Example:
            >>> result = await agent.run_skill(
            ...     "equity_research",
            ...     company="NVDA",
            ...     include_financials=True
            ... )
        """
        endpoint = f"/skills/{skill_name}/run"

        # Prepare request data
        data = {
            "parameters": kwargs,
        }

        # Make request with retry logic
        for attempt in range(self.max_retries):
            try:
                response = await self._client.post(endpoint, json=data)
                response.raise_for_status()
                return SkillRunResponse(**response.json())
            except httpx.HTTPStatusError as e:
                if e.response.status_code >= 500 and attempt < self.max_retries - 1:
                    # Retry on server errors
                    continue
                raise
            except httpx.RequestError as e:
                if attempt < self.max_retries - 1:
                    # Retry on connection errors
                    continue
                raise

    async def stream_workflow(
        self,
        workflow_name: str,
        **kwargs: Any,
    ) -> AsyncIterator[StreamEvent]:
        """
        Stream a workflow execution, yielding events as they occur.

        Args:
            workflow_name: Name of the workflow to execute
            **kwargs: Workflow-specific parameters

        Yields:
            StreamEvent objects representing events in the workflow execution

        Example:
            >>> async for event in agent.stream_workflow(
            ...     "macro_regime_detection",
            ...     region="US",
            ...     time_horizon="quarterly"
            ... ):
            ...     print(f"{event.type}: {event.data}")
        """
        endpoint = f"/workflows/{workflow_name}/stream"

        # Prepare request data
        data = {
            "parameters": kwargs,
        }

        # Make streaming request
        async with self._client.stream(
            "POST", endpoint, json=data
        ) as response:
            response.raise_for_status()

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    # Parse Server-Sent Event
                    import json
                    event_data = json.loads(line[6:])  # Remove "data: " prefix
                    yield StreamEvent(**event_data)

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()

    async def __aenter__(self) -> "FinancialAgent":
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Async context manager exit."""
        await self.close()