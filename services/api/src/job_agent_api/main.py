from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from job_agent_api.config import get_settings
from job_agent_api.knowledge_errors import KnowledgeEntryNotFoundError, KnowledgeValidationError
from job_agent_api.knowledge_routes import router as knowledge_router
from job_agent_api.logging import configure_logging
from job_agent_api.resume_errors import (
    PrimaryResumeRequiredError,
    ResumeNotFoundError,
    ResumeValidationError,
)
from job_agent_api.resume_routes import router as resume_router
from job_agent_api.schema import HealthResponse

settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(title="Job Agent API", version=settings.version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resume_router)
app.include_router(knowledge_router)


@app.exception_handler(ResumeValidationError)
async def resume_validation_error_handler(
    _request: Request,
    exc: ResumeValidationError,
) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(ResumeNotFoundError)
async def resume_not_found_error_handler(
    _request: Request,
    exc: ResumeNotFoundError,
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(PrimaryResumeRequiredError)
async def primary_resume_required_error_handler(
    _request: Request,
    exc: PrimaryResumeRequiredError,
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": exc.message})


@app.exception_handler(KnowledgeValidationError)
async def knowledge_validation_error_handler(
    _request: Request,
    exc: KnowledgeValidationError,
) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(KnowledgeEntryNotFoundError)
async def knowledge_not_found_error_handler(
    _request: Request,
    exc: KnowledgeEntryNotFoundError,
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(service=settings.service_name, status="ok", version=settings.version)


@app.get("/version", response_model=HealthResponse)
def version() -> HealthResponse:
    return HealthResponse(service=settings.service_name, status="ok", version=settings.version)
