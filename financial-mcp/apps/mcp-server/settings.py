from pydantic_settings import BaseSettings
from pydantic import Field, RedisDsn, PostgresDsn
from typing import Optional

class Settings(BaseSettings):
    # Server
    MCP_SERVER_NAME: str = "financial-mcp-server"
    MCP_SERVER_VERSION: str = "1.0.0"
    LOG_LEVEL: str = "INFO"

    # Redis
    REDIS_URL: RedisDsn = Field("redis://localhost:6379/0")
    
    # PostgreSQL (async)
    DATABASE_URL: PostgresDsn = Field("postgresql+asyncpg://finmcp:secret@localhost:5432/finmcp")

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Market Data API keys
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    FRED_API_KEY: Optional[str] = None
    POLYGON_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()