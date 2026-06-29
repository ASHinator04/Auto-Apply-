from pathlib import Path
from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query, Response

from job_agent_api.config import get_settings
from job_agent_api.knowledge_repository import KnowledgeEntryRecord, SQLiteKnowledgeRepository
from job_agent_api.knowledge_service import KnowledgeService
from job_agent_api.schema import (
    KnowledgeEntryListResponse,
    KnowledgeEntryRequest,
    KnowledgeEntryResponse,
    KnowledgeEntryType,
    KnowledgeSection,
)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


def get_knowledge_repository() -> SQLiteKnowledgeRepository:
    settings = get_settings()
    return SQLiteKnowledgeRepository(Path(settings.database_path))


def get_knowledge_service(
    repository: Annotated[SQLiteKnowledgeRepository, Depends(get_knowledge_repository)],
) -> KnowledgeService:
    return KnowledgeService(repository)


@router.get("", response_model=KnowledgeEntryListResponse)
def list_knowledge_entries(
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
    query: Annotated[str | None, Query(max_length=120)] = None,
    section: str | None = None,
) -> KnowledgeEntryListResponse:
    return KnowledgeEntryListResponse(
        entries=[
            _to_response(record) for record in service.list_entries(query=query, section=section)
        ]
    )


@router.post("", response_model=KnowledgeEntryResponse, status_code=201)
def create_knowledge_entry(
    request: KnowledgeEntryRequest,
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
) -> KnowledgeEntryResponse:
    return _to_response(
        service.create_entry(
            section=request.section,
            entry_type=request.entry_type,
            title=request.title,
            content=request.content,
            company_name=request.company_name,
            sort_order=request.sort_order,
        )
    )


@router.put("/{entry_id}", response_model=KnowledgeEntryResponse)
def update_knowledge_entry(
    entry_id: str,
    request: KnowledgeEntryRequest,
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
) -> KnowledgeEntryResponse:
    return _to_response(
        service.update_entry(
            entry_id,
            section=request.section,
            entry_type=request.entry_type,
            title=request.title,
            content=request.content,
            company_name=request.company_name,
            sort_order=request.sort_order,
        )
    )


@router.delete("/{entry_id}", status_code=204)
def delete_knowledge_entry(
    entry_id: str,
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
) -> Response:
    service.delete_entry(entry_id)
    return Response(status_code=204)


def _to_response(record: KnowledgeEntryRecord) -> KnowledgeEntryResponse:
    return KnowledgeEntryResponse(
        id=record.id,
        section=cast(KnowledgeSection, record.section),
        entryType=cast(KnowledgeEntryType, record.entry_type),
        title=record.title,
        content=record.content,
        companyName=record.company_name,
        sortOrder=record.sort_order,
        createdAt=record.created_at,
        updatedAt=record.updated_at,
    )
