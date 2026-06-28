# pyright: reportUnknownMemberType=false, reportUnknownVariableType=false
from typing import cast

from fastapi.testclient import TestClient
from httpx import Response
from job_agent_api.main import app


def test_health_endpoint_returns_service_status() -> None:
    client = TestClient(app)

    response = cast(Response, client.get("/health"))
    payload = cast(dict[str, object], response.json())

    assert response.status_code == 200
    assert payload == {
        "service": "job-agent-api",
        "status": "ok",
        "version": "0.0.0",
    }
