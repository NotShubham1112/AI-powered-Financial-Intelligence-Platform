"""
Data models for the Python SDK API responses.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SkillRunResponse(BaseModel):
    """Response from running a skill."""

    run_id: str = Field(..., description="Unique identifier for the run")
    status: str = Field(..., description="Status of the execution (success, error, etc.)")
    validation: Optional[Dict[str, Any]] = Field(
        None, description="Validation results"
    )
    synthesis: Optional[Dict[str, Any]] = Field(
        None, description="Synthesized results from the skill"
    )
    tools: List[str] = Field(
        default_factory=list, description="List of tools used in the execution"
    )
    execution_time_ms: Optional[int] = Field(
        None, description="Total execution time in milliseconds"
    )


class StreamEvent(BaseModel):
    """Event received from a streaming workflow execution."""

    type: str = Field(..., description="Type of event (status, progress, result, etc.)")
    data: Dict[str, Any] = Field(
        default_factory=dict, description="Event-specific data"
    )
    timestamp: Optional[str] = Field(
        None, description="Timestamp of when the event was generated"
    )