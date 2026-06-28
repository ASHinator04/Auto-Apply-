from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"
    service_name: str = "job-agent-api"
    version: str = "0.0.0"
    database_path: str = ".job-agent/job-agent.sqlite3"
    max_resume_size_bytes: int = 5 * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="JOB_AGENT_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
