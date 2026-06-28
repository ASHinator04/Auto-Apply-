FROM python:3.13-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:0.11.17 /uv /uvx /bin/
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen || uv sync

COPY services/api/src services/api/src

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "job_agent_api.main:app", "--app-dir", "services/api/src", "--host", "0.0.0.0", "--port", "8000"]
