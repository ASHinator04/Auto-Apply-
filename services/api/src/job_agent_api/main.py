from fastapi import FastAPI
from pydantic import BaseModel

from job_agent_api.config import get_settings
from job_agent_api.logging import configure_logging

settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(title="Job Agent API", version=settings.version)


class HealthResponse(BaseModel):
    service: str
    status: str
    version: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(service=settings.service_name, status="ok", version=settings.version)


@app.get("/version", response_model=HealthResponse)
def version() -> HealthResponse:
    return HealthResponse(service=settings.service_name, status="ok", version=settings.version)
