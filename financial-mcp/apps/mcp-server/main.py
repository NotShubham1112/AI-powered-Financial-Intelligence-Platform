import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP
from .settings import settings
from .log_config import configure_logging
from registry.loader import load_all_tools

configure_logging()
import structlog
logger = structlog.get_logger(__name__)

# Initialize FastMCP server
mcp = FastMCP(
    name=settings.MCP_SERVER_NAME,
    instructions="Institutional Financial Computation Backbone",
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Financial MCP Server...")
    # Load tool registry and register tools
    load_all_tools(mcp)
    tools = await mcp.list_tools()
    logger.info("All tools loaded", tool_count=len(tools))
    yield
    logger.info("Shutting down...")

app = FastAPI(lifespan=lifespan)

from .routes.agent import router as agent_router  # noqa: E402

app.include_router(agent_router)

# Mount MCP server SSE endpoints
app.mount("/mcp", mcp.sse_app())

# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.MCP_SERVER_VERSION}