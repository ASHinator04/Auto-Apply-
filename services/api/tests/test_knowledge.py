# pyright: reportUnknownMemberType=false, reportUnknownVariableType=false
from collections.abc import Iterator
from pathlib import Path
from typing import cast

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from job_agent_api.knowledge_repository import SQLiteKnowledgeRepository
from job_agent_api.knowledge_routes import get_knowledge_repository
from job_agent_api.main import app


@pytest.fixture
def client(tmp_path: Path) -> Iterator[TestClient]:
    database_path = tmp_path / "knowledge.sqlite3"
    app.dependency_overrides[get_knowledge_repository] = lambda: SQLiteKnowledgeRepository(
        database_path
    )
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


def test_create_list_and_persist_knowledge_entries(client: TestClient) -> None:
    personal = create_entry(
        client,
        section="personal",
        entry_type="scalar",
        title="Email",
        content="user@example.com",
    )
    professional = create_entry(
        client,
        section="professional",
        entry_type="scalar",
        title="Current Role",
        content="Software Engineer",
    )

    assert personal["id"] != professional["id"]
    assert personal["section"] == "personal"
    assert personal["entryType"] == "scalar"
    assert professional["content"] == "Software Engineer"

    listed = list_entries(client)
    assert {entry["title"] for entry in listed} == {"Email", "Current Role"}


def test_update_delete_and_missing_entries(client: TestClient) -> None:
    entry = create_entry(
        client,
        section="links",
        entry_type="scalar",
        title="GitHub",
        content="https://github.com/example",
    )

    update_response = cast(
        Response,
        client.put(
            f"/knowledge/{entry['id']}",
            json={
                "section": "links",
                "entryType": "scalar",
                "title": "Portfolio",
                "content": "https://example.com",
                "sortOrder": 2,
            },
        ),
    )
    updated = cast(dict[str, object], update_response.json())
    assert update_response.status_code == 200
    assert updated["title"] == "Portfolio"
    assert updated["sortOrder"] == 2

    delete_response = cast(Response, client.delete(f"/knowledge/{entry['id']}"))
    missing_response = cast(Response, client.delete(f"/knowledge/{entry['id']}"))

    assert delete_response.status_code == 204
    assert missing_response.status_code == 404
    assert list_entries(client) == []


def test_keyword_search_and_section_filter(client: TestClient) -> None:
    create_entry(
        client,
        section="behavioral_answers",
        entry_type="long_form",
        title="Leadership example",
        content="I led a platform migration.",
    )
    create_entry(
        client,
        section="education",
        entry_type="scalar",
        title="Degree",
        content="Computer Science",
    )
    create_entry(
        client,
        section="company_specific_answers",
        entry_type="long_form",
        title="Why this company",
        content="I like the infrastructure team.",
        company_name="Example Co",
    )

    search_response = cast(Response, client.get("/knowledge", params={"query": "platform"}))
    section_response = cast(
        Response,
        client.get("/knowledge", params={"section": "company_specific_answers"}),
    )

    searched = cast(dict[str, list[dict[str, object]]], search_response.json())["entries"]
    filtered = cast(dict[str, list[dict[str, object]]], section_response.json())["entries"]

    assert [entry["title"] for entry in searched] == ["Leadership example"]
    assert [entry["companyName"] for entry in filtered] == ["Example Co"]


def test_validation_rejects_invalid_entries(client: TestClient) -> None:
    blank_title = cast(
        Response,
        client.post(
            "/knowledge",
            json={
                "section": "personal",
                "entryType": "scalar",
                "title": "   ",
                "content": "A",
            },
        ),
    )
    missing_company = cast(
        Response,
        client.post(
            "/knowledge",
            json={
                "section": "company_specific_answers",
                "entryType": "long_form",
                "title": "Why us",
                "content": "Because the role fits.",
            },
        ),
    )
    semantic_type = cast(
        Response,
        client.post(
            "/knowledge",
            json={
                "section": "personal",
                "entryType": "semantic",
                "title": "Unsupported",
                "content": "No semantic search in Phase 2.",
            },
        ),
    )

    assert blank_title.status_code == 400
    assert blank_title.json()["detail"] == "Title is required."
    assert missing_company.status_code == 400
    assert missing_company.json()["detail"] == (
        "Company name is required for company-specific answers."
    )
    assert semantic_type.status_code == 422


def test_large_long_form_answer_is_stored(client: TestClient) -> None:
    content = "Handled a complex incident. " * 300
    entry = create_entry(
        client,
        section="behavioral_answers",
        entry_type="long_form",
        title="Failure example",
        content=content,
    )

    assert entry["content"] == content.strip()
    assert len(cast(str, entry["content"])) > 5_000


def create_entry(
    client: TestClient,
    *,
    section: str,
    entry_type: str,
    title: str,
    content: str,
    company_name: str | None = None,
) -> dict[str, object]:
    response = cast(
        Response,
        client.post(
            "/knowledge",
            json={
                "section": section,
                "entryType": entry_type,
                "title": title,
                "content": content,
                "companyName": company_name,
            },
        ),
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def list_entries(client: TestClient) -> list[dict[str, object]]:
    response = cast(Response, client.get("/knowledge"))
    assert response.status_code == 200
    payload = cast(dict[str, list[dict[str, object]]], response.json())
    return payload["entries"]
