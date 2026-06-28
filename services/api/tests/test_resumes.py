# pyright: reportUnknownMemberType=false, reportUnknownVariableType=false
from collections.abc import Iterator
from pathlib import Path
from typing import cast

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from job_agent_api.main import app
from job_agent_api.resume_repository import SQLiteResumeRepository
from job_agent_api.resume_routes import get_resume_repository


@pytest.fixture
def client(tmp_path: Path) -> Iterator[TestClient]:
    database_path = tmp_path / "resumes.sqlite3"
    app.dependency_overrides[get_resume_repository] = lambda: SQLiteResumeRepository(database_path)
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


def test_upload_list_and_persist_resumes(client: TestClient) -> None:
    first = upload_resume(client, "backend.pdf", "Backend Resume")
    second = upload_resume(client, "ml.pdf", "ML Resume")

    assert first["displayName"] == "Backend Resume"
    assert first["isPrimary"] is True
    assert first["version"] == 1
    assert second["isPrimary"] is False

    response = cast(Response, client.get("/resumes"))
    payload = cast(dict[str, list[dict[str, object]]], response.json())

    assert response.status_code == 200
    assert [resume["displayName"] for resume in payload["resumes"]] == [
        "ML Resume",
        "Backend Resume",
    ]


def test_rename_replace_and_primary_switching(client: TestClient) -> None:
    first = upload_resume(client, "backend.pdf", "Backend Resume")
    second = upload_resume(client, "research.pdf", "Research Resume")

    rename_response = cast(
        Response,
        client.patch(f"/resumes/{first['id']}", json={"displayName": "Platform Resume"}),
    )
    renamed = cast(dict[str, object], rename_response.json())
    assert rename_response.status_code == 200
    assert renamed["displayName"] == "Platform Resume"
    assert renamed["originalFilename"] == "backend.pdf"

    replace_response = cast(
        Response,
        client.put(
            f"/resumes/{first['id']}/file",
            files={"file": ("platform.pdf", pdf_bytes(), "application/pdf")},
        ),
    )
    replaced = cast(dict[str, object], replace_response.json())
    assert replace_response.status_code == 200
    assert replaced["id"] == first["id"]
    assert replaced["originalFilename"] == "platform.pdf"
    assert replaced["version"] == 2

    primary_response = cast(Response, client.put(f"/resumes/{second['id']}/primary"))
    primary = cast(dict[str, object], primary_response.json())
    assert primary_response.status_code == 200
    assert primary["isPrimary"] is True

    listed = cast(dict[str, list[dict[str, object]]], cast(Response, client.get("/resumes")).json())
    primary_resumes = [resume for resume in listed["resumes"] if resume["isPrimary"] is True]
    assert [resume["id"] for resume in primary_resumes] == [second["id"]]


def test_delete_prevents_primary_gap(client: TestClient) -> None:
    primary = upload_resume(client, "primary.pdf", "Primary Resume")
    replacement = upload_resume(client, "secondary.pdf", "Secondary Resume")

    blocked = cast(Response, client.delete(f"/resumes/{primary['id']}"))
    assert blocked.status_code == 409
    assert blocked.json()["detail"] == "Choose another primary resume before deleting this one."

    deleted = cast(
        Response,
        client.delete(
            f"/resumes/{primary['id']}",
            params={"replacementPrimaryId": replacement["id"]},
        ),
    )
    assert deleted.status_code == 204

    listed = cast(dict[str, list[dict[str, object]]], cast(Response, client.get("/resumes")).json())
    assert len(listed["resumes"]) == 1
    assert listed["resumes"][0]["id"] == replacement["id"]
    assert listed["resumes"][0]["isPrimary"] is True


def test_validation_rejects_invalid_uploads(client: TestClient) -> None:
    invalid_extension = cast(
        Response,
        client.post(
            "/resumes",
            files={"file": ("resume.txt", pdf_bytes(), "application/pdf")},
        ),
    )
    invalid_mime = cast(
        Response,
        client.post(
            "/resumes",
            files={"file": ("resume.pdf", pdf_bytes(), "text/plain")},
        ),
    )
    too_large = cast(
        Response,
        client.post(
            "/resumes",
            files={"file": ("resume.pdf", b"%PDF" + b"x" * (5 * 1024 * 1024), "application/pdf")},
        ),
    )

    assert invalid_extension.status_code == 400
    assert invalid_mime.status_code == 400
    assert too_large.status_code == 400


def test_duplicate_names_are_allowed_for_user_control(client: TestClient) -> None:
    first = upload_resume(client, "first.pdf", "Backend Resume")
    second = upload_resume(client, "second.pdf", "Backend Resume")

    assert first["displayName"] == second["displayName"]
    assert first["id"] != second["id"]


def upload_resume(client: TestClient, filename: str, display_name: str) -> dict[str, object]:
    response = cast(
        Response,
        client.post(
            "/resumes",
            data={"displayName": display_name},
            files={"file": (filename, pdf_bytes(), "application/pdf")},
        ),
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def pdf_bytes() -> bytes:
    return b"%PDF-1.4\n%%EOF"
