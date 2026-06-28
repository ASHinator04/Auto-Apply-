from fastapi import FastAPI

from job_agent_api.config import get_settings
from job_agent_api.logging import configure_logging
from job_agent_api.schema import HealthResponse

settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(title="Job Agent API", version=settings.version)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(service=settings.service_name, status="ok", version=settings.version)


@app.get("/version", response_model=HealthResponse)
def version() -> HealthResponse:
    return HealthResponse(service=settings.service_name, status="ok", version=settings.version)
